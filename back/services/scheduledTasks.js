import cron from 'node-cron';
import { CashSessionsModel, UsuarioModel, SaleModel, RoleModel, StockModel } from '../database/associations.js';
import { logAudit } from '../middleware/auditMiddleware.js';
import { Op } from 'sequelize';
import db from '../database/db.js';
import { checkLowStockAndLog } from '../controllers/Controller.js'; // Importar la función helper

// Helper para obtener un user_id válido para auditorías del sistema
const getSystemUserId = async () => {
    let systemUser = null;
    try {
        // Intentar encontrar un usuario administrador
        systemUser = await UsuarioModel.findOne({
            include: [{
                model: RoleModel,
                as: 'rol',
                where: { nombre: 'Administrador' }
            }]
        });
        if (systemUser) {
            return systemUser.id;
        }

        // Si no hay administrador, intentar encontrar cualquier usuario
        systemUser = await UsuarioModel.findOne();
        if (systemUser) {
            return systemUser.id;
        }

        // Si no se encuentra ningún usuario, usar un ID por defecto y loguear una advertencia
        console.warn('⚠️ No se encontró ningún usuario en la base de datos para auditorías del sistema. Usando user_id: 1.');
        return 1; // Fallback a ID 1
    } catch (error) {
        console.error('❌ Error al obtener user_id del sistema para auditorías:', error);
        return 1; // En caso de error, fallback a ID 1
    }
};

// Función para cerrar automáticamente las sesiones de caja a medianoche
const autoCloseCashSessions = async () => {
    const systemUserId = await getSystemUserId();
    try {
        //console.log('🕛 Iniciando cierre automático de sesiones de caja...');

        // Buscar todas las sesiones abiertas
        const openSessions = await CashSessionsModel.findAll({
            where: {
                status: 'abierta'
            },
            include: [
                {
                    model: UsuarioModel,
                    attributes: ['id', 'username'],
                    include: [{
                        model: RoleModel,
                        as: 'rol',
                        attributes: ['nombre']
                    }]
                }
            ]
        });

        if (openSessions.length === 0) {
            //console.log('✅ No hay sesiones abiertas para cerrar');
            return;
        }

        //console.log(`📋 Encontradas ${openSessions.length} sesiones abiertas para cerrar`);

        for (const session of openSessions) {
            try {
                // Calcular totales de ventas para esta sesión
                const salesData = await SaleModel.findAll({
                    where: {
                        cash_session_id: session.id
                    },
                    attributes: [
                        [db.fn('SUM', db.col('total_neto')), 'total_sales'],
                        [db.fn('SUM', db.col('promotion_discount')), 'total_discounts']
                    ]
                });

                const total_sales = salesData[0]?.dataValues?.total_sales || 0;
                const total_discounts = salesData[0]?.dataValues?.total_discounts || 0;

                // Calcular monto de cierre estimado (apertura + ventas)
                const estimated_closing = parseFloat(session.opening_amount) + parseFloat(total_sales);

                // Actualizar la sesión con cierre automático usando los campos correctos del modelo
                await session.update({
                    cashier_declared_amount: estimated_closing,
                    admin_verified_amount: estimated_closing,
                    total_sales,
                    total_sales_at_close: total_sales,
                    total_discounts,
                    closed_at_user: new Date(),
                    verified_at: new Date(),
                    status: 'cerrada',
                    verified_by_admin_id: systemUserId,
                    notes: `Cierre automático a medianoche. Monto estimado: ${estimated_closing}. Requiere verificación manual.`
                });

                // Registrar auditoría del cierre automático
                await logAudit({
                    user_id: systemUserId, // Usar el ID del usuario del sistema
                    action: 'AUTO_CLOSE_CASH_SESSION',
                    entity_type: 'cash_session',
                    entity_id: session.id,
                    old_values: {
                        status: 'abierta'
                    },
                    new_values: {
                        cashier_declared_amount: estimated_closing,
                        admin_verified_amount: estimated_closing,
                        total_sales,
                        total_sales_at_close: total_sales,
                        status: 'cerrada',
                        verified_at: new Date()
                    },
                    ip_address: '127.0.0.1',
                    user_agent: 'System Scheduler'
                });

                //console.log(`✅ Sesión cerrada automáticamente: Usuario ${session.Usuario?.username} (ID: ${session.id})`);

            } catch (sessionError) {
                console.error(`❌ Error al cerrar sesión ${session.id}:`, sessionError);

                // Registrar el error en auditoría
                await logAudit({
                    user_id: systemUserId, // Usar el ID del usuario del sistema
                    action: 'AUTO_CLOSE_ERROR',
                    entity_type: 'cash_session',
                    entity_id: session.id,
                    details: `Error en cierre automático: ${sessionError.message}`,
                    ip_address: '127.0.0.1',
                    user_agent: 'System Scheduler'
                });
            }
        }

        //console.log('🎉 Proceso de cierre automático completado');

    } catch (error) {
        console.error('❌ Error en el proceso de cierre automático:', error);

        // Registrar error general en auditoría
        await logAudit({
            user_id: systemUserId, // Usar el ID del usuario del sistema
            action: 'AUTO_CLOSE_SYSTEM_ERROR',
            entity_type: 'system',
            entity_id: null,
            details: `Error crítico en cierre automático: ${error.message}`,
            ip_address: '127.0.0.1',
            user_agent: 'System Scheduler'
        });
    }
};

