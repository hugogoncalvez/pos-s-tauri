import StockCategoryModel from '../Models/StockCategoriesModel.js';
import StockModel from '../Models/StocksModel.js';
import PurchaseModel from '../Models/PurchasesModel.js';
import UnitModel from '../Models/UnitsModel.js';
import PurchasesDetailsModel from '../Models/PurchasesDetailsModel.js';
import SaleModel from '../Models/SalesModel.js';
import SaleDetailModel from '../Models/SalesDetailsModel.js';
import CustomerModel from '../Models/CustomersModel.js';
import PaymentModel from '../Models/PaymentModel.js';
import PromotionModel from '../Models/PromotionsModel.js';
import SalePaymentModel from '../Models/SalePaymentModel.js'; // Importar el nuevo modelo
import UsuarioModel from '../Models/UsuarioModel.js';
import RoleModel from '../Models/RoleModel.js';
import CashSessionsModel from '../Models/CashSessionsModel.js';
import AuditLogModel from '../Models/AuditLogModel.js';
import CustomerPaymentsModel from '../Models/CustomerPaymentsModel.js';
import SupplierModel from '../Models/SuppliersModel.js';

import CashSessionMovementModel from '../Models/CashSessionMovementModel.js';
import ThemeSettingModel from '../Models/ThemeSettingModel.js';
import PendingTicketModel from '../Models/PendingTicketModel.js';
import { ProductPresentationsModel } from '../Models/ProductPresentationsModel.js';
import { ProductPromotionsModel } from '../Models/ProductPromotionsModel.js';
import ComboModel from '../Models/ComboModel.js';
import { ComboItem } from '../Models/ComboItemModel.js';
import UserPermissionModel from '../Models/UserPermissionModel.js';
import PermissionModel from '../Models/PermissionModel.js';


StockCategoryModel.hasMany(StockModel, { foreignKey: 'category_id' });
StockModel.belongsTo(StockCategoryModel, { foreignKey: 'category_id' });

PurchaseModel.hasMany(PurchasesDetailsModel, { foreignKey: 'purchasesId', as: 'details' }); // Una compra puede tener muchas compras detalles
PurchasesDetailsModel.belongsTo(PurchaseModel, { foreignKey: 'purchasesId' }); // Una compra detalle pertenece a una compra

StockModel.hasMany(PurchasesDetailsModel, { foreignKey: 'stock_id' }); // Un stock puede tener muchas compras
PurchasesDetailsModel.belongsTo(StockModel, { foreignKey: 'stock_id' }); // Una compra pertenece a un stock

UnitModel.hasMany(StockModel, { foreignKey: 'units_id' }); // Una unidad puede tener muchas compras
StockModel.belongsTo(UnitModel, { foreignKey: 'units_id' }); // Una stock pertenece a una unidad


// --- Asociaciones de Ventas ---

// Sales <-> SalesDetails (One-to-Many)
SaleModel.hasMany(SaleDetailModel, { foreignKey: 'sales_Id' }); // FK en SalesDetailsModel
SaleDetailModel.belongsTo(SaleModel, { foreignKey: 'sales_Id' });

// Sales <-> Customers (Many-to-One)
CustomerModel.hasMany(SaleModel, { foreignKey: 'customer_id' }); // FK en SalesModel
SaleModel.belongsTo(CustomerModel, { foreignKey: 'customer_id' });

// Sales <-> SalePayments (One-to-Many)
SaleModel.hasMany(SalePaymentModel, { foreignKey: 'sale_id' });
SalePaymentModel.belongsTo(SaleModel, { foreignKey: 'sale_id' });

// SalePayments <-> Payment (Many-to-One)
PaymentModel.hasMany(SalePaymentModel, { foreignKey: 'payment_method_id' });
SalePaymentModel.belongsTo(PaymentModel, { foreignKey: 'payment_method_id', as: 'payment' });

