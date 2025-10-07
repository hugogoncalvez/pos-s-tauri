# ************************************************************
# Antares - SQL Client
# Version 0.7.35
# 
# https://antares-sql.app/
# https://github.com/antares-sql/antares
# 
# Host: 127.0.0.1 ((Ubuntu) 8.0.43)
# Database: PosSystem
# Generation time: 2025-09-23T10:53:33-03:00
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
SET NAMES utf8mb4;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table ThemeSettings
# ------------------------------------------------------------

DROP TABLE IF EXISTS `ThemeSettings`;

CREATE TABLE `ThemeSettings` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `ThemeSettings` WRITE;
/*!40000 ALTER TABLE `ThemeSettings` DISABLE KEYS */;

INSERT INTO `ThemeSettings` (`key`, `value`, `createdAt`, `updatedAt`) VALUES
	("activeTheme", "{\"dark\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#b45587ff\"},\"contained\":{\"main\":\"#a4326fff\"}},\"common\":{\"backdropOverlay\":\"#1e1d1dff\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#822956ff\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cf6da5ff\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#023133ff\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#b50345ff\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#023133ff\",\"#06686cff\"],\"direction\":\"135deg\"}}},\"light\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#6a6969\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#6aa47b\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#cc6f75ff\",\"dialog\":\"#d9d7d7\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#d9d8d8\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#84b7cf\"],\"direction\":\"135deg\"}}}}", "2025-08-13 15:10:19", "2025-09-22 14:17:50");

/*!40000 ALTER TABLE `ThemeSettings` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table audit_logs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `audit_logs`;

CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `entity_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=797 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table cash_session_movements
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cash_session_movements`;

CREATE TABLE `cash_session_movements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cash_session_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('ingreso','egreso') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cash_session_id` (`cash_session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `cash_session_movements_ibfk_1` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cash_session_movements_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table cash_sessions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cash_sessions`;

CREATE TABLE `cash_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `opening_amount` decimal(10,2) NOT NULL,
  `cashier_declared_amount` decimal(10,2) DEFAULT NULL,
  `total_sales` decimal(10,2) DEFAULT NULL,
  `total_discounts` decimal(10,2) DEFAULT NULL,
  `opened_at` datetime NOT NULL,
  `closed_at` datetime DEFAULT NULL,
  `status` enum('abierta','pendiente_cierre','cerrada') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT 'abierta',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `preliminary_discrepancy` decimal(10,2) DEFAULT '0.00',
  `closed_by_user_id` int DEFAULT NULL,
  `closed_at_user` datetime DEFAULT NULL,
  `admin_verified_amount` decimal(10,2) DEFAULT NULL,
  `final_discrepancy` decimal(10,2) DEFAULT '0.00',
  `verified_by_admin_id` int DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `total_sales_at_close` decimal(10,2) DEFAULT '0.00',
  `admin_notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  PRIMARY KEY (`id`),
  KEY `cash_sessions_ibfk_1` (`user_id`),
  KEY `fk_closed_by_user` (`closed_by_user_id`),
  KEY `fk_verified_by_admin` (`verified_by_admin_id`),
  CONSTRAINT `cash_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_closed_by_user` FOREIGN KEY (`closed_by_user_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_verified_by_admin` FOREIGN KEY (`verified_by_admin_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table combo_items
# ------------------------------------------------------------

DROP TABLE IF EXISTS `combo_items`;

CREATE TABLE `combo_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `combo_id` bigint NOT NULL,
  `stock_id` int DEFAULT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `component_presentation_id` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `combo_id` (`combo_id`),
  KEY `stock_id` (`stock_id`),
  KEY `component_presentation_id` (`component_presentation_id`),
  CONSTRAINT `combo_items_ibfk_1` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `combo_items_ibfk_2` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `combo_items_ibfk_3` FOREIGN KEY (`component_presentation_id`) REFERENCES `product_presentations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table combos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `combos`;

CREATE TABLE `combos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `barcode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table customer_payments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `customer_payments`;

CREATE TABLE `customer_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `cash_session_id` bigint DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'efectivo',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  `created_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `fk_customer_payments_cash_session` (`cash_session_id`),
  CONSTRAINT `customer_payments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_customer_payments_cash_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table customers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `dni` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `discount_percentage` decimal(5,2) NOT NULL DEFAULT '0.00',
  `credit_limit` decimal(10,2) NOT NULL DEFAULT '0.00',
  `debt` decimal(10,2) NOT NULL DEFAULT '0.00',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `dni` (`dni`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table landing_elementos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `landing_elementos`;

CREATE TABLE `landing_elementos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `orden` int DEFAULT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `imagen` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `navegar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `landing_elementos` WRITE;
/*!40000 ALTER TABLE `landing_elementos` DISABLE KEYS */;

