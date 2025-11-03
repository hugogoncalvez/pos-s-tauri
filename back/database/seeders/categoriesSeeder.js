import { StockCategoryModel } from '../../Models/StockCategoriesModel.js';

const categories = [
  { name: 'Lácteos' },
  { name: 'Panadería' },
  { name: 'Bebidas' },
  { name: 'Snacks' },
  { name: 'Carnes' },
  { name: 'Frutas y Verduras' },
  { name: 'Limpieza' },
  { name: 'Perfumería' },
  { name: 'Congelados' },
  { name: 'General' }, // Asegurarse de que 'General' exista
];

export const categoriesSeeder = async () => {
  try {
    for (const category of categories) {
      await StockCategoryModel.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });
    }
    //console.log('Categorías sembradas exitosamente.');
  } catch (error) {
    console.error('Error al sembrar categorías:', error);
  }
};