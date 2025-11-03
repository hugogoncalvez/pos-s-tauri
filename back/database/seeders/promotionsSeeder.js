import { PromotionsModel } from '../associations.js';

export const seedPromotions = async () => {
  try {
    // Verificar si la promoción por defecto ya existe
    const defaultPromotion = await PromotionsModel.findByPk(1);

    if (!defaultPromotion) {
      // Si no existe, la creamos
      await PromotionsModel.create({
        id: 1,
        name: 'Sin Promoción',
        description: 'Promoción por defecto para productos sin una oferta específica.',
        type: 'descuento_fijo', // Un tipo genérico, ya que el valor es 0
        discount_value: 0,
        start_date: new Date('2000-01-01'),
        end_date: new Date('2999-12-31'),
        active: true,
        // Sequelize manejará createdAt y updatedAt
      });
      //console.log('Promoción por defecto creada exitosamente.');
    } else {
      //console.log('La promoción por defecto ya existe.');
    }
  } catch (error) {
    console.error('Error al crear la promoción por defecto:', error);
  }
};