INSERT INTO `landing_elementos` (`id`, `nombre`, `orden`, `descripcion`, `imagen`, `navegar`, `createdAt`, `updatedAt`) VALUES
	(1, "Ventas", 0, "Gestionar el proceso de ventas y transacciones.", "ventas.png", "/ventas", "2025-07-10 12:40:25", "2025-07-10 12:40:25"),
	(2, "Stock", 3, "Administrar el inventario de productos y existencias.", "stock.png", "/stock", "2025-07-10 12:40:25", "2025-07-10 12:40:25"),
	(3, "Clientes", 4, "Gestionar a los clientes y su historial.", "customers.png", "/clientes", "2025-07-10 12:40:25", "2025-07-10 12:40:25"),
	(4, "Caja", 1, "Controlar las operaciones de caja.", "cajero.png", "/caja", "2025-07-10 12:40:25", "2025-07-10 12:40:25"),
	(5, "Compras", 2, "Registrar y gestionar las compras a proveedores.", "compras.png", "/compras", "2025-07-10 12:40:25", "2025-07-10 12:40:25"),
	(8, "DashBoard", 5, "Ver Informes, Estadísticas, Configurar Usuarios.", "dashboard.png", "/dashboard", "2025-07-10 12:40:25", "2025-07-10 12:40:25");

/*!40000 ALTER TABLE `landing_elementos` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table landing_permisos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `landing_permisos`;

CREATE TABLE `landing_permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `landing_elemento_id` int NOT NULL,
  `permiso_id` int NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_landing_permission` (`landing_elemento_id`,`permiso_id`),
  KEY `fk_landing_permisos_permiso` (`permiso_id`),
  CONSTRAINT `fk_landing_permisos_elemento` FOREIGN KEY (`landing_elemento_id`) REFERENCES `landing_elementos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_landing_permisos_permiso` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla pivote para asociar múltiples permisos a una tarjeta del landing.';

LOCK TABLES `landing_permisos` WRITE;
/*!40000 ALTER TABLE `landing_permisos` DISABLE KEYS */;

INSERT INTO `landing_permisos` (`id`, `landing_elemento_id`, `permiso_id`, `createdAt`, `updatedAt`) VALUES
	(1, 1, 40, "2025-09-14 13:24:44", "2025-09-14 13:24:44"),
	(2, 2, 41, "2025-09-14 13:24:44", "2025-09-14 13:24:44"),
	(3, 3, 42, "2025-09-14 13:24:44", "2025-09-14 13:24:44"),
	(4, 4, 43, "2025-09-14 13:24:44", "2025-09-14 13:24:44"),
	(5, 5, 44, "2025-09-14 13:24:44", "2025-09-14 13:24:44"),
	(6, 8, 45, "2025-09-14 13:24:44", "2025-09-14 13:24:44");