// Función para limpiar logs de auditoría antiguos (opcional)
const cleanOldAuditLogs = async () => {
    try {
        //console.log('🧹 Limpiando logs de auditoría antiguos...');

        // Eliminar logs de más de 30 días
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30);

        const deletedCount = await db.query(
            'DELETE FROM audit_logs WHERE createdAt < ?',
            {
                replacements: [cutoffDate],
                type: db.QueryTypes.DELETE
            }
        );

        //console.log(`🗑️ Eliminados ${deletedCount} logs de auditoría antiguos`);

    } catch (error) {
        console.error('❌ Error al limpiar logs antiguos:', error);
    }
};

// Tarea programada para verificar stock bajo
const checkAllStocksForLowAlerts = async () => {
    const systemUserId = await getSystemUserId();
    const transaction = await db.transaction();
    try {
        //console.log('📦 Ejecutando tarea programada de verificación de stock bajo...');
        const allStocks = await StockModel.findAll();
        for (const stock of allStocks) {
            // Reutilizar la función checkLowStockAndLog del controlador
            await checkLowStockAndLog(stock.id, systemUserId, transaction);
        }
        await transaction.commit();
        //console.log('✅ Verificación de stock bajo completada.');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Error en la tarea programada de verificación de stock bajo:', error);
        await logAudit({
            user_id: systemUserId,
            action: 'LOW_STOCK_ALERT_SYSTEM_ERROR',
            entity_type: 'system',
            entity_id: null,
            details: `Error crítico en la tarea programada de stock bajo: ${error.message}`,
            ip_address: '127.0.0.1',
            user_agent: 'System Scheduler'
        });
    }
};

// Configurar tareas programadas
export const initScheduledTasks = () => {
    //console.log('⏰ Inicializando tareas programadas...');

    // Cierre automático de sesiones a medianoche (00:00)
    cron.schedule('0 0 * * *', () => {
        //console.log('🕛 Ejecutando cierre automático de sesiones de caja...');
        autoCloseCashSessions();
    }, {
        timezone: "America/Buenos_Aires"
    });

    // Limpieza de logs antiguos cada domingo a las 2:00 AM
    cron.schedule('0 2 * * 0', () => {
        //console.log('🧹 Ejecutando limpieza de logs antiguos...');
        cleanOldAuditLogs();
    }, {
        timezone: "America/Buenos_Aires"
    });

    // Tarea de verificación cada hora para detectar sesiones muy largas (más de 12 horas)
    cron.schedule('0 * * * *', async () => {
        const systemUserId = await getSystemUserId(); // Obtener el ID del usuario del sistema
        try {
            const twelveHoursAgo = new Date();
            twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

            const longSessions = await CashSessionsModel.findAll({
                where: {
                    status: 'abierta',
                    opened_at: {
                        [Op.lt]: twelveHoursAgo
                    }
                },
                include: [
                    {
                        model: UsuarioModel,
                        attributes: ['username'],
                        include: [{
                            model: RoleModel,
                            as: 'rol',
                            attributes: ['nombre']
                        }]
                    }
                ]
            });

            if (longSessions.length > 0) {
                //console.log(`⚠️ Detectadas ${longSessions.length} sesiones abiertas por más de 12 horas`);

                for (const session of longSessions) {
                    await logAudit({
                        user_id: systemUserId, // Usar el ID del usuario del sistema
                        action: 'ALERTA_SESION_PROLONGADA',
                        entity_type: 'cash_session',
                        entity_id: session.id,
                        details: `La sesión ha estado abierta por más de 12 horas - Usuario: ${session.Usuario?.username}`,
                        ip_address: '127.0.0.1',
                        user_agent: 'System Monitor'
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error en verificación de sesiones largas:', error);
        }
    }, {
        timezone: "America/Buenos_Aires"
    });

    // Tarea programada de verificación de stock bajo (una vez al día a la 1:00 AM)
    cron.schedule('0 1 * * *', async () => {
        await checkAllStocksForLowAlerts();
    }, {
        timezone: "America/Buenos_Aires"
    });

    //console.log('✅ Tareas programadas configuradas:');
    //console.log('   - Cierre automático: Todos los días a las 00:00');
    //console.log('   - Limpieza de logs: Domingos a las 02:00');
    //console.log('   - Verificación de sesiones: Cada hora');
    //console.log('   - Verificación de stock bajo: Todos los días a la 01:00 AM');
};

// Función para ejecutar cierre manual (para testing)
export const manualAutoClose = autoCloseCashSessions;

export default {
    initScheduledTasks,
    manualAutoClose
};