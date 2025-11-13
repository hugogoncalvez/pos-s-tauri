// back/services/fiscal/fiscalJobScheduler.js

import PendingFiscalJobsModel from '../../Models/PendingFiscalJobsModel.js';
import FiscalInvoicesModel from '../../Models/FiscalInvoicesModel.js';
import FiscalLogModel from '../../Models/FiscalLogModel.js';
import SaleModel from '../../Models/SalesModel.js';
import PointOfSaleModel from '../../Models/PointOfSaleModel.js';
import FiscalManager from './FiscalManager.js';
import FiscalError from './FiscalError.js';

const MAX_RETRIES = 5; // Maximum number of attempts for a job

export const processPendingFiscalJobs = async () => {
    console.log('[FiscalJobScheduler] Iniciando procesamiento de trabajos fiscales pendientes...');

    try {
        const pendingJobs = await PendingFiscalJobsModel.findAll({
            where: { status: 'PENDING' },
            include: [
                { model: SaleModel },
                { model: PointOfSaleModel }
            ]
        });

        for (const job of pendingJobs) {
            console.log(`[FiscalJobScheduler] Procesando trabajo #${job.id} para venta ${job.sale_id}...`);

            // Update job status to PROCESSING to avoid duplicate processing
            await job.update({ status: 'PROCESSING', attempts: job.attempts + 1, last_attempt_at: new Date() });

            try {
                const { saleId, pointOfSaleId, voucherData } = job.job_data;

                // Re-fetch sale and point of sale in case they were updated/deleted
                const sale = await SaleModel.findByPk(saleId);
                const pointOfSale = await PointOfSaleModel.findByPk(pointOfSaleId);

                if (!sale || !pointOfSale) {
                    await job.update({
                        status: 'FAILED',
                        last_error: 'Venta o Punto de Venta no encontrados durante el reintento.',
                    });
                    await FiscalLogModel.create({
                        level: 'ERROR',
                        source: 'SCHEDULER',
                        message: `Trabajo fiscal #${job.id} falló: Venta o Punto de Venta no encontrados.`,
                        reference_id: job.id,
                        metadata: { jobData: job.job_data },
                    });
                    continue; // Move to next job
                }

                const fiscalManager = new FiscalManager(pointOfSale);
                const fiscalResponse = await fiscalManager.generateFiscalVoucher(voucherData);

                // Log successful fiscal operation
                await FiscalLogModel.create({
                    level: 'INFO',
                    source: pointOfSale.emission_type === 'FACTURA_ELECTRONICA' ? 'AFIP' : 'PRINTER',
                    message: `Comprobante fiscal generado exitosamente (reintento) para la venta ${sale.id}.`,
                    reference_id: sale.id,
                    metadata: fiscalResponse,
                });

                // Create FiscalInvoice record
                await FiscalInvoicesModel.create({
                    sale_id: sale.id,
                    point_of_sale_id: pointOfSale.id,
                    emission_method: pointOfSale.emission_type,
                    invoice_type: voucherData.voucherType,
                    invoice_number: fiscalResponse.CbteDesde || fiscalResponse.ticketNumber,
                    cae: fiscalResponse.CAE || null,
                    cae_due_date: fiscalResponse.CAEFchVto ? new Date(fiscalResponse.CAEFchVto.slice(0, 4), fiscalResponse.CAEFchVto.slice(4, 6) - 1, fiscalResponse.CAEFchVto.slice(6, 8)) : null,
                    afip_response_data: pointOfSale.emission_type === 'FACTURA_ELECTRONICA' ? fiscalResponse : null,
                    fiscal_printer_data: pointOfSale.emission_type === 'CONTROLADOR_FISCAL' ? fiscalResponse : null,
                    status: 'EMITIDO',
                });

                // Mark job as completed
                await job.update({ status: 'COMPLETED', last_error: null });
                console.log(`[FiscalJobScheduler] Trabajo #${job.id} completado exitosamente.`);

            } catch (error) {
                const errorMessage = error.message || 'Error desconocido';
                const isRecoverable = error instanceof FiscalError &&
                                      error.code !== 'INVALID_POS_DATA' &&
                                      error.code !== 'UNSUPPORTED_EMISSION_TYPE';

                if (job.attempts >= MAX_RETRIES || !isRecoverable) {
                    // Mark as FAILED if max retries reached or error is not recoverable
                    await job.update({ status: 'FAILED', last_error: errorMessage });
                    await FiscalLogModel.create({
                        level: 'ERROR',
                        source: 'SCHEDULER',
                        message: `Trabajo fiscal #${job.id} falló definitivamente después de ${job.attempts} intentos: ${errorMessage}`,
                        reference_id: job.id,
                        metadata: {
                            jobData: job.job_data,
                            error: errorMessage,
                            stack: error.stack,
                            ...(error instanceof FiscalError && { fiscalErrorCode: error.code, fiscalErrorSource: error.source, fiscalErrorMetadata: error.metadata })
                        },
                    });
                    console.error(`[FiscalJobScheduler] Trabajo #${job.id} falló definitivamente: ${errorMessage}`);
                } else {
                    // Revert status to PENDING for another retry
                    await job.update({ status: 'PENDING', last_error: errorMessage });
                    await FiscalLogModel.create({
                        level: 'WARN',
                        source: 'SCHEDULER',
                        message: `Trabajo fiscal #${job.id} falló (reintento ${job.attempts}/${MAX_RETRIES}): ${errorMessage}`,
                        reference_id: job.id,
                        metadata: {
                            jobData: job.job_data,
                            error: errorMessage,
                            stack: error.stack,
                            ...(error instanceof FiscalError && { fiscalErrorCode: error.code, fiscalErrorSource: error.source, fiscalErrorMetadata: error.metadata })
                        },
                    });
                    console.warn(`[FiscalJobScheduler] Trabajo #${job.id} falló, reintentando más tarde: ${errorMessage}`);
                }
            }
        }
    } catch (globalError) {
        console.error('[FiscalJobScheduler] Error global al procesar trabajos pendientes:', globalError);
        await FiscalLogModel.create({
            level: 'CRITICAL',
            source: 'SCHEDULER',
            message: `Error crítico en el scheduler de trabajos fiscales: ${globalError.message}`,
            metadata: { error: globalError.message, stack: globalError.stack },
        });
    }
    console.log('[FiscalJobScheduler] Finalizado procesamiento de trabajos fiscales pendientes.');
};