/*!40000 ALTER TABLE `landing_permisos` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table payments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `payments`;

CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `method` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `surcharge_active` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Indica si el recargo está activo',
  `surcharge_percentage` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'Porcentaje de recargo a aplicar',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;

INSERT INTO `payments` (`id`, `method`, `description`, `active`, `surcharge_active`, `surcharge_percentage`, `createdAt`, `updatedAt`) VALUES
	(1, "Efectivo", "Pago en efectivo", 1, 0, 0, "2025-07-11 11:19:32", "2025-07-11 11:19:32"),
	(2, "Mercado Pago", "Transferencia o QR.", 1, 1, 6, "2025-07-18 00:00:00", "2025-09-17 11:23:55"),
	(3, "Mixto", "Efectivo - Otro medio de Pago", 1, 0, 0, "2025-07-18 00:00:00", "2025-07-18 00:00:00"),
	(4, "Tarjeta", "Pago con tarjeta de débito o crédito", 1, 1, 4, "2025-07-11 11:19:32", "2025-09-20 14:17:06"),
	(6, "Credito", "Ventas a Credito", 1, 0, 4, "2025-07-22 00:00:00", "2025-09-20 14:16:55");

/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table pending_tickets
# ------------------------------------------------------------

DROP TABLE IF EXISTS `pending_tickets`;

CREATE TABLE `pending_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL COMMENT 'Un nombre descriptivo para el ticket pendiente, ej: Mesa 5',
  `ticket_data` json NOT NULL COMMENT 'Objeto JSON con todos los datos de la venta temporal (productos, cliente, etc.)',
  `user_id` int NOT NULL,
  `cash_session_id` bigint NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pending_tickets_user_id_idx` (`user_id`),
  KEY `fk_pending_tickets_cash_session_id_idx` (`cash_session_id`),
  CONSTRAINT `fk_pending_tickets_cash_session_id` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`),
  CONSTRAINT `fk_pending_tickets_user_id` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Almacena tickets de venta que se guardan para ser completados más tarde.';





# Dump of table permisos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `permisos`;

CREATE TABLE `permisos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  `modulo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;

INSERT INTO `permisos` (`id`, `nombre`, `descripcion`, `modulo`, `createdAt`, `updatedAt`) VALUES
	(1, "accion_crear_venta", "Permite procesar y guardar nuevas ventas.", "Ventas", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(2, "accion_cancelar_venta", "Permite cancelar ventas existentes.", "Ventas", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(3, "accion_aplicar_descuento", "Permite aplicar descuentos a las ventas.", "Ventas", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(4, "listar_ventas_historial", "Permite ver el historial de todas las ventas.", "Ventas", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(5, "accion_abrir_caja", "Permite iniciar una nueva sesión de caja.", "Caja", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(6, "accion_cerrar_caja_propia", "Permite cerrar la sesión de caja propia.", "Caja", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(7, "listar_movimientos_caja", "Permite ver los movimientos de la caja actual.", "Caja", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(8, "ver_cajas_admin", "Permite ver y administrar todas las cajas.", "Caja", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(9, "accion_crear_producto", "Permite agregar nuevos productos al inventario.", "Productos", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(10, "accion_editar_producto", "Permite modificar productos existentes.", "Productos", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(11, "accion_eliminar_producto", "Permite eliminar productos del inventario.", "Productos", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(12, "listar_productos", "Permite visualizar la lista de productos.", "Productos", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(13, "listar_stock", "Permite ver los niveles de stock actuales.", "Stock", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(14, "accion_ajustar_stock", "Permite realizar ajustes manuales de stock.", "Stock", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(15, "accion_crear_cliente", "Permite registrar nuevos clientes.", "Clientes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(16, "accion_editar_cliente", "Permite modificar la información de clientes.", "Clientes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(17, "ver_clientes", "Permite visualizar la lista de clientes.", "Clientes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(18, "accion_crear_proveedor", "Permite registrar nuevos proveedores.", "Proveedores", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(19, "accion_editar_proveedor", "Permite modificar la información de proveedores.", "Proveedores", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(20, "listar_proveedores", "Permite visualizar la lista de proveedores.", "Proveedores", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(21, "ver_vista_informes", "Permite el acceso a la página de Informes.", "Reportes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(22, "listar_reportes_stock", "Permite acceder a los reportes de stock.", "Reportes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(23, "accion_exportar_reportes", "Permite exportar los reportes a diferentes formatos.", "Reportes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(24, "accion_crear_usuario", "Permite crear nuevos usuarios en el sistema.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(25, "accion_editar_usuario", "Permite modificar usuarios existentes.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(26, "accion_eliminar_usuario", "Permite eliminar usuarios del sistema.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(27, "ver_vista_usuarios", "Permite el acceso a la página de Gestión de Usuarios.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(28, "ver_vista_auditoria", "Permite el acceso a la página de Logs de Auditoría.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(30, "listar_medios_pago", "Permite ver la lista de métodos de pago disponibles.", "Configuración", "2025-07-21 08:59:44", "2025-07-21 08:59:44"),
	(31, "accion_importar_stock", "Permite realizar la importación masiva de productos.", "Stock", "2025-07-21 09:17:17", "2025-07-21 09:17:17"),
	(32, "ver_vista_editor_tema", "Permite el acceso a la página de configuración de Tema.", "Configuración", "2025-08-11 18:39:27", "2025-08-11 18:39:27"),
	(34, "ver_vista_promociones", "Permite el acceso a la página de Gestión de Promociones.", "Promociones", "2025-08-22 09:43:36", "2025-08-22 09:43:36"),
	(35, "ver_vista_combos", "Permite el acceso a la página de Gestión de Combos.", "Combos", "2025-08-22 12:44:01", "2025-08-22 12:44:01"),
	(36, "ver_vista_impresion_codigos", "Permite el acceso a la página de Impresión de Códigos de Barras.", "", "2025-08-24 17:49:57", "2025-08-24 17:49:57"),
	(40, "ver_vista_ventas", "Permite el acceso a la página de Ventas.", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(41, "ver_vista_stock", "Permite el acceso a la página de Gestión de Stock.", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(42, "ver_vista_clientes", "Permite el acceso a la página de Gestión de Clientes.", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(43, "ver_vista_caja_admin", "Permite el acceso a la página de Administración de Cajas.", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(44, "ver_vista_compras", "Permite el acceso a la página de Gestión de Compras.", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(45, "ver_vista_dashboard", "Permite el acceso a la página del Dashboard.", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(46, "listar_presentaciones", "Permite visualizar las presentaciones de productos.", "Productos", "2025-09-13 20:35:07", "2025-09-13 20:35:07"),
	(47, "ver_mi_caja", "Permite el acceso a la vista personal /mi-caja", "Caja", "2025-09-14 12:58:31", "2025-09-14 12:58:31"),
	(48, "listar_clientes", "Permite obtener la lista de clientes para buscadores y autocompletado", "Clientes", "2025-09-14 12:58:31", "2025-09-14 12:58:31"),
	(49, "accion_cerrar_caja_ajena", "Permite a un admin/gerente cerrar la caja de otro usuario.", "Caja", "2025-09-14 12:58:31", "2025-09-14 12:58:31"),
	(50, "accion_registrar_movimiento_caja", "Permite registrar ingresos/egresos en una caja abierta.", "Caja", "2025-09-14 12:58:31", "2025-09-14 12:58:31"),
	(51, "accion_crear_compra", "Permite registrar nuevas compras a proveedores.", "Compras", "2025-09-14 12:58:31", "2025-09-14 12:58:31"),
	(52, "accion_registrar_pago_cliente", "Permite registrar pagos a la deuda de un cliente.", "Clientes", "2025-09-14 12:58:31", "2025-09-14 12:58:31"),
	(53, "listar_combos", "Permite obtener la lista de combos para la venta.", "Ventas", "2025-09-14 12:58:31", "2025-09-14 12:58:31"),
	(54, "listar_promociones", "Permite obtener la lista de promociones para la venta.", "Ventas", "2025-09-14 12:58:31", "2025-09-14 12:58:31"),
	(55, "accion_gestionar_roles", "Permite gestionar roles y asignar permisos.", "Usuarios", "2025-09-15 08:28:37", "2025-09-15 08:28:37"),
	(56, "accion_eliminar_cliente", "Permite eliminar clientes del sistema.", "Clientes", "2025-09-16 20:51:57", "2025-09-16 20:51:57"),
	(57, "ver_vista_recargos_pagos", "Permite el acceso a la página de Gestión de Recargos", "Configuracion", "2025-09-17 08:09:02", "2025-09-17 08:09:02"),
	(58, "accion_gestionar_recargos_pagos", "Permite editar la configuración de recargos por forma de pago", "Configuracion", "2025-09-17 08:09:02", "2025-09-17 08:09:02"),
	(59, "accion_gestionar_promociones", NULL, "Promociones", "2025-09-19 08:42:19", "2025-09-19 08:42:19"),
	(60, "accion_gestionar_combos", NULL, "Combos", "2025-09-19 08:48:17", "2025-09-19 08:48:17"),
	(61, "accion_editar_tema", "Permite guardar los cambios de apariencia realizados en el Editor de Temas.", "Dashboard", "2025-09-19 10:18:55", "2025-09-21 13:11:53"),
	(62, "ver_informe_productos_mas_vendidos", "Permite ver la tabla de productos más vendidos en el Dashboard.", "Reportes", "2025-09-21 12:23:25", "2025-09-21 12:23:25"),
	(63, "ver_informe_stock_bajo", "Permite ver la tarjeta de alertas de stock bajo en el Dashboard.", "Reportes", "2025-09-21 12:31:03", "2025-09-21 12:31:03"),
	(64, "ver_widget_compras_hoy", "Permite ver la tarjeta de Compras de Hoy en el Dashboard.", "Reportes", "2025-09-21 12:33:24", "2025-09-21 12:33:24"),
	(65, "ver_widget_total_clientes", "Permite ver la tarjeta con el total de Clientes en el Dashboard.", "Reportes", "2025-09-21 12:34:27", "2025-09-21 12:34:27"),
	(66, "ver_widget_total_proveedores", "Permite ver la tarjeta con el total de Proveedores en el Dashboard.", "Reportes", "2025-09-21 12:35:42", "2025-09-21 12:35:42");

/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table product_presentations
# ------------------------------------------------------------

DROP TABLE IF EXISTS `product_presentations`;

CREATE TABLE `product_presentations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stock_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL COMMENT 'Nombre de la presentación, ej: "Docena", "Media Horma", "Pack de 6"',
  `quantity_in_base_units` decimal(10,3) NOT NULL COMMENT 'Cuántas unidades base contiene esta presentación. Ej: 12 para una docena.',
  `price` decimal(10,2) NOT NULL COMMENT 'El precio de venta de esta presentación específica.',
  `barcode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL COMMENT 'Código de barras opcional para esta presentación específica.',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode_UNIQUE` (`barcode`),
  KEY `fk_presentations_stock_idx` (`stock_id`),
  CONSTRAINT `fk_presentations_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla para almacenar las diferentes formas en que se vende un producto.';





# Dump of table product_promotions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `product_promotions`;

CREATE TABLE `product_promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `promotion_id` bigint DEFAULT NULL,
  `stock_id` int DEFAULT NULL,
  `presentation_id` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `promotion_id` (`promotion_id`),
  KEY `stock_id` (`stock_id`),
  KEY `presentation_id` (`presentation_id`),
  CONSTRAINT `product_promotions_ibfk_1` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_promotions_ibfk_2` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_promotions_ibfk_3` FOREIGN KEY (`presentation_id`) REFERENCES `product_presentations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table promotions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `promotions`;

CREATE TABLE `promotions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `type` enum('BOGO','PERCENT_DISCOUNT_ON_NTH','FIXED_PRICE_ON_NTH') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `discount_value` decimal(10,2) DEFAULT NULL,
  `required_quantity` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table purchases
# ------------------------------------------------------------

DROP TABLE IF EXISTS `purchases`;

CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factura` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `supplier` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table purchases_details
# ------------------------------------------------------------

DROP TABLE IF EXISTS `purchases_details`;

CREATE TABLE `purchases_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchasesId` int DEFAULT NULL,
  `stock_id` int DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `cost` decimal(10,3) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `purchasesId` (`purchasesId`),
  KEY `stock_id` (`stock_id`),
  CONSTRAINT `purchases_details_ibfk_1` FOREIGN KEY (`purchasesId`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `purchases_details_ibfk_2` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table roles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  `activo` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `activo`, `createdAt`, `updatedAt`) VALUES
	(1, "Administrador", "Acceso completo a todas las funciones del sistema.", 1, "2025-07-12 15:11:16", "2025-07-16 11:19:07"),
	(2, "Gerente", "Gestión de operaciones, personal y reportes avanzados.", 1, "2025-07-12 15:11:16", "2025-07-16 11:19:07"),
	(3, "Cajero", "Acceso limitado a operaciones de venta y gestión de su propia caja.", 1, "2025-07-12 15:11:16", "2025-07-16 11:19:07");

/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table roles_permisos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `roles_permisos`;

CREATE TABLE `roles_permisos` (
  `rol_id` int NOT NULL,
  `permiso_id` int NOT NULL,
  PRIMARY KEY (`rol_id`,`permiso_id`),
  KEY `idx_rol_id` (`rol_id`),
  KEY `idx_permiso_id` (`permiso_id`),
  CONSTRAINT `roles_permisos_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `roles_permisos_ibfk_2` FOREIGN KEY (`permiso_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `roles_permisos` WRITE;
/*!40000 ALTER TABLE `roles_permisos` DISABLE KEYS */;

