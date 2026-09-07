import ComandaModel from '../Models/ComandaModel.js';
import UsuarioModel from '../Models/UsuarioModel.js';
import CashSessionsModel from '../Models/CashSessionsModel.js';
import { Op } from 'sequelize';

/**
 * Obtener todas las comandas activas (excluyendo facturadas y canceladas)
 */
export const getComandas = async (req, res) => {
  try {
    const { cash_session_id } = req.query;

    const whereClause = {
      status: {
        [Op.notIn]: ['facturada', 'cancelada']
      }
    };

    if (cash_session_id) {
      const numericSession = Number(cash_session_id);
      if (Number.isInteger(numericSession) && numericSession > 0) {
        whereClause.cash_session_id = numericSession;
      }
    }

    const comandas = await ComandaModel.findAll({
      where: whereClause,
      include: [
        {
          model: UsuarioModel,
          as: 'usuario',
          attributes: ['id', 'nombre', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(comandas);
  } catch (error) {
    console.error('Error al obtener comandas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener comandas', error: error.message });
  }
};

/**
 * Crear una nueva comanda
 */
export const createComanda = async (req, res) => {
  try {
    let { name, status = 'pendiente', comanda_data, user_id, cash_session_id } = req.body;

    if (!name || !comanda_data) {
      return res.status(400).json({ message: 'El nombre y los datos de la comanda son requeridos' });
    }

    name = String(name).trim();
    if (!name) {
      return res.status(400).json({ message: 'El nombre de la comanda no puede estar vacío' });
    }

    // Normalizar user_id: aceptar req.usuario o req.user, descartar ids offline/inválidos
    let finalUserId = user_id ?? req.usuario?.id ?? req.user?.id ?? null;
    finalUserId = Number(finalUserId);
    if (!Number.isInteger(finalUserId) || finalUserId <= 0) {
      finalUserId = null;
    }

    // Normalizar cash_session_id: solo enteros positivos (BIGINT). UUIDs offline -> null
    let finalCashSessionId = cash_session_id ?? null;
    if (typeof finalCashSessionId === 'string' && !/^\d+$/.test(finalCashSessionId)) {
      finalCashSessionId = null;
    } else if (finalCashSessionId !== null && finalCashSessionId !== undefined) {
      finalCashSessionId = Number(finalCashSessionId);
      if (!Number.isInteger(finalCashSessionId) || finalCashSessionId <= 0) {
        finalCashSessionId = null;
      }
    } else {
      finalCashSessionId = null;
    }

    // Asegurar que comanda_data sea objeto y contenga nombre/usuario para el modal e impresión
    if (typeof comanda_data === 'string') {
      try { comanda_data = JSON.parse(comanda_data); } catch { comanda_data = {}; }
    }
    if (comanda_data && typeof comanda_data === 'object' && !Array.isArray(comanda_data)) {
      if (!comanda_data.name) comanda_data.name = name;
      if (!comanda_data.createdAt) comanda_data.createdAt = new Date().toISOString();
    }

    const newComanda = await ComandaModel.create({
      name,
      status,
      comanda_data,
      user_id: finalUserId,
      cash_session_id: finalCashSessionId
    });

    const comandaConUsuario = await ComandaModel.findByPk(newComanda.id, {
      include: [
        {
          model: UsuarioModel,
          as: 'usuario',
          attributes: ['id', 'nombre', 'username']
        }
      ]
    });

    res.status(201).json(comandaConUsuario);
  } catch (error) {
    console.error('Error al crear comanda:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear comanda', error: error.message });
  }
};

/**
 * Actualizar el estado de una comanda (pendiente -> en_preparacion -> entregado -> facturada)
 */
export const updateComandaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pendiente', 'en_preparacion', 'entregado', 'facturada', 'cancelada'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Estado no válido: ${status}` });
    }

    const comanda = await ComandaModel.findByPk(id);
    if (!comanda) {
      return res.status(404).json({ message: 'Comanda no encontrada' });
    }

    comanda.status = status;
    await comanda.save();

    const updated = await ComandaModel.findByPk(comanda.id, {
      include: [{ model: UsuarioModel, as: 'usuario', attributes: ['id', 'nombre', 'username'] }]
    });

    res.status(200).json({ message: 'Estado de comanda actualizado con éxito', comanda: updated || comanda });
  } catch (error) {
    console.error('Error al actualizar estado de comanda:', error);
    res.status(500).json({ message: 'Error al actualizar el estado de la comanda', error: error.message });
  }
};

/**
 * Actualizar contenido completo de una comanda
 */
export const updateComanda = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, comanda_data } = req.body;

    const comanda = await ComandaModel.findByPk(id);
    if (!comanda) {
      return res.status(404).json({ message: 'Comanda no encontrada' });
    }

    if (name) comanda.name = String(name).trim() || comanda.name;
    if (status) comanda.status = status;
    if (comanda_data) comanda.comanda_data = comanda_data;

    await comanda.save();

    const updatedFull = await ComandaModel.findByPk(comanda.id, {
      include: [{ model: UsuarioModel, as: 'usuario', attributes: ['id', 'nombre', 'username'] }]
    });

    res.status(200).json({ message: 'Comanda actualizada con éxito', comanda: updatedFull || comanda });
  } catch (error) {
    console.error('Error al actualizar comanda:', error);
    res.status(500).json({ message: 'Error al actualizar comanda', error: error.message });
  }
};

/**
 * Eliminar / Anular comanda
 */
export const deleteComanda = async (req, res) => {
  try {
    const { id } = req.params;

    const comanda = await ComandaModel.findByPk(id);
    if (!comanda) {
      return res.status(404).json({ message: 'Comanda no encontrada' });
    }

    await comanda.destroy();

    res.status(200).json({ message: 'Comanda eliminada con éxito', id: parseInt(id) });
  } catch (error) {
    console.error('Error al eliminar comanda:', error);
    res.status(500).json({ message: 'Error al eliminar comanda', error: error.message });
  }
};