// Sales <-> Users (UsuarioModel) (Many-to-One)
UsuarioModel.hasMany(SaleModel, { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' }); // FK en SalesModel
SaleModel.belongsTo(UsuarioModel, { foreignKey: 'user_id' });

// SalesDetails <-> Stocks (Many-to-One)
StockModel.hasMany(SaleDetailModel, { foreignKey: 'stock_id' }); // FK en SalesDetailsModel
SaleDetailModel.belongsTo(StockModel, { foreignKey: 'stock_id' });

// SalesDetails <-> Combos (Many-to-One)
SaleDetailModel.belongsTo(ComboModel, { foreignKey: 'combo_id' });
ComboModel.hasMany(SaleDetailModel, { foreignKey: 'combo_id' });

// SalesDetails <-> Promotions (Many-to-One)
PromotionModel.hasMany(SaleDetailModel, { foreignKey: 'promotion_id' }); // FK en SalesDetailsModel
SaleDetailModel.belongsTo(PromotionModel, { foreignKey: 'promotion_id' });

// --- Asociaciones de Sesiones de Caja ---

// CashSessions <-> Users (Many-to-One)
UsuarioModel.hasMany(CashSessionsModel, { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' }); // FK en CashSessionsModel
CashSessionsModel.belongsTo(UsuarioModel, { foreignKey: 'user_id' });

// CashSessions <-> Sales (One-to-Many)
CashSessionsModel.hasMany(SaleModel, { foreignKey: 'cash_session_id' });
SaleModel.belongsTo(CashSessionsModel, { foreignKey: 'cash_session_id' });

// CashSessions <-> CashSessionMovements (One-to-Many)
CashSessionsModel.hasMany(CashSessionMovementModel, { foreignKey: 'cash_session_id', as: 'movements' });
CashSessionMovementModel.belongsTo(CashSessionsModel, { foreignKey: 'cash_session_id' });

// CashSessionMovements <-> Users (Many-to-One)
UsuarioModel.hasMany(CashSessionMovementModel, { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
CashSessionMovementModel.belongsTo(UsuarioModel, { foreignKey: 'user_id' });

// --- Asociaciones de Tickets Pendientes ---
PendingTicketModel.belongsTo(UsuarioModel, { foreignKey: 'user_id' });
UsuarioModel.hasMany(PendingTicketModel, { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

PendingTicketModel.belongsTo(CashSessionsModel, { foreignKey: 'cash_session_id' });
CashSessionsModel.hasMany(PendingTicketModel, { foreignKey: 'cash_session_id' });


// --- Asociaciones de Auditoría ---

// AuditLog <-> Users (Many-to-One)
UsuarioModel.hasMany(AuditLogModel, { foreignKey: 'user_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' }); // FK en AuditLogModel
AuditLogModel.belongsTo(UsuarioModel, { foreignKey: 'user_id' });

// AuditLog <-> Stock (Many-to-One, for alerts related to stock)
StockModel.hasMany(AuditLogModel, { foreignKey: 'entity_id', constraints: false, scope: { entity_type: 'stock' } });
AuditLogModel.belongsTo(StockModel, { foreignKey: 'entity_id', as: 'stockItem', constraints: false });

// Usuario <-> Role (Many-to-One)
RoleModel.hasMany(UsuarioModel, { foreignKey: 'rol_id', as: 'usuarios' });
UsuarioModel.belongsTo(RoleModel, { foreignKey: 'rol_id', as: 'rol' });

// --- Asociaciones de Permisos Dinámicos ---

// Usuario <-> UserPermission (One-to-Many)
UsuarioModel.hasMany(UserPermissionModel, { foreignKey: 'user_id', as: 'permission_overrides', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
UserPermissionModel.belongsTo(UsuarioModel, { foreignKey: 'user_id' });

// Permission <-> UserPermission (One-to-Many)
PermissionModel.hasMany(UserPermissionModel, { foreignKey: 'permission_id', as: 'user_overrides' });
UserPermissionModel.belongsTo(PermissionModel, { foreignKey: 'permission_id', as: 'permiso' });


// --- Asociaciones de Pagos de Clientes ---

// CustomerPayments <-> Customers (Many-to-One)
CustomerModel.hasMany(CustomerPaymentsModel, { foreignKey: 'customer_id', as: 'payments' }); // FK en CustomerPaymentsModel
CustomerPaymentsModel.belongsTo(CustomerModel, { foreignKey: 'customer_id', as: 'customer' });

// Suppliers <-> Stocks (One-to-Many)
SupplierModel.hasMany(StockModel, { foreignKey: 'supplier_id' });
StockModel.belongsTo(SupplierModel, { foreignKey: 'supplier_id' });

// --- NUEVAS ASOCIACIONES PARA UNIDADES DE VENTA Y PROMOCIONES ---

// Stock <-> ProductPresentations (One-to-Many)
StockModel.hasMany(ProductPresentationsModel, { foreignKey: 'stock_id', as: 'presentations' });
ProductPresentationsModel.belongsTo(StockModel, { foreignKey: 'stock_id', as: 'stock' });

// Stock <-> Promotions (Many-to-Many through ProductPromotions)
StockModel.belongsToMany(PromotionModel, {
  through: ProductPromotionsModel,
  foreignKey: 'stock_id',
  otherKey: 'promotion_id',
  as: 'stocks'
});
PromotionModel.belongsToMany(StockModel, {
  through: ProductPromotionsModel,
  foreignKey: 'promotion_id',
  otherKey: 'stock_id',
  as: 'stocks'
});

// ProductPresentations <-> Promotions (Many-to-Many through ProductPromotions)
ProductPresentationsModel.belongsToMany(PromotionModel, {
  through: ProductPromotionsModel,
  foreignKey: 'presentation_id',
  otherKey: 'promotion_id',
  as: 'presentations'
});
PromotionModel.belongsToMany(ProductPresentationsModel, {
  through: ProductPromotionsModel,
  foreignKey: 'promotion_id',
  otherKey: 'presentation_id',
  as: 'presentations'
});

// Promotion <-> ProductPromotions (One-to-Many)
PromotionModel.hasMany(ProductPromotionsModel, { foreignKey: 'promotion_id' });
ProductPromotionsModel.belongsTo(PromotionModel, { foreignKey: 'promotion_id' });

// ProductPresentations <-> ProductPromotions (One-to-Many)
ProductPresentationsModel.hasMany(ProductPromotionsModel, { foreignKey: 'presentation_id' });
ProductPromotionsModel.belongsTo(ProductPresentationsModel, { foreignKey: 'presentation_id' });


// Combo <-> ComboItem (One-to-Many)
ComboModel.hasMany(ComboItem, { foreignKey: 'combo_id', as: 'combo_items' });
ComboItem.belongsTo(ComboModel, { foreignKey: 'combo_id', as: 'combo' });

// ComboItem <-> Stock (Many-to-One)
StockModel.hasMany(ComboItem, { foreignKey: 'stock_id', as: 'combo_components' });
ComboItem.belongsTo(StockModel, { foreignKey: 'stock_id', as: 'stock' });

// ComboItem <-> ProductPresentations (Many-to-One) - Optional, if combo item can be a specific presentation
ProductPresentationsModel.hasMany(ComboItem, { foreignKey: 'component_presentation_id', as: 'combo_component_presentations' });
ComboItem.belongsTo(ProductPresentationsModel, { foreignKey: 'component_presentation_id', as: 'component_presentation' });

export {
  StockCategoryModel, StockModel, PurchaseModel, PurchasesDetailsModel, UnitModel,
  SaleModel, SaleDetailModel, CustomerModel, PaymentModel, PromotionModel, UsuarioModel,
  CashSessionsModel, AuditLogModel, CustomerPaymentsModel, SupplierModel, RoleModel, SalePaymentModel,
  CashSessionMovementModel, ThemeSettingModel, PendingTicketModel, ProductPresentationsModel, ProductPromotionsModel,
  ComboModel, ComboItem, UserPermissionModel, PermissionModel
};