INSERT INTO `roles_permisos` (`rol_id`, `permiso_id`) VALUES
	(1, 1),
	(1, 2),
	(1, 3),
	(1, 4),
	(1, 5),
	(1, 6),
	(1, 7),
	(1, 8),
	(1, 9),
	(1, 10),
	(1, 11),
	(1, 12),
	(1, 13),
	(1, 14),
	(1, 15),
	(1, 16),
	(1, 17),
	(1, 18),
	(1, 19),
	(1, 20),
	(1, 21),
	(1, 22),
	(1, 23),
	(1, 24),
	(1, 25),
	(1, 26),
	(1, 27),
	(1, 28),
	(1, 30),
	(1, 31),
	(1, 32),
	(1, 34),
	(1, 35),
	(1, 36),
	(1, 40),
	(1, 41),
	(1, 42),
	(1, 43),
	(1, 44),
	(1, 45),
	(1, 46),
	(1, 47),
	(1, 48),
	(1, 49),
	(1, 50),
	(1, 51),
	(1, 52),
	(1, 53),
	(1, 54),
	(1, 55),
	(1, 56),
	(1, 57),
	(1, 58),
	(1, 59),
	(1, 60),
	(1, 61),
	(1, 62),
	(1, 63),
	(1, 64),
	(1, 65),
	(1, 66),
	(2, 1),
	(2, 2),
	(2, 3),
	(2, 4),
	(2, 5),
	(2, 6),
	(2, 7),
	(2, 9),
	(2, 10),
	(2, 11),
	(2, 12),
	(2, 13),
	(2, 14),
	(2, 15),
	(2, 16),
	(2, 18),
	(2, 19),
	(2, 20),
	(2, 21),
	(2, 22),
	(2, 23),
	(2, 28),
	(2, 30),
	(2, 31),
	(2, 32),
	(2, 34),
	(2, 35),
	(2, 36),
	(2, 40),
	(2, 41),
	(2, 42),
	(2, 43),
	(2, 44),
	(2, 45),
	(2, 46),
	(2, 47),
	(2, 48),
	(2, 49),
	(2, 50),
	(2, 51),
	(2, 52),
	(2, 53),
	(2, 54),
	(2, 56),
	(2, 57),
	(2, 58),
	(2, 62),
	(2, 63),
	(2, 64),
	(2, 65),
	(2, 66),
	(3, 1),
	(3, 5),
	(3, 12),
	(3, 40),
	(3, 48),
	(3, 50),
	(3, 53),
	(3, 54);

/*!40000 ALTER TABLE `roles_permisos` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table sale_payments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sale_payments`;

CREATE TABLE `sale_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sale_id` bigint NOT NULL,
  `payment_method_id` bigint NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sale_payments_sale_id` (`sale_id`),
  KEY `fk_sale_payments_payment_method_id` (`payment_method_id`),
  CONSTRAINT `fk_sale_payments_payment_method_id` FOREIGN KEY (`payment_method_id`) REFERENCES `payments` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_sale_payments_sale_id` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table sales
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sales`;

CREATE TABLE `sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `total_amount` decimal(10,2) NOT NULL COMMENT 'Total bruto de la venta (suma de subtotales de detalles)',
  `promotion_discount` decimal(10,2) DEFAULT '0.00' COMMENT 'Descuento total aplicado por promociones',
  `surcharge_amount` decimal(10,2) DEFAULT '0.00' COMMENT 'Monto del recargo aplicado',
  `total_neto` decimal(10,2) NOT NULL COMMENT 'Total final a pagar (total_amount - promotion_discount + surcharge_amount)',
  `customer_id` bigint NOT NULL COMMENT 'FK a la tabla customers',
  `user_id` int NOT NULL COMMENT 'FK a la tabla users (cajero que realizó la venta)',
  `cash_session_id` bigint DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `user_id` (`user_id`),
  KEY `fk_sales_cash_session` (`cash_session_id`),
  CONSTRAINT `fk_sales_cash_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sales_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla para registrar las cabeceras de las ventas';





# Dump of table sales_details
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sales_details`;

CREATE TABLE `sales_details` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `sales_Id` bigint NOT NULL COMMENT 'FK a la tabla sales',
  `stock_id` int DEFAULT NULL COMMENT 'FK a la tabla \n      stocks. Puede ser nulo si el item es un combo.',
  `combo_id` bigint DEFAULT NULL,
  `promotion_id` bigint DEFAULT NULL,
  `quantity` decimal(10,3) NOT NULL,
  `price` decimal(10,3) NOT NULL COMMENT 'Precio unitario del producto al momento de la venta',
  `cost` decimal(10,2) NOT NULL COMMENT 'Costo del \n     producto al momento de la venta',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sales_Id` (`sales_Id`),
  KEY `stock_id` (`stock_id`),
  KEY `sales_details_ibfk_3` (`promotion_id`),
  KEY `fk_sales_details_combo_id` (`combo_id`),
  CONSTRAINT `fk_sales_details_combo_id` FOREIGN KEY (`combo_id`) REFERENCES `combos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `sales_details_ibfk_1` FOREIGN KEY (`sales_Id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sales_details_ibfk_2` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `sales_details_ibfk_3` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla para registrar los detalles (productos) de cada venta';





# Dump of table sessions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `session_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;





# Dump of table stockCategories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `stockCategories`;

CREATE TABLE `stockCategories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `stockCategories` WRITE;
/*!40000 ALTER TABLE `stockCategories` DISABLE KEYS */;

INSERT INTO `stockCategories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES
	(1, "General", "Artículos varios que no encajan en otras categorías \n      específicas.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(2, "Lácteos", "Productos derivados de la leche, como quesos, yogures y \n      mantequillas.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(3, "Panadería", "Artículos frescos de pan y bollería, ideales para el \n      desayuno o merienda.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(4, "Bebidas", "Variedad de líquidos para hidratarse: aguas, refrescos, \n      jugos y más.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(5, "Snacks", "Aperitivos y golosinas para disfrutar entre comidas o en \n      cualquier momento.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(6, "Carnes y Embutidos", "Cortes frescos de res, cerdo, pollo y otras aves para tus \n      comidas principales.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(7, "Frutas y Verduras", "Productos frescos de la huerta, esenciales para \n      una dieta equilibrada.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(8, "Limpieza", "Artículos para mantener tu hogar impecable y \n      desinfectado.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(9, "Perfumería", "Productos de cuidado personal y fragancias para el día a\n      día.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(10, "Congelados", "Alimentos que requieren refrigeración extrema para su \n      conservación.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(21, "Fiambres y Quesos", "Fiembres y quesos en general", "2025-09-02 00:00:00", "2025-09-02 00:00:00"),
	(22, "Art. de Libreria", "Artículos de libreria, útiles escolares", "2025-09-02 00:00:00", "2025-09-02 00:00:00"),
	(23, "Art. de Bazar", "Utencillos de cocina, reposteria, etc.", "2025-09-02 00:00:00", "2025-09-02 00:00:00"),
	(24, "Alimentos Secos", "Arroz, pastas, legumbres, harinas, azúcar, sal, aceites y otros básicos no perecederos para tu cocina diaria.", "2025-09-23 00:00:00", "2025-09-23 00:00:00"),
	(25, "Enlatados y Conservas", "Alimentos enlatados o envasados al vacío: atún, salsas, vegetales, sopas y más, listos para consumir o cocinar.", "2025-09-23 00:00:00", "2025-09-23 00:00:00"),
	(26, "Mascotas", "Alimentos, snacks y accesorios básicos para perros, gatos y otras mascotas del hogar.", "2025-09-23 07:34:49", "2025-09-23 07:34:49"),
	(27, "Condimentos y Sazonadores", "Salsas, especias, aderezos, vinagres, mostazas y todo lo necesario para dar sabor a tus comidas.", "2025-09-23 07:35:14", "2025-09-23 07:35:14");

/*!40000 ALTER TABLE `stockCategories` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table stocks
# ------------------------------------------------------------

DROP TABLE IF EXISTS `stocks`;

CREATE TABLE `stocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barcode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `tipo_venta` enum('unitario','pesable') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'unitario',
  `cost` decimal(10,2) DEFAULT NULL,
  `stock` decimal(10,3) NOT NULL DEFAULT '0.000',
  `min_stock` decimal(10,2) DEFAULT NULL,
  `units_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  `visible` int DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `category_id` (`category_id`),
  KEY `units_id` (`units_id`),
  CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `stocks_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `stockCategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `stocks_ibfk_3` FOREIGN KEY (`units_id`) REFERENCES `units` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;

INSERT INTO `stocks` (`id`, `barcode`, `name`, `description`, `price`, `tipo_venta`, `cost`, `stock`, `min_stock`, `units_id`, `category_id`, `supplier_id`, `visible`, `createdAt`, `updatedAt`) VALUES
	(19, NULL, "Vinchas Tela C/Dorado", "Descripción de Vinchas Tela C/Dorado", 2000, "unitario", 0, 10000, 0, 1, 9, 8, 1, "2025-09-23 10:52:36", "2025-09-23 10:52:36"),
	(20, "77983392551127", "Cerveza Pampa Ipa 473ml", "Descripción de Cerveza Pampa Ipa 473ml", 2000, "unitario", 0, 10000, 0, 1, 4, 15, 1, "2025-09-23 10:52:36", "2025-09-23 10:52:36");

/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table suppliers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `suppliers`;

CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `cuit` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `telefono` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;

INSERT INTO `suppliers` (`id`, `nombre`, `cuit`, `telefono`, `createdAt`, `updatedAt`) VALUES
	(1, "- Sin Departamento -", NULL, NULL, "2025-07-15 22:15:41", "2025-07-15 22:15:41"),
	(8, "paraguay", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(9, "yenny", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(10, "multimax", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(11, "fema comestibles", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(12, "yaguar", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(13, "central", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(14, "serenisima", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(15, "cocacola", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(16, "almuzara", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(17, "quilmes", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(18, "nestle", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(19, "aconcagua", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(20, "bamama", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(21, "nacionales", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(22, "brasil", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(23, "secco", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(24, "litoral", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(25, "verdana", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(26, "don anibal", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(27, "san geronimo", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(28, "vimer", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(29, "don lopez", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(30, "planeta dulce", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(31, "esperanza blanca", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(32, "soychu", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(33, "distrinea", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(34, "oscar", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(35, "don carlos", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(36, "sapo", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(37, "gama", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(38, "mundo dulce", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(39, "p dulce", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(40, "placita", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(41, "cabalgata", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(42, "mercado", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(43, "manaos", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(44, "alfonsina", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(45, "san jose", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(46, "com com", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(47, "makro", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(48, "dist king", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(49, "logex", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(50, "maxiconsumo", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(51, "king", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(52, "concordia", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(53, "sancor", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(54, "bamana", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(55, "poceres", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(56, "ramonda", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(57, "aloha", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(58, "casona", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(59, "ilolay", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(60, "benessere", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(61, "fema lacteos", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(62, "mar", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(63, "grupo posadas", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(64, "groposadas", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(65, "kimar", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(66, "hogar", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(67, "quesos", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(68, "gramix", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(69, "distnea", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(70, "arcor", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(71, "logex pepsico", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47"),
	(72, "guposadas", NULL, NULL, "2025-09-23 10:14:47", "2025-09-23 10:14:47");

/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table units
# ------------------------------------------------------------

DROP TABLE IF EXISTS `units`;

CREATE TABLE `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `abreviatura` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `units` WRITE;
/*!40000 ALTER TABLE `units` DISABLE KEYS */;

INSERT INTO `units` (`id`, `name`, `abreviatura`, `createdAt`, `updatedAt`) VALUES
	(1, "Unidad", "un", "2025-07-11 11:19:32", "2025-07-11 11:19:32"),
	(2, "Kilogramo", "kg", "2025-07-11 11:19:32", "2025-07-11 11:19:32");

/*!40000 ALTER TABLE `units` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table user_permissions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_permissions`;

CREATE TABLE `user_permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  `type` enum('grant','revoke') CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL COMMENT 'Indica si el permiso se concede (grant) o se revoca (revoke)',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_permission` (`user_id`,`permission_id`),
  KEY `fk_user_permissions_permission` (`permission_id`),
  CONSTRAINT `fk_user_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla de overrides de permisos para usuarios específicos.';

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;

INSERT INTO `user_permissions` (`id`, `user_id`, `permission_id`, `type`, `createdAt`, `updatedAt`) VALUES
	(1, 3, 27, "revoke", "2025-08-30 15:01:05", "2025-08-30 16:13:33"),
	(3, 3, 36, "grant", "2025-08-30 16:14:03", "2025-08-30 16:14:03");

/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table usuarios
# ------------------------------------------------------------

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `rol_id` int DEFAULT NULL,
  `theme_preference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'dark',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_usuarios_rol_id` (`rol_id`),
  CONSTRAINT `fk_usuarios_rol_id` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;

INSERT INTO `usuarios` (`id`, `nombre`, `username`, `password`, `activo`, `createdAt`, `updatedAt`, `rol_id`, `theme_preference`) VALUES
	(1, "Hugo", "Hugo", "$2b$10$LSLIVBSOFuecK5.xiYW5QOaDbkQ5USjeNVpYpcCoSR94NZf3uEid.", 1, "2025-07-11 11:19:32", "2025-09-11 13:57:41", 1, "dark"),
	(2, "Gerente de Prueba", "gerente", "$2b$10$LSLIVBSOFuecK5.xiYW5QOaDbkQ5USjeNVpYpcCoSR94NZf3uEid.", 1, "2025-07-14 10:31:08", "2025-07-14 10:31:08", 2, "dark"),
	(3, "Cajero de Prueba", "cajero", "$2b$10$LSLIVBSOFuecK5.xiYW5QOaDbkQ5USjeNVpYpcCoSR94NZf3uEid.", 1, "2025-07-14 10:31:08", "2025-07-14 10:31:08", 3, "dark"),
	(4, "Cajero 2", "Cajero2", "$2b$10$6VS0Wlop5wrKntEMIG0wLu0yLa1qLe5AQxdCMlpevLSJ8C58YT/Dm", 1, "2025-08-14 19:11:29", "2025-08-14 19:11:29", 3, "dark"),
	(5, "Maxi", "maxi", "$2b$10$N0mrBA.W7/I5UDNVQXS5euCgZXGYj4W2i.CTGx9vL9nC1UywUpgD.", 1, "2025-09-01 22:19:18", "2025-09-18 00:50:14", 1, "dark"),
	(6, "Cajero 3", "cajero3", "$2b$10$2JG5q7BlHtEgVea5/.ZQHeWF59.0P3dlmpUyjiXbbP62RM3ppZ.UC", 1, "2025-09-10 14:43:56", "2025-09-13 15:39:25", 3, "dark");

/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of views
# ------------------------------------------------------------

# Creating temporary tables to overcome VIEW dependency errors


# Dump of routines
# ------------------------------------------------------------

/*!50003 DROP PROCEDURE IF EXISTS InsertStock*/;;
/*!50003 SET @OLD_SQL_MODE=@@SQL_MODE*/;;
/*!50003 SET SQL_MODE="IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION"*/;;
DELIMITER ;;
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `InsertStock`(IN `p_name` VARCHAR(255),IN `p_description` VARCHAR(255),IN `p_cost` DECIMAL(10),IN `p_category_id` BIGINT(19),IN `p_unit` BIGINT(19),OUT `p_id` BIGINT(19))
BEGIN
    INSERT INTO stocks (`name`, `description`, `category_id`, `units_id`,`cost`)
    VALUES (p_name, p_description, p_category_id, p_unit, p_cost);
    
    SET p_id = LAST_INSERT_ID();
END*/;;
DELIMITER ;
/*!50003 SET SQL_MODE=@OLD_SQL_MODE*/;


/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

# Dump completed on 2025-09-23T10:53:33-03:00
