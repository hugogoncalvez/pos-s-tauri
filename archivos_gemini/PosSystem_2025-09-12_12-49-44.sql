# ************************************************************
# Antares - SQL Client
# Version 0.7.35
# 
# https://antares-sql.app/
# https://github.com/antares-sql/antares
# 
# Host: 127.0.0.1 ((Ubuntu) 8.0.43)
# Database: PosSystem
# Generation time: 2025-09-12T12:49:56-03:00
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
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` json NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `ThemeSettings` WRITE;
/*!40000 ALTER TABLE `ThemeSettings` DISABLE KEYS */;

INSERT INTO `ThemeSettings` (`key`, `value`, `createdAt`, `updatedAt`) VALUES
	("activeTheme", "{\"dark\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#651f44ff\"}},\"common\":{\"backdropOverlay\":\"#1e1d1dff\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#023133ff\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#b50345ff\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#023133ff\",\"#08a5abff\"],\"direction\":\"135deg\"}}},\"light\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#6a6969\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#6aa47b\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#cc6f75ff\",\"dialog\":\"#d9d7d7\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#d9d8d8\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#84b7cf\"],\"direction\":\"135deg\"}}}}", "2025-08-13 15:10:19", "2025-09-10 21:48:24");

/*!40000 ALTER TABLE `ThemeSettings` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table audit_logs
# ------------------------------------------------------------

DROP TABLE IF EXISTS `audit_logs`;

CREATE TABLE `audit_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `entity_type` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `entity_id` bigint DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_spanish2_ci,
  `session_id` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_spanish2_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=570 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `session_id`, `details`, `createdAt`, `updatedAt`) VALUES
	(1, 3, "ABRIR_SESION_CAJA", "cash_session", 1, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $1000", "2025-07-14 13:32:05", "2025-07-14 13:32:05"),
	(2, 1, "ABRIR_SESION_CAJA", "cash_session", 2, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $1000", "2025-07-14 13:59:42", "2025-07-14 13:59:42"),
	(3, 1, "ABRIR_SESION_CAJA", "cash_session", 3, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $1000", "2025-07-14 14:19:43", "2025-07-14 14:19:43"),
	(4, 1, "AUTO_CLOSE_SYSTEM_ERROR", "system", NULL, NULL, NULL, "127.0.0.1", "System Scheduler", NULL, "Error crítico en cierre automático: Unknown column \'usuario.role\' in \'field list\'", "2025-07-14 15:25:59", "2025-07-14 15:25:59"),
	(5, 1, "ABRIR_SESION_CAJA", "cash_session", 4, NULL, "{\"status\":\"abierta\",\"opening_amount\":1500}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $1500", "2025-07-14 15:30:47", "2025-07-14 15:30:47"),
	(6, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 4, "{\"status\":\"abierta\"}", "{\"notes\":\"nota opcional\",\"status\":\"cerrada\",\"total_sales\":0,\"closing_amount\":5000,\"total_discounts\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Cierre de sesión de caja. Ventas: $0, Cierre: $5000", "2025-07-14 15:40:10", "2025-07-14 15:40:10"),
	(7, 1, "ABRIR_SESION_CAJA", "cash_session", 5, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $1000", "2025-07-14 15:43:01", "2025-07-14 15:43:01"),
	(8, 1, "ABRIR_SESION_CAJA", "cash_session", 6, NULL, "{\"status\":\"abierta\",\"opening_amount\":2000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $2000", "2025-07-14 21:58:54", "2025-07-14 21:58:54"),
	(9, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 6, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":0,\"closing_amount\":2500,\"total_discounts\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Cierre de sesión de caja. Ventas: $0, Cierre: $2500", "2025-07-14 21:59:25", "2025-07-14 21:59:25"),
	(10, 1, "ABRIR_SESION_CAJA", "cash_session", 7, NULL, "{\"status\":\"abierta\",\"opening_amount\":5000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $5000", "2025-07-14 22:10:24", "2025-07-14 22:10:24"),
	(11, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 7, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":0,\"closing_amount\":5000,\"total_discounts\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Cierre de sesión de caja. Ventas: $0, Cierre: $5000", "2025-07-14 22:11:07", "2025-07-14 22:11:07"),
	(12, 1, "ABRIR_SESION_CAJA", "cash_session", 8, NULL, "{\"status\":\"abierta\",\"opening_amount\":50000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $50000", "2025-07-14 22:13:57", "2025-07-14 22:13:57"),
	(13, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 8, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":0,\"closing_amount\":50000,\"total_discounts\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Cierre de sesión de caja. Ventas: $0, Cierre: $50000", "2025-07-14 22:14:23", "2025-07-14 22:14:23"),
	(14, 3, "ABRIR_SESION_CAJA", "cash_session", 9, NULL, "{\"status\":\"abierta\",\"opening_amount\":15000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $15000", "2025-07-15 11:06:35", "2025-07-15 11:06:35"),
	(15, 1, "ABRIR_SESION_CAJA", "cash_session", 10, NULL, "{\"status\":\"abierta\",\"opening_amount\":1500}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Apertura de sesión de caja con monto inicial: $1500", "2025-07-15 11:15:18", "2025-07-15 11:15:18"),
	(16, 2, "CREAR_VENTA", "sale", 1, NULL, "{\"payment_id\":1,\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"payment_method\":\"Efectivo\",\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Nueva venta registrada por $150", "2025-07-15 12:41:23", "2025-07-15 12:41:23"),
	(17, 2, "CREAR_VENTA", "sale", 2, NULL, "{\"payment_id\":1,\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"payment_method\":\"Efectivo\",\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Nueva venta registrada por $150", "2025-07-15 12:42:15", "2025-07-15 12:42:15"),
	(18, 2, "CREAR_VENTA", "sale", 3, NULL, "{\"payment_id\":1,\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"payment_method\":\"Efectivo\",\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Nueva venta registrada por $150", "2025-07-15 12:42:45", "2025-07-15 12:42:45"),
	(19, 2, "CREAR_VENTA", "sale", 4, NULL, "{\"payment_id\":1,\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"payment_method\":\"Efectivo\",\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Nueva venta registrada por $150", "2025-07-15 13:30:46", "2025-07-15 13:30:46"),
	(20, 2, "CREAR_VENTA", "sale", 5, NULL, "{\"payment_id\":2,\"total_neto\":50,\"customer_id\":1,\"total_amount\":150,\"payment_method\":\"Tarjeta\",\"promotion_discount\":100}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", NULL, "Nueva venta registrada por $50", "2025-07-15 14:07:39", "2025-07-15 14:07:39"),
	(21, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 10, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":0,\"closing_amount\":3000,\"total_discounts\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "jqNQQrlVwQbHruxXA8Jr7Pfg45HkAyLF", "Cierre de sesión de caja. Ventas: 0, Cierre: 3000", "2025-07-16 11:57:05", "2025-07-16 11:57:05"),
	(22, 3, "FINALIZAR_CIERRE_CAJA", "cash_session", 9, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":0,\"closing_amount\":20000,\"total_discounts\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "jqNQQrlVwQbHruxXA8Jr7Pfg45HkAyLF", "Cierre de sesión de caja. Ventas: 0, Cierre: 20000", "2025-07-16 11:57:13", "2025-07-16 11:57:13"),
	(23, 2, "CREAR_VENTA", "sale", 6, NULL, "{\"payment_id\":1,\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"payment_method\":\"Efectivo\",\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "TW-B3QyhD8VhozhLGBU-9LQO4O9IRywr", "Nueva venta registrada por 150", "2025-07-17 10:38:48", "2025-07-17 10:38:48"),
	(24, 2, "CREAR_VENTA", "sale", 7, NULL, "{\"payment_id\":1,\"total_neto\":750,\"customer_id\":1,\"total_amount\":750,\"payment_method\":\"Efectivo\",\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "TW-B3QyhD8VhozhLGBU-9LQO4O9IRywr", "Nueva venta registrada por 750", "2025-07-17 12:09:59", "2025-07-17 12:09:59"),
	(25, 2, "CREAR_VENTA", "sale", 8, NULL, "{\"payment_id\":1,\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"payment_method\":\"Efectivo\",\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "iDwpgLCZzQlrKomJS2I7WPDDcG3Rhbnx", "Nueva venta registrada por 150", "2025-07-18 10:44:09", "2025-07-18 10:44:09"),
	(26, 2, "CREAR_VENTA", "sale", 9, NULL, "{\"payment_id\":1,\"total_neto\":1200,\"customer_id\":1,\"total_amount\":1200,\"payment_method\":\"Efectivo\",\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "iDwpgLCZzQlrKomJS2I7WPDDcG3Rhbnx", "Nueva venta registrada por 1200", "2025-07-18 10:56:19", "2025-07-18 10:56:19"),
	(27, 1, "ABRIR_SESION_CAJA", "cash_session", 11, NULL, "{\"status\":\"abierta\",\"opening_amount\":1500}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "iDwpgLCZzQlrKomJS2I7WPDDcG3Rhbnx", "Apertura de sesión de caja con monto inicial: 1500", "2025-07-18 11:02:43", "2025-07-18 11:02:43"),
	(28, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 11, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":0,\"closing_amount\":0,\"total_discounts\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "iDwpgLCZzQlrKomJS2I7WPDDcG3Rhbnx", "Cierre de sesión de caja. Ventas: 0, Cierre: 0", "2025-07-18 11:03:09", "2025-07-18 11:03:09"),
	(29, 1, "ABRIR_SESION_CAJA", "cash_session", 12, NULL, "{\"status\":\"abierta\",\"opening_amount\":5000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "Pe4TlHcrTX2Mf83U5E5TkuCluTM7sz4j", "Apertura de sesión de caja con monto inicial: 5000", "2025-07-18 11:33:39", "2025-07-18 11:33:39"),
	(30, 1, "CREAR_VENTA", "sale", 10, NULL, "{\"payment_id\":1,\"total_neto\":1200,\"customer_id\":1,\"total_amount\":1200,\"payment_method\":\"Efectivo\",\"cash_session_id\":12,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "Pe4TlHcrTX2Mf83U5E5TkuCluTM7sz4j", "Nueva venta registrada por 1200", "2025-07-18 11:52:01", "2025-07-18 11:52:01"),
	(31, 1, "CREAR_VENTA", "sale", 11, NULL, "{\"payment_id\":1,\"total_neto\":6000,\"customer_id\":1,\"total_amount\":6000,\"payment_method\":\"Efectivo\",\"cash_session_id\":12,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "Pe4TlHcrTX2Mf83U5E5TkuCluTM7sz4j", "Nueva venta registrada por 6000", "2025-07-18 12:18:10", "2025-07-18 12:18:10"),
	(32, 1, "CREAR_VENTA", "sale", 20, NULL, "{\"payments\":[{\"amount\":1000,\"method_id\":1},{\"amount\":200,\"method_id\":2}],\"total_neto\":1200,\"customer_id\":1,\"total_amount\":1200,\"cash_session_id\":12,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "Pe4TlHcrTX2Mf83U5E5TkuCluTM7sz4j", "Nueva venta registrada por 1200 con pagos: [\"1000 (1)\",\"200 (2)\"]", "2025-07-18 14:37:53", "2025-07-18 14:37:53"),
	(33, 1, "CREAR_VENTA", "sale", 21, NULL, "{\"payments\":[{\"amount\":400,\"method_id\":1},{\"amount\":800,\"method_id\":2}],\"total_neto\":1200,\"customer_id\":1,\"total_amount\":1200,\"cash_session_id\":12,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "Pe4TlHcrTX2Mf83U5E5TkuCluTM7sz4j", "Nueva venta registrada por 1200 con pagos: [\"400 (1)\",\"800 (2)\"]", "2025-07-18 14:46:12", "2025-07-18 14:46:12"),
	(34, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 12, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-21 12:00:00", "2025-07-21 12:00:00"),
	(35, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 12, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":\"9600.00\",\"closing_amount\":5000,\"total_discounts\":\"0.00\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "LmgIV95H5yYiaBfF690-CLdI7SNMZgDp", "Cierre de sesión de caja. Ventas: 9600.00, Cierre: 5000", "2025-07-21 12:07:27", "2025-07-21 12:07:27"),
	(36, 1, "IMPORTAR_STOCK", "stock", NULL, NULL, "{\"errors\":[\"Fila con datos incompletos (nombre, unidad o categoría): {\\\"codigo_barras\\\":\\\"7790010001234\\\",\\\"nombre\\\":\\\"Producto Ejemplo\\\",\\\"descripcion\\\":\\\"Breve descripción del producto\\\",\\\"precio\\\":150.75,\\\"costo\\\":100.5,\\\"stock\\\":50,\\\"min_stock\\\":10,\\\"categoria\\\":\\\"General\\\",\\\"proveedor\\\":\\\"Proveedor Ejemplo\\\",\\\"visible\\\":1}\"],\"errorCount\":1,\"updatedCount\":0,\"importedCount\":0}", "::ffff:127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "SVKUv_PDOv4cOhQtazZQo5_b9wNhpVYp", "Importación de stock desde Excel. Nuevos: 0, Actualizados: 0, Errores: 1", "2025-07-21 13:47:39", "2025-07-21 13:47:39"),
	(37, 1, "IMPORTAR_STOCK", "stock", NULL, NULL, "{\"errors\":[\"Fila con datos incompletos (nombre, unidad o categoría): {\\\"codigo_barras\\\":\\\"7790010001234\\\",\\\"nombre\\\":\\\"Producto Ejemplo\\\",\\\"descripcion\\\":\\\"Breve descripción del producto\\\",\\\"precio\\\":150.75,\\\"costo\\\":100.5,\\\"stock\\\":50,\\\"min_stock\\\":10,\\\"categoria\\\":\\\"General\\\",\\\"proveedor\\\":\\\"Proveedor Ejemplo\\\",\\\"visible\\\":1}\"],\"errorCount\":1,\"updatedCount\":0,\"importedCount\":0}", "::ffff:127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "SVKUv_PDOv4cOhQtazZQo5_b9wNhpVYp", "Importación de stock desde Excel. Nuevos: 0, Actualizados: 0, Errores: 1", "2025-07-21 13:52:07", "2025-07-21 13:52:07"),
	(38, 1, "IMPORTAR_STOCK", "stock", NULL, NULL, "{\"errors\":[],\"errorCount\":0,\"updatedCount\":0,\"importedCount\":1}", "::ffff:127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "SVKUv_PDOv4cOhQtazZQo5_b9wNhpVYp", "Importación de stock desde Excel. Nuevos: 1, Actualizados: 0, Errores: 0", "2025-07-21 13:57:28", "2025-07-21 13:57:28"),
	(39, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"4.00\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: 4.00, Stock mínimo: 5.00", "2025-07-21 14:30:54", "2025-07-21 14:30:54"),
	(40, 1, "ALERTA_STOCK_BAJO", "stock", 3, NULL, "{\"min_stock\":\"24.00\",\"current_stock\":\"10.00\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Coca-Cola 500. Stock actual: 10.00, Stock mínimo: 24.00", "2025-07-21 14:54:56", "2025-07-21 14:54:56"),
	(41, 1, "ABRIR_SESION_CAJA", "cash_session", 13, NULL, "{\"status\":\"abierta\",\"opening_amount\":5000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "fjxpnYsheJRi3c_sf0yN0snT54E7hzRY", "Apertura de sesión de caja con monto inicial: 5000", "2025-07-21 20:30:02", "2025-07-21 20:30:02"),
	(42, 1, "CREAR_VENTA", "sale", 22, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":6}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":13,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "e2CAhtL4lLJrbRuZ_wNOREti3DApWUOk", "Nueva venta registrada por 150 con pagos: [\"150 (6)\"]", "2025-07-22 10:52:43", "2025-07-22 10:52:43"),
	(43, 1, "CREAR_VENTA", "sale", 23, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":6}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":13,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "e2CAhtL4lLJrbRuZ_wNOREti3DApWUOk", "Nueva venta registrada por 150 con pagos: [\"150 (6)\"]", "2025-07-22 10:53:30", "2025-07-22 10:53:30"),
	(44, 1, "CREAR_VENTA", "sale", 24, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":6}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":13,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "e2CAhtL4lLJrbRuZ_wNOREti3DApWUOk", "Nueva venta registrada por 150 con pagos: [\"150 (6)\"]", "2025-07-22 10:56:34", "2025-07-22 10:56:34"),
	(45, 1, "CREAR_VENTA", "sale", 25, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":13,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "e2CAhtL4lLJrbRuZ_wNOREti3DApWUOk", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-22 10:58:03", "2025-07-22 10:58:03"),
	(46, 1, "CREAR_VENTA", "sale", 26, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":6}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":13,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "e2CAhtL4lLJrbRuZ_wNOREti3DApWUOk", "Nueva venta registrada por 150 con pagos: [\"150 (6)\"]", "2025-07-22 11:01:44", "2025-07-22 11:01:44"),
	(47, 1, "CREAR_VENTA", "sale", 27, NULL, "{\"payments\":[{\"amount\":1200,\"method_id\":6}],\"total_neto\":1200,\"customer_id\":4,\"total_amount\":1200,\"cash_session_id\":13,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "e2CAhtL4lLJrbRuZ_wNOREti3DApWUOk", "Nueva venta registrada por 1200 con pagos: [\"1200 (6)\"]", "2025-07-22 11:17:13", "2025-07-22 11:17:13"),
	(48, 1, "CREAR_VENTA", "sale", 28, NULL, "{\"payments\":[{\"amount\":150.75,\"method_id\":6}],\"total_neto\":150.75,\"customer_id\":4,\"total_amount\":150.75,\"cash_session_id\":13,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "e2CAhtL4lLJrbRuZ_wNOREti3DApWUOk", "Nueva venta registrada por 150.75 con pagos: [\"150.75 (6)\"]", "2025-07-22 11:21:25", "2025-07-22 11:21:25"),
	(49, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-22 14:00:00", "2025-07-22 14:00:00"),
	(50, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-22 15:00:00", "2025-07-22 15:00:00"),
	(51, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-23 11:00:00", "2025-07-23 11:00:00"),
	(52, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-23 12:00:00", "2025-07-23 12:00:00"),
	(53, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-23 15:00:00", "2025-07-23 15:00:00"),
	(54, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-23 20:00:00", "2025-07-23 20:00:00"),
	(55, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-23 21:00:00", "2025-07-23 21:00:00"),
	(56, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-23 22:00:00", "2025-07-23 22:00:00"),
	(57, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 13, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-24 13:00:00", "2025-07-24 13:00:00"),
	(58, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 13, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":\"1500.75\",\"closing_amount\":6000,\"total_discounts\":\"0.00\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "lmdbX0uWjiK3cxZwOlVObBm0F7xX1Ibb", "Cierre de sesión de caja. Ventas: 1500.75, Cierre: 6000", "2025-07-24 13:11:04", "2025-07-24 13:11:04"),
	(59, 1, "ABRIR_SESION_CAJA", "cash_session", 14, NULL, "{\"status\":\"abierta\",\"opening_amount\":50000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "sS31lUdsjBy50vxq5XRuajOABKfJWt_0", "Apertura de sesión de caja con monto inicial: 50000", "2025-07-24 15:03:35", "2025-07-24 15:03:35"),
	(60, 1, "CREAR_VENTA", "sale", 29, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "QLXXDYQjLjwOcjuVnToCDfPBu-vWQX3c", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-24 15:53:54", "2025-07-24 15:53:54"),
	(61, 1, "CREAR_VENTA", "sale", 30, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "QLXXDYQjLjwOcjuVnToCDfPBu-vWQX3c", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-24 15:56:25", "2025-07-24 15:56:25"),
	(62, 1, "CREAR_VENTA", "sale", 31, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "7t00YUIeOztjcPDkd2OFOMsBoYhuafeB", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-24 20:00:30", "2025-07-24 20:00:30"),
	(63, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-25 11:00:00", "2025-07-25 11:00:00"),
	(64, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-25 12:00:00", "2025-07-25 12:00:00"),
	(65, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-25 13:00:00", "2025-07-25 13:00:00"),
	(66, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-25 14:00:00", "2025-07-25 14:00:00"),
	(67, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-25 15:00:00", "2025-07-25 15:00:00"),
	(68, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-25 21:00:00", "2025-07-25 21:00:00"),
	(69, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-25 22:00:00", "2025-07-25 22:00:00"),
	(70, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-25 23:00:00", "2025-07-25 23:00:00"),
	(71, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-26 16:00:00", "2025-07-26 16:00:00"),
	(72, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-26 17:00:00", "2025-07-26 17:00:00"),
	(73, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-26 18:00:00", "2025-07-26 18:00:00"),
	(74, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-26 19:00:00", "2025-07-26 19:00:00"),
	(75, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-26 20:00:00", "2025-07-26 20:00:00"),
	(76, 1, "VENTA_FORZADA_STOCK_NEGATIVO", "stock", 2, NULL, "{\"stock_after\":-36,\"product_name\":\"Producto de Ejemplo 2\",\"stock_before\":\"4.000\",\"quantity_sold\":40}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "hAyCbShJ5pJV4AM1WKEJov3Cvod_jKE1", "Venta forzada de 40 unidades de Producto de Ejemplo 2. Stock pasó de 4.000 a -36.", "2025-07-26 20:16:44", "2025-07-26 20:16:44"),
	(77, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"-36.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: -36.000, Stock mínimo: 5.00", "2025-07-26 20:16:44", "2025-07-26 20:16:44"),
	(78, 1, "CREAR_VENTA", "sale", 32, NULL, "{\"payments\":[{\"amount\":10020,\"method_id\":1}],\"total_neto\":10020,\"customer_id\":1,\"total_amount\":10020,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "hAyCbShJ5pJV4AM1WKEJov3Cvod_jKE1", "Nueva venta registrada por 10020 con pagos: [\"10020 (1)\"]", "2025-07-26 20:16:44", "2025-07-26 20:16:44"),
	(79, 1, "CREAR_VENTA", "sale", 33, NULL, "{\"payments\":[{\"amount\":2500,\"method_id\":1}],\"total_neto\":2500,\"customer_id\":1,\"total_amount\":2500,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "hAyCbShJ5pJV4AM1WKEJov3Cvod_jKE1", "Nueva venta registrada por 2500 con pagos: [\"2500 (1)\"]", "2025-07-26 20:37:37", "2025-07-26 20:37:37"),
	(80, 1, "CREAR_VENTA", "sale", 34, NULL, "{\"payments\":[{\"amount\":2400,\"method_id\":1}],\"total_neto\":2400,\"customer_id\":1,\"total_amount\":2400,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "hAyCbShJ5pJV4AM1WKEJov3Cvod_jKE1", "Nueva venta registrada por 2400 con pagos: [\"2400 (1)\"]", "2025-07-26 20:45:50", "2025-07-26 20:45:50"),
	(81, 1, "CREAR_VENTA", "sale", 35, NULL, "{\"payments\":[{\"amount\":200,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "hAyCbShJ5pJV4AM1WKEJov3Cvod_jKE1", "Nueva venta registrada por 150 con pagos: [\"200 (1)\"]", "2025-07-26 20:54:32", "2025-07-26 20:54:32"),
	(82, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-26 21:00:00", "2025-07-26 21:00:00"),
	(83, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-26 22:00:00", "2025-07-26 22:00:00"),
	(84, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-26 23:00:00", "2025-07-26 23:00:00"),
	(85, 1, "CREAR_VENTA", "sale", 36, NULL, "{\"payments\":[{\"amount\":150.75,\"method_id\":1}],\"total_neto\":150.75,\"customer_id\":1,\"total_amount\":150.75,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "hAyCbShJ5pJV4AM1WKEJov3Cvod_jKE1", "Nueva venta registrada por 150.75 con pagos: [\"150.75 (1)\"]", "2025-07-26 23:09:50", "2025-07-26 23:09:50"),
	(86, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-27 17:00:00", "2025-07-27 17:00:00"),
	(87, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-27 18:00:00", "2025-07-27 18:00:00"),
	(88, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-28 12:00:00", "2025-07-28 12:00:00"),
	(89, 1, "CREAR_VENTA", "sale", 37, NULL, "{\"payments\":[{\"amount\":150.75,\"method_id\":1}],\"total_neto\":150.75,\"customer_id\":1,\"total_amount\":150.75,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "DNxst3r2kVSp8fCtFr2u9RUrLIlTBxt7", "Nueva venta registrada por 150.75 con pagos: [\"150.75 (1)\"]", "2025-07-28 12:08:04", "2025-07-28 12:08:04"),
	(90, 1, "CREAR_VENTA", "sale", 38, NULL, "{\"payments\":[{\"amount\":1815,\"method_id\":1}],\"total_neto\":1815,\"customer_id\":1,\"total_amount\":1500,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "DNxst3r2kVSp8fCtFr2u9RUrLIlTBxt7", "Nueva venta registrada por 1815 con pagos: [\"1815 (1)\"]", "2025-07-28 12:43:05", "2025-07-28 12:43:05"),
	(91, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-28 13:00:00", "2025-07-28 13:00:00"),
	(92, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-28 14:00:00", "2025-07-28 14:00:00"),
	(93, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-28 15:00:00", "2025-07-28 15:00:00"),
	(94, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":10,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "DNxst3r2kVSp8fCtFr2u9RUrLIlTBxt7", "Producto \"undefined\" (cantidad: 10, precio: 1000) agregado manualmente a la venta.", "2025-07-28 15:39:32", "2025-07-28 15:39:32"),
	(95, 1, "CREAR_VENTA", "sale", 51, NULL, "{\"payments\":[{\"amount\":10000,\"method_id\":1}],\"total_neto\":10000,\"customer_id\":1,\"total_amount\":10000,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "DNxst3r2kVSp8fCtFr2u9RUrLIlTBxt7", "Nueva venta registrada por 10000 con pagos: [\"10000 (1)\"]", "2025-07-28 15:39:32", "2025-07-28 15:39:32"),
	(96, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":1,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "DNxst3r2kVSp8fCtFr2u9RUrLIlTBxt7", "Producto \"undefined\" (cantidad: 1, precio: 1000) agregado manualmente a la venta.", "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(97, 1, "ALERTA_STOCK_BAJO", "stock", 5, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"4.750\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Jamon Cocido Paladini. Stock actual: 4.750, Stock mínimo: 5.00", "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(98, 1, "VENTA_FORZADA_STOCK_NEGATIVO", "stock", 2, NULL, "{\"stock_after\":-37,\"product_name\":\"Producto de Ejemplo 2\",\"stock_before\":\"-36.000\",\"quantity_sold\":1}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "DNxst3r2kVSp8fCtFr2u9RUrLIlTBxt7", "Venta forzada de 1 unidades de Producto de Ejemplo 2. Stock pasó de -36.000 a -37.", "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(99, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"-37.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: -37.000, Stock mínimo: 5.00", "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(100, 1, "CREAR_VENTA", "sale", 52, NULL, "{\"payments\":[{\"amount\":7601.25,\"method_id\":1}],\"total_neto\":7601.25,\"customer_id\":1,\"total_amount\":7601.25,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "DNxst3r2kVSp8fCtFr2u9RUrLIlTBxt7", "Nueva venta registrada por 7601.25 con pagos: [\"7601.25 (1)\"]", "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(101, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-28 16:00:00", "2025-07-28 16:00:00"),
	(102, 3, "ABRIR_SESION_CAJA", "cash_session", 15, NULL, "{\"status\":\"abierta\",\"opening_amount\":5000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "lFqdNKd-hlMSFmYS7jarM0KnoITmpxXA", "Apertura de sesión de caja con monto inicial: 5000", "2025-07-28 20:24:10", "2025-07-28 20:24:10"),
	(103, 3, "CREAR_VENTA", "sale", 53, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":15,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "lFqdNKd-hlMSFmYS7jarM0KnoITmpxXA", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-28 20:38:11", "2025-07-28 20:38:11"),
	(104, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-28 21:00:00", "2025-07-28 21:00:00"),
	(105, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-28 22:00:00", "2025-07-28 22:00:00"),
	(106, 1, "ALERTA_STOCK_BAJO", "stock", 5, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"4.250\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Jamon Cocido Paladini. Stock actual: 4.250, Stock mínimo: 5.00", "2025-07-29 10:49:11", "2025-07-29 10:49:11"),
	(107, 1, "CREAR_VENTA", "sale", 54, NULL, "{\"payments\":[{\"amount\":3000,\"method_id\":1},{\"amount\":2000,\"method_id\":6}],\"total_neto\":5000,\"customer_id\":7,\"total_amount\":5000,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "cDOFO2fW3mAusbhnuf4grHSFyTdgvQZ-", "Nueva venta registrada por 5000 con pagos: [\"3000 (1)\",\"2000 (6)\"]", "2025-07-29 10:49:11", "2025-07-29 10:49:11"),
	(108, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-29 11:00:00", "2025-07-29 11:00:00"),
	(109, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 15, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-29 11:00:00", "2025-07-29 11:00:00"),
	(110, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-29 12:00:00", "2025-07-29 12:00:00"),
	(111, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 15, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-29 12:00:00", "2025-07-29 12:00:00"),
	(112, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 14, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-29 13:00:00", "2025-07-29 13:00:00"),
	(113, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 15, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-29 13:00:00", "2025-07-29 13:00:00"),
	(114, 1, "CREAR_VENTA", "sale", 55, NULL, "{\"payments\":[{\"amount\":20000,\"method_id\":1}],\"total_neto\":18000,\"customer_id\":1,\"total_amount\":18000,\"cash_session_id\":14,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "cDOFO2fW3mAusbhnuf4grHSFyTdgvQZ-", "Nueva venta registrada por 18000 con pagos: [\"20000 (1)\"]", "2025-07-29 13:46:42", "2025-07-29 13:46:42"),
	(115, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 14, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":\"58237.75\",\"closing_amount\":100000,\"total_discounts\":\"0.00\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "cDOFO2fW3mAusbhnuf4grHSFyTdgvQZ-", "Cierre de sesión de caja. Ventas: 58237.75, Cierre: 100000", "2025-07-29 13:56:08", "2025-07-29 13:56:08"),
	(116, 3, "FINALIZAR_CIERRE_CAJA", "cash_session", 15, "{\"status\":\"abierta\"}", "{\"notes\":\"\",\"status\":\"cerrada\",\"total_sales\":\"150.00\",\"closing_amount\":50000,\"total_discounts\":\"0.00\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "cDOFO2fW3mAusbhnuf4grHSFyTdgvQZ-", "Cierre de sesión de caja. Ventas: 150.00, Cierre: 50000", "2025-07-29 13:56:42", "2025-07-29 13:56:42"),
	(117, 1, "ALERTA_STOCK_BAJO", "stock", 8, NULL, "{\"min_stock\":\"20.00\",\"current_stock\":\"107.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Lustra Muebles Suiza 360cm. Stock actual: 107.000, Stock mínimo: 20.00", "2025-07-29 14:15:27", "2025-07-29 14:15:27"),
	(118, 1, "ABRIR_SESION_CAJA", "cash_session", 16, NULL, "{\"status\":\"abierta\",\"opening_amount\":15000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "cDOFO2fW3mAusbhnuf4grHSFyTdgvQZ-", "Apertura de sesión de caja con monto inicial: 15000", "2025-07-29 14:16:09", "2025-07-29 14:16:09"),
	(119, 1, "ALERTA_STOCK_BAJO", "stock", 8, NULL, "{\"min_stock\":\"20.00\",\"current_stock\":\"107.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Lustra Muebles Suiza 360cm. Stock actual: 107.000, Stock mínimo: 20.00", "2025-07-29 15:00:41", "2025-07-29 15:00:41"),
	(120, 3, "ABRIR_SESION_CAJA", "cash_session", 17, NULL, "{\"status\":\"abierta\",\"opening_amount\":6000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "HtEYTyukJ6oL_qtKgjs8Zj-OZlBKd0FB", "Apertura de sesión de caja con monto inicial: 6000", "2025-07-30 10:48:13", "2025-07-30 10:48:13"),
	(121, 3, "CREAR_VENTA", "sale", 56, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":17,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "HtEYTyukJ6oL_qtKgjs8Zj-OZlBKd0FB", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-30 10:52:02", "2025-07-30 10:52:02"),
	(122, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 11:00:00", "2025-07-30 11:00:00"),
	(123, 3, "CREAR_VENTA", "sale", 57, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":17,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "HtEYTyukJ6oL_qtKgjs8Zj-OZlBKd0FB", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-30 11:40:31", "2025-07-30 11:40:31"),
	(124, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 12:00:00", "2025-07-30 12:00:00"),
	(125, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 13:00:00", "2025-07-30 13:00:00"),
	(126, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 14:00:00", "2025-07-30 14:00:00"),
	(127, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 15:00:00", "2025-07-30 15:00:00"),
	(128, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 20:00:00", "2025-07-30 20:00:00"),
	(129, 1, "CREAR_VENTA", "sale", 58, NULL, "{\"payments\":[{\"amount\":171.5,\"method_id\":1}],\"total_neto\":171.5,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":16,\"promotion_discount\":10}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "yNXV1K4sf9cizfgJU-AShEzBcwqhkrU3", "Nueva venta registrada por 171.5 con pagos: [\"171.5 (1)\"]", "2025-07-30 20:31:04", "2025-07-30 20:31:04"),
	(130, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":1,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "KFQjbsYptzODAtMotPv6R0pDHZI7Appy", "Producto \"undefined\" (cantidad: 1, precio: 1000) agregado manualmente a la venta.", "2025-07-30 21:15:33", "2025-07-30 21:15:33"),
	(131, 1, "CREAR_VENTA", "sale", 59, NULL, "{\"payments\":[{\"amount\":1000,\"method_id\":1}],\"total_neto\":1000,\"customer_id\":1,\"total_amount\":1000,\"cash_session_id\":16,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "KFQjbsYptzODAtMotPv6R0pDHZI7Appy", "Nueva venta registrada por 1000 con pagos: [\"1000 (1)\"]", "2025-07-30 21:15:33", "2025-07-30 21:15:33"),
	(132, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 22:00:00", "2025-07-30 22:00:00"),
	(133, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 23:00:00", "2025-07-30 23:00:00"),
	(134, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 17, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-30 23:00:00", "2025-07-30 23:00:00"),
	(135, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 00:00:00", "2025-07-31 00:00:00"),
	(136, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 17, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 00:00:00", "2025-07-31 00:00:00"),
	(137, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 01:00:00", "2025-07-31 01:00:00"),
	(138, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 17, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 01:00:00", "2025-07-31 01:00:00"),
	(139, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 11:00:00", "2025-07-31 11:00:00"),
	(140, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 17, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 11:00:00", "2025-07-31 11:00:00"),
	(141, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 12:00:00", "2025-07-31 12:00:00"),
	(142, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 17, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 12:00:00", "2025-07-31 12:00:00"),
	(143, 3, "INICIO_CIERRE_CAJA", "cash_session", 17, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":6300,\"discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Cajero inició cierre. Declarado: 6300, Diferencia Preliminar: 0", "2025-07-31 12:49:06", "2025-07-31 12:49:06"),
	(144, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 13:00:00", "2025-07-31 13:00:00"),
	(145, 3, "ABRIR_SESION_CAJA", "cash_session", 18, NULL, "{\"status\":\"abierta\",\"opening_amount\":1500}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Apertura de sesión de caja con monto inicial: 1500", "2025-07-31 13:00:54", "2025-07-31 13:00:54"),
	(146, 3, "CREAR_VENTA", "sale", 60, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":18,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 13:04:25", "2025-07-31 13:04:25"),
	(147, 3, "ALERTA_STOCK_BAJO", "stock", 5, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"3.750\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Jamon Cocido Paladini. Stock actual: 3.750, Stock mínimo: 5.00", "2025-07-31 13:04:57", "2025-07-31 13:04:57"),
	(148, 3, "CREAR_VENTA", "sale", 61, NULL, "{\"payments\":[{\"amount\":\"5000.00\",\"method_id\":2}],\"total_neto\":5000,\"customer_id\":1,\"total_amount\":5000,\"cash_session_id\":18,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 5000 con pagos: [\"5000.00 (2)\"]", "2025-07-31 13:04:57", "2025-07-31 13:04:57"),
	(149, 3, "CREAR_VENTA", "sale", 62, NULL, "{\"payments\":[{\"amount\":100.75,\"method_id\":1},{\"amount\":50,\"method_id\":6}],\"total_neto\":150.75,\"customer_id\":7,\"total_amount\":150.75,\"cash_session_id\":18,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 150.75 con pagos: [\"100.75 (1)\",\"50 (6)\"]", "2025-07-31 13:08:44", "2025-07-31 13:08:44"),
	(150, 3, "CREAR_VENTA", "sale", 63, NULL, "{\"payments\":[{\"amount\":\"150.00\",\"method_id\":4}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":18,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 150 con pagos: [\"150.00 (4)\"]", "2025-07-31 13:09:06", "2025-07-31 13:09:06"),
	(151, 3, "INICIO_CIERRE_CAJA", "cash_session", 18, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":1750,\"discrepancy\":-0.75}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Cajero inició cierre. Declarado: 1750, Diferencia Preliminar: -0.75", "2025-07-31 13:14:25", "2025-07-31 13:14:25"),
	(152, 3, "ABRIR_SESION_CAJA", "cash_session", 19, NULL, "{\"status\":\"abierta\",\"opening_amount\":2500}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Apertura de sesión de caja con monto inicial: 2500", "2025-07-31 13:21:42", "2025-07-31 13:21:42"),
	(153, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 14:00:00", "2025-07-31 14:00:00"),
	(154, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 15:00:00", "2025-07-31 15:00:00"),
	(155, 3, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":1,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Producto \"undefined\" (cantidad: 1, precio: 1000) agregado manualmente a la venta.", "2025-07-31 15:14:16", "2025-07-31 15:14:16"),
	(156, 3, "CREAR_VENTA", "sale", 64, NULL, "{\"payments\":[{\"amount\":1000,\"method_id\":6}],\"total_neto\":1000,\"customer_id\":7,\"total_amount\":1000,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 1000 con pagos: [\"1000 (6)\"]", "2025-07-31 15:14:16", "2025-07-31 15:14:16"),
	(157, 3, "CREAR_VENTA", "sale", 65, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":6}],\"total_neto\":150,\"customer_id\":7,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 150 con pagos: [\"150 (6)\"]", "2025-07-31 15:24:05", "2025-07-31 15:24:05"),
	(158, 3, "ALERTA_STOCK_BAJO", "stock", 1, NULL, "{\"min_stock\":\"15.00\",\"current_stock\":\"14.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 1. Stock actual: 14.000, Stock mínimo: 15.00", "2025-07-31 15:32:40", "2025-07-31 15:32:40"),
	(159, 3, "CREAR_VENTA", "sale", 66, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 15:32:40", "2025-07-31 15:32:40"),
	(160, 3, "ALERTA_STOCK_BAJO", "stock", 1, NULL, "{\"min_stock\":\"15.00\",\"current_stock\":\"13.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 1. Stock actual: 13.000, Stock mínimo: 15.00", "2025-07-31 15:36:02", "2025-07-31 15:36:02"),
	(161, 3, "CREAR_VENTA", "sale", 67, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 15:36:02", "2025-07-31 15:36:02"),
	(162, 3, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":1,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Producto \"undefined\" (cantidad: 1, precio: 1000) agregado manualmente a la venta.", "2025-07-31 20:34:01", "2025-07-31 20:34:01"),
	(163, 3, "CREAR_VENTA", "sale", 68, NULL, "{\"payments\":[{\"amount\":1000,\"method_id\":1}],\"total_neto\":1000,\"customer_id\":1,\"total_amount\":1000,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 1000 con pagos: [\"1000 (1)\"]", "2025-07-31 20:34:01", "2025-07-31 20:34:01"),
	(164, 3, "ALERTA_STOCK_BAJO", "stock", 1, NULL, "{\"min_stock\":\"15.00\",\"current_stock\":\"12.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 1. Stock actual: 12.000, Stock mínimo: 15.00", "2025-07-31 20:34:23", "2025-07-31 20:34:23"),
	(165, 3, "CREAR_VENTA", "sale", 69, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "6i-uBVXTAmjaxbrxOWBj5NCOgKgsbbcc", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 20:34:23", "2025-07-31 20:34:23"),
	(166, 3, "ALERTA_STOCK_BAJO", "stock", 1, NULL, "{\"min_stock\":\"15.00\",\"current_stock\":\"11.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 1. Stock actual: 11.000, Stock mínimo: 15.00", "2025-07-31 20:35:26", "2025-07-31 20:35:26"),
	(167, 3, "CREAR_VENTA", "sale", 70, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 20:35:26", "2025-07-31 20:35:26"),
	(168, 3, "ALERTA_STOCK_BAJO", "stock", 1, NULL, "{\"min_stock\":\"15.00\",\"current_stock\":\"10.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 1. Stock actual: 10.000, Stock mínimo: 15.00", "2025-07-31 20:37:33", "2025-07-31 20:37:33"),
	(169, 3, "CREAR_VENTA", "sale", 71, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":6}],\"total_neto\":150,\"customer_id\":7,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Nueva venta registrada por 150 con pagos: [\"150 (6)\"]", "2025-07-31 20:37:33", "2025-07-31 20:37:33"),
	(170, 3, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":1,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Producto \"undefined\" (cantidad: 1, precio: 1000) agregado manualmente a la venta.", "2025-07-31 20:39:53", "2025-07-31 20:39:53"),
	(171, 3, "CREAR_VENTA", "sale", 72, NULL, "{\"payments\":[{\"amount\":\"1000.00\",\"method_id\":4}],\"total_neto\":1000,\"customer_id\":1,\"total_amount\":1000,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Nueva venta registrada por 1000 con pagos: [\"1000.00 (4)\"]", "2025-07-31 20:39:53", "2025-07-31 20:39:53"),
	(172, 3, "CREAR_VENTA", "sale", 73, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 20:40:31", "2025-07-31 20:40:31"),
	(173, 3, "CREAR_VENTA", "sale", 74, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 20:48:29", "2025-07-31 20:48:29"),
	(174, 3, "CREAR_VENTA", "sale", 75, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 20:51:51", "2025-07-31 20:51:51"),
	(175, 3, "CREAR_VENTA", "sale", 76, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 20:53:52", "2025-07-31 20:53:52"),
	(176, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 21:00:00", "2025-07-31 21:00:00"),
	(177, 3, "CREAR_VENTA", "sale", 77, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":19,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-07-31 21:01:41", "2025-07-31 21:01:41"),
	(178, 3, "INICIO_CIERRE_CAJA", "cash_session", 19, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":4850,\"discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "AGskM9ieS0Ccx_kzkK0ZCUFKiJuRtbE4", "Cajero inició cierre. Declarado: 4850, Diferencia Preliminar: 0", "2025-07-31 21:44:34", "2025-07-31 21:44:34"),
	(179, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 22:00:00", "2025-07-31 22:00:00"),
	(180, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-07-31 23:00:00", "2025-07-31 23:00:00"),
	(181, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 17, NULL, "{\"status\":\"cerrada\",\"verified_amount\":6300,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "GufbdCabLb9paPhx5GGJiYpzBSWRfAKF", "Admin finalizó cierre. Verificado: 6300, Diferencia Final: 0", "2025-07-31 23:12:01", "2025-07-31 23:12:01"),
	(182, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 19, NULL, "{\"status\":\"cerrada\",\"verified_amount\":4800,\"final_discrepancy\":-50}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "GufbdCabLb9paPhx5GGJiYpzBSWRfAKF", "Admin finalizó cierre. Verificado: 4800, Diferencia Final: -50", "2025-07-31 23:12:34", "2025-07-31 23:12:34"),
	(183, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 18, NULL, "{\"status\":\"cerrada\",\"verified_amount\":1800,\"final_discrepancy\":49.25}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "GufbdCabLb9paPhx5GGJiYpzBSWRfAKF", "Admin finalizó cierre. Verificado: 1800, Diferencia Final: 49.25", "2025-07-31 23:12:56", "2025-07-31 23:12:56"),
	(184, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-01 12:00:00", "2025-08-01 12:00:00"),
	(185, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-01 13:00:00", "2025-08-01 13:00:00"),
	(186, 3, "ABRIR_SESION_CAJA", "cash_session", 20, NULL, "{\"status\":\"abierta\",\"opening_amount\":1500}", "::ffff:127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64; rv:141.0) Gecko/20100101 Firefox/141.0", "y3JdgDjuFtKK6W_P92txHMcqQ7dakoju", "Apertura de sesión de caja con monto inicial: 1500", "2025-08-01 13:34:06", "2025-08-01 13:34:06"),
	(187, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-01 14:00:00", "2025-08-01 14:00:00"),
	(188, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-01 15:00:00", "2025-08-01 15:00:00"),
	(189, 1, "CASH_EXPENSE", "cash_session", 16, NULL, "{\"amount\":1000,\"description\":\"pago x\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "oaothh9XrO3WlmD3VfQKcnkcs5y941MX", "Egreso de efectivo: 1000 por \"pago x\"", "2025-08-02 20:30:01", "2025-08-02 20:30:01"),
	(190, 1, "CASH_EXPENSE", "cash_session", 16, NULL, "{\"amount\":1000,\"description\":\"pago x 2\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "oaothh9XrO3WlmD3VfQKcnkcs5y941MX", "Egreso de efectivo: 1000 por \"pago x 2\"", "2025-08-02 20:30:23", "2025-08-02 20:30:23"),
	(191, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-02 21:00:00", "2025-08-02 21:00:00"),
	(192, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 20, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-02 21:00:00", "2025-08-02 21:00:00"),
	(193, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-02 22:00:00", "2025-08-02 22:00:00"),
	(194, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 20, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-02 22:00:00", "2025-08-02 22:00:00"),
	(195, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 3, NULL, "{\"type\":\"egreso\",\"amount\":1000,\"description\":\"pago x3\",\"cash_session_id\":16}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "oaothh9XrO3WlmD3VfQKcnkcs5y941MX", "Movimiento de caja registrado: egreso de 1000 en sesión 16.", "2025-08-02 22:53:34", "2025-08-02 22:53:34"),
	(196, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 4, NULL, "{\"type\":\"egreso\",\"amount\":1000,\"description\":\"pago x4\",\"cash_session_id\":20}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "oaothh9XrO3WlmD3VfQKcnkcs5y941MX", "Movimiento de caja registrado: egreso de 1000 en sesión 20.", "2025-08-02 22:54:04", "2025-08-02 22:54:04"),
	(197, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 16, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-02 23:00:00", "2025-08-02 23:00:00"),
	(198, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 20, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-02 23:00:00", "2025-08-02 23:00:00"),
	(199, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 5, NULL, "{\"type\":\"egreso\",\"amount\":1000,\"description\":\"pago x6\",\"cash_session_id\":16}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "oaothh9XrO3WlmD3VfQKcnkcs5y941MX", "Movimiento de caja registrado: egreso de 1000 en sesión 16.", "2025-08-02 23:02:53", "2025-08-02 23:02:53"),
	(200, 1, "INICIO_CIERRE_CAJA", "cash_session", 16, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":12171.5,\"discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "oaothh9XrO3WlmD3VfQKcnkcs5y941MX", "Cajero inició cierre. Declarado: 12171.5, Diferencia Preliminar: 0", "2025-08-02 23:29:40", "2025-08-02 23:29:40"),
	(201, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 20, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-03 12:00:00", "2025-08-03 12:00:00"),
	(202, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 16, NULL, "{\"status\":\"cerrada\",\"verified_amount\":12171.5,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "opivpmWfpTZ_iwuhLBitEVIk8ftT_OA6", "Admin finalizó cierre. Verificado: 12171.5, Diferencia Final: 0", "2025-08-03 12:05:15", "2025-08-03 12:05:15"),
	(203, 3, "INICIO_CIERRE_CAJA", "cash_session", 20, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":500,\"discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "sklx9Gp3q4GW7DGCxfsdmxwLkRoHpmm5", "Cajero inició cierre. Declarado: 500, Diferencia Preliminar: 0", "2025-08-03 12:39:57", "2025-08-03 12:39:57"),
	(204, 1, "ABRIR_SESION_CAJA", "cash_session", 21, NULL, "{\"status\":\"abierta\",\"opening_amount\":5000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "jr8RXXGw6j86-D0grc7cqFef4agEIa6K", "Apertura de sesión de caja con monto inicial: 5000", "2025-08-04 14:11:18", "2025-08-04 14:11:18"),
	(205, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":1,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "CQNU-gcACONz0didHaLBDvVjiTYVA9Kb", "Producto \"undefined\" (cantidad: 1, precio: 1000) agregado manualmente a la venta.", "2025-08-04 19:52:13", "2025-08-04 19:52:13"),
	(206, 1, "CREAR_VENTA", "sale", 78, NULL, "{\"payments\":[{\"amount\":1000,\"method_id\":1}],\"total_neto\":1000,\"customer_id\":1,\"total_amount\":1000,\"cash_session_id\":21,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "CQNU-gcACONz0didHaLBDvVjiTYVA9Kb", "Nueva venta registrada por 1000 con pagos: [\"1000 (1)\"]", "2025-08-04 19:52:13", "2025-08-04 19:52:13"),
	(207, 1, "CREAR_VENTA", "sale", 79, NULL, "{\"payments\":[{\"amount\":150.75,\"method_id\":1}],\"total_neto\":150.75,\"customer_id\":1,\"total_amount\":150.75,\"cash_session_id\":21,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "CQNU-gcACONz0didHaLBDvVjiTYVA9Kb", "Nueva venta registrada por 150.75 con pagos: [\"150.75 (1)\"]", "2025-08-04 19:55:10", "2025-08-04 19:55:10"),
	(208, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 21, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "Sesión abierta por más de 12 horas - Usuario: undefined", "2025-08-05 11:00:00", "2025-08-05 11:00:00"),
	(209, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 6, NULL, "{\"type\":\"egreso\",\"amount\":1000,\"description\":\"pago proveedor xx\",\"cash_session_id\":21}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Movimiento de caja registrado: egreso de 1000 en sesión 21.", "2025-08-05 11:38:19", "2025-08-05 11:38:19"),
	(210, 1, "INICIO_CIERRE_CAJA", "cash_session", 21, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":5150.75,\"discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Cajero inició cierre. Declarado: 5150.75, Diferencia Preliminar: 0", "2025-08-05 11:42:11", "2025-08-05 11:42:11"),
	(211, 1, "ABRIR_SESION_CAJA", "cash_session", 22, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Apertura de sesión de caja con monto inicial: 1000", "2025-08-05 11:45:59", "2025-08-05 11:45:59"),
	(212, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":150.75,\"quantity\":11,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Producto \"undefined\" (cantidad: 11, precio: 150.75) agregado manualmente a la venta.", "2025-08-05 12:02:06", "2025-08-05 12:02:06"),
	(213, 1, "CREAR_VENTA", "sale", 80, NULL, "{\"payments\":[{\"amount\":1000,\"method_id\":1},{\"amount\":658.25,\"method_id\":6}],\"total_neto\":1658.25,\"customer_id\":7,\"total_amount\":1658.25,\"cash_session_id\":22,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Nueva venta registrada por 1658.25 con pagos: [\"1000 (1)\",\"658.25 (6)\"]", "2025-08-05 12:02:06", "2025-08-05 12:02:06"),
	(214, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":150.75,\"quantity\":10,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Producto \"undefined\" (cantidad: 10, precio: 150.75) agregado manualmente a la venta.", "2025-08-05 12:03:53", "2025-08-05 12:03:53"),
	(215, 1, "CREAR_VENTA", "sale", 81, NULL, "{\"payments\":[{\"amount\":1507.5,\"method_id\":6}],\"total_neto\":1507.5,\"customer_id\":7,\"total_amount\":1507.5,\"cash_session_id\":22,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Nueva venta registrada por 1507.5 con pagos: [\"1507.5 (6)\"]", "2025-08-05 12:03:53", "2025-08-05 12:03:53"),
	(216, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":150.75,\"quantity\":10,\"description\":\"N/A\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Producto \"undefined\" (cantidad: 10, precio: 150.75) agregado manualmente a la venta.", "2025-08-05 12:05:41", "2025-08-05 12:05:41"),
	(217, 1, "CREAR_VENTA", "sale", 82, NULL, "{\"payments\":[{\"amount\":1507.5,\"method_id\":6}],\"total_neto\":1507.5,\"customer_id\":7,\"total_amount\":1507.5,\"cash_session_id\":22,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Nueva venta registrada por 1507.5 con pagos: [\"1507.5 (6)\"]", "2025-08-05 12:05:41", "2025-08-05 12:05:41"),
	(218, 1, "CAMBIO_PRECIO_MANUAL", "sale_item", 4, NULL, "{\"sale_id\":83,\"new_price\":151.75,\"product_name\":\"Producto Ejemplo\",\"original_price\":\"150.75\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "22", "Cambio de precio para \"Producto Ejemplo\" en la venta #83. Original: 150.75, Nuevo: 151.75", "2025-08-05 13:26:10", "2025-08-05 13:26:10"),
	(219, 1, "CREAR_VENTA", "sale", 83, NULL, "{\"payments\":[{\"amount\":1517.5,\"method_id\":6}],\"total_neto\":1517.5,\"customer_id\":7,\"total_amount\":1517.5,\"cash_session_id\":22,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Nueva venta registrada por 1517.5 con pagos: [\"1517.5 (6)\"]", "2025-08-05 13:26:10", "2025-08-05 13:26:10"),
	(220, 1, "CAMBIO_PRECIO_MANUAL", "sale_item", 4, NULL, "{\"sale_id\":84,\"new_price\":151.75,\"product_name\":\"Producto Ejemplo\",\"original_price\":\"150.75\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "22", "Cambio de precio para \"Producto Ejemplo\" en la venta #84. Original: 150.75, Nuevo: 151.75", "2025-08-05 13:27:59", "2025-08-05 13:27:59"),
	(221, 1, "CREAR_VENTA", "sale", 84, NULL, "{\"payments\":[{\"amount\":151.75,\"method_id\":1}],\"total_neto\":151.75,\"customer_id\":1,\"total_amount\":151.75,\"cash_session_id\":22,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "af1x8bZ7YPBryLLFm34CxdvEwdmwNui8", "Nueva venta registrada por 151.75 con pagos: [\"151.75 (1)\"]", "2025-08-05 13:27:59", "2025-08-05 13:27:59"),
	(222, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 21, NULL, "{\"status\":\"cerrada\",\"verified_amount\":5150.75,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "1dvDCweAcvlp2pe0lKvZ8VsbCJ0TrYrz", "Admin finalizó cierre. Verificado: 5150.75, Diferencia Final: 0", "2025-08-05 19:10:52", "2025-08-05 19:10:52"),
	(223, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 20, NULL, "{\"status\":\"cerrada\",\"verified_amount\":500,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "1dvDCweAcvlp2pe0lKvZ8VsbCJ0TrYrz", "Admin finalizó cierre. Verificado: 500, Diferencia Final: 0", "2025-08-05 19:11:02", "2025-08-05 19:11:02"),
	(224, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 22, NULL, "{\"status\":\"cerrada\",\"declared\":2151.75,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "1dvDCweAcvlp2pe0lKvZ8VsbCJ0TrYrz", "Administrador cerró su propia caja directamente. Declarado: 2151.75, Diferencia Final: 0", "2025-08-05 19:12:05", "2025-08-05 19:12:05"),
	(225, 1, "ABRIR_SESION_CAJA", "cash_session", 23, NULL, "{\"status\":\"abierta\",\"opening_amount\":1500}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "1dvDCweAcvlp2pe0lKvZ8VsbCJ0TrYrz", "Apertura de sesión de caja con monto inicial: 1500", "2025-08-05 19:15:39", "2025-08-05 19:15:39"),
	(226, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-06 11:00:00", "2025-08-06 11:00:00"),
	(227, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-06 12:00:00", "2025-08-06 12:00:00"),
	(228, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-06 13:00:00", "2025-08-06 13:00:00"),
	(229, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-06 14:00:00", "2025-08-06 14:00:00"),
	(230, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-06 15:00:00", "2025-08-06 15:00:00"),
	(231, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-07 11:00:00", "2025-08-07 11:00:00"),
	(232, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-07 12:00:00", "2025-08-07 12:00:00"),
	(233, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-07 13:00:00", "2025-08-07 13:00:00"),
	(234, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-07 14:00:00", "2025-08-07 14:00:00"),
	(235, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-07 15:00:00", "2025-08-07 15:00:00"),
	(236, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-07 20:00:00", "2025-08-07 20:00:00"),
	(237, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 23, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-07 21:00:00", "2025-08-07 21:00:00"),
	(238, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 23, NULL, "{\"status\":\"cerrada\",\"declared\":1500,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "Jp5bF0mO7533gjiWAeL6ANF4xYm8oD7_", "Administrador cerró su propia caja directamente. Declarado: 1500, Diferencia Final: 0", "2025-08-11 20:30:02", "2025-08-11 20:30:02"),
	(239, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:12:08", "2025-08-13 18:12:08"),
	(240, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#540a31\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:19:56", "2025-08-13 18:19:56"),
	(241, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:20:30", "2025-08-13 18:20:30"),
	(242, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#ee0682\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:26:26", "2025-08-13 18:26:26"),
	(243, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:31:28", "2025-08-13 18:31:28"),
	(244, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#f11f8f\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:32:00", "2025-08-13 18:32:00"),
	(245, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#acb00c\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:33:54", "2025-08-13 18:33:54"),
	(246, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#b0330c\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:37:32", "2025-08-13 18:37:32"),
	(247, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#a3b00c\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "FNUffiuhf78s4voiuybh9bUMTDg8tYt1", "Se actualizó la paleta de colores del sistema.", "2025-08-13 18:44:15", "2025-08-13 18:44:15"),
	(248, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#3c82d4\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XOpl_SR2C4eKTn-ub7zrivBRl6ND9cMO", "Se actualizó la paleta de colores del sistema.", "2025-08-14 17:25:58", "2025-08-14 17:25:58"),
	(249, 1, "ABRIR_SESION_CAJA", "cash_session", 24, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XOpl_SR2C4eKTn-ub7zrivBRl6ND9cMO", "Apertura de sesión de caja con monto inicial: 1000", "2025-08-14 19:33:39", "2025-08-14 19:33:39"),
	(250, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 24, NULL, "{\"status\":\"cerrada\",\"declared\":1000,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XOpl_SR2C4eKTn-ub7zrivBRl6ND9cMO", "Administrador cerró su propia caja directamente. Declarado: 1000, Diferencia Final: 0", "2025-08-14 19:38:33", "2025-08-14 19:38:33"),
	(251, 1, "ABRIR_SESION_CAJA", "cash_session", 25, NULL, "{\"status\":\"abierta\",\"opening_amount\":1500}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XOpl_SR2C4eKTn-ub7zrivBRl6ND9cMO", "Apertura de sesión de caja con monto inicial: 1500", "2025-08-14 19:38:45", "2025-08-14 19:38:45"),
	(252, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#0b79e8\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#3c82d4\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XOpl_SR2C4eKTn-ub7zrivBRl6ND9cMO", "Se actualizó la paleta de colores del sistema.", "2025-08-14 22:56:02", "2025-08-14 22:56:02"),
	(253, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#8C3061\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\"}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XOpl_SR2C4eKTn-ub7zrivBRl6ND9cMO", "Se actualizó la paleta de colores del sistema.", "2025-08-14 22:56:18", "2025-08-14 22:56:18"),
	(254, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#ae3c36\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#8C3061\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\"}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XOpl_SR2C4eKTn-ub7zrivBRl6ND9cMO", "Se actualizó la paleta de colores del sistema.", "2025-08-15 00:07:10", "2025-08-15 00:07:10"),
	(255, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#ae3c36\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#8C3061\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e82619\",\"#e7df1c\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\"}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XTAPNQlVWxKmPTlCnhfNR6SMf23byazL", "Se actualizó la paleta de colores del sistema.", "2025-08-15 00:26:57", "2025-08-15 00:26:57"),
	(256, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#8C3061\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XTAPNQlVWxKmPTlCnhfNR6SMf23byazL", "Se actualizó la paleta de colores del sistema.", "2025-08-15 00:39:13", "2025-08-15 00:39:13"),
	(257, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#8C3061\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#dd9cbe\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "XTAPNQlVWxKmPTlCnhfNR6SMf23byazL", "Se actualizó la paleta de colores del sistema.", "2025-08-15 00:39:36", "2025-08-15 00:39:36"),
	(258, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 25, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-15 15:00:00", "2025-08-15 15:00:00"),
	(259, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 25, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-15 16:00:00", "2025-08-15 16:00:00"),
	(260, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 25, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-15 17:00:00", "2025-08-15 17:00:00"),
	(261, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 25, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-15 18:00:00", "2025-08-15 18:00:00"),
	(262, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 25, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-15 19:00:00", "2025-08-15 19:00:00"),
	(263, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#8C3061\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:05:08", "2025-08-15 19:05:08"),
	(264, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:06:51", "2025-08-15 19:06:51"),
	(265, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:13:53", "2025-08-15 19:13:53"),
	(266, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0968ed\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:14:41", "2025-08-15 19:14:41"),
	(267, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:15:03", "2025-08-15 19:15:03"),
	(268, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#f61414\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:16:07", "2025-08-15 19:16:07"),
	(269, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:16:37", "2025-08-15 19:16:37"),
	(270, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:19:02", "2025-08-15 19:19:02"),
	(271, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#280a19\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:20:20", "2025-08-15 19:20:20"),
	(272, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#4d1430\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:20:39", "2025-08-15 19:20:39"),
	(273, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:20:50", "2025-08-15 19:20:50"),
	(274, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titleSecondary\":\"#0578f6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:36:56", "2025-08-15 19:36:56"),
	(275, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:37:13", "2025-08-15 19:37:13"),
	(276, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#d9cbc9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:37:50", "2025-08-15 19:37:50"),
	(277, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#eb2509\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:38:08", "2025-08-15 19:38:08"),
	(278, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:38:26", "2025-08-15 19:38:26"),
	(279, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#c8443e\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:41:41", "2025-08-15 19:41:41"),
	(280, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#56283f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:42:24", "2025-08-15 19:42:24"),
	(281, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#593a49\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:42:52", "2025-08-15 19:42:52"),
	(282, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#392730\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 19:43:03", "2025-08-15 19:43:03"),
	(283, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 25, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-15 20:00:00", "2025-08-15 20:00:00"),
	(284, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 20:01:24", "2025-08-15 20:01:24"),
	(285, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 25, NULL, "{\"status\":\"cerrada\",\"declared\":1500,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Administrador cerró su propia caja directamente. Declarado: 1500, Diferencia Final: 0", "2025-08-15 20:11:30", "2025-08-15 20:11:30"),
	(286, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#111111\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Se actualizó la paleta de colores del sistema.", "2025-08-15 20:31:14", "2025-08-15 20:31:14"),
	(287, 1, "ABRIR_SESION_CAJA", "cash_session", 26, NULL, "{\"status\":\"abierta\",\"opening_amount\":1500}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Apertura de sesión de caja con monto inicial: 1500", "2025-08-15 21:36:12", "2025-08-15 21:36:12"),
	(288, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 26, NULL, "{\"status\":\"cerrada\",\"declared\":1500,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "dr0VOZAsgCMS5Gkk43IKEFXzpIoGVGx3", "Administrador cerró su propia caja directamente. Declarado: 1500, Diferencia Final: 0", "2025-08-15 21:36:24", "2025-08-15 21:36:24"),
	(289, 3, "ABRIR_SESION_CAJA", "cash_session", 27, NULL, "{\"status\":\"abierta\",\"opening_amount\":2000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "a5L_ml1i9vfEKbRQbVKk4CktL5i7WaYY", "Apertura de sesión de caja con monto inicial: 2000", "2025-08-15 21:43:18", "2025-08-15 21:43:18"),
	(290, 3, "INICIO_CIERRE_CAJA", "cash_session", 27, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":2000,\"discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "a5L_ml1i9vfEKbRQbVKk4CktL5i7WaYY", "Cajero inició cierre. Declarado: 2000, Diferencia Preliminar: 0", "2025-08-15 21:43:30", "2025-08-15 21:43:30"),
	(291, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 27, NULL, "{\"status\":\"cerrada\",\"verified_amount\":2000,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "gsZ6Mc0IIu48hgmelhG2lps9TKaO2EfD", "Admin finalizó cierre. Verificado: 2000, Diferencia Final: 0", "2025-08-15 21:44:01", "2025-08-15 21:44:01"),
	(292, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#e10808\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del sistema.", "2025-08-16 15:56:46", "2025-08-16 15:56:46"),
	(293, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1e1c1c\",\"appBar\":\"#14040c\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del sistema.", "2025-08-16 15:56:57", "2025-08-16 15:56:57"),
	(294, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1e1c1c\",\"appBar\":\"#14040c\",\"dialog\":\"#535f56\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del sistema.", "2025-08-16 15:57:30", "2025-08-16 15:57:30"),
	(295, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1e1c1c\",\"appBar\":\"#14040c\",\"dialog\":\"#728176\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del sistema.", "2025-08-16 15:58:17", "2025-08-16 15:58:17"),
	(296, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1e1c1c\",\"appBar\":\"#14040c\",\"dialog\":\"#5d7363\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del sistema.", "2025-08-16 15:58:50", "2025-08-16 15:58:50"),
	(297, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1e1c1c\",\"appBar\":\"#14040c\",\"dialog\":\"#5d7363\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#454545\",\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del sistema.", "2025-08-16 16:24:06", "2025-08-16 16:24:06"),
	(298, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1e1c1c\",\"appBar\":\"#14040c\",\"dialog\":\"#5e7063\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#454545\",\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del sistema.", "2025-08-16 16:24:47", "2025-08-16 16:24:47"),
	(299, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#0569d6\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#511030\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#eba7c8\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1e1c1c\",\"appBar\":\"#14040c\",\"dialog\":\"#5e7063\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#3e3e3e\",\"tableHeader\":\"#5d0e39\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#14040c\",\"#5d4953\"],\"direction\":\"135deg\"}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del sistema.", "2025-08-16 16:25:15", "2025-08-16 16:25:15"),
	(300, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#ef160c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#8C3061\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo dark.", "2025-08-16 18:27:12", "2025-08-16 18:27:12"),
	(301, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#C9E9D2\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#E0E0E0\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#E0E0E0\",\"appBar\":\"#546E7A\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#ECECEC\",\"#F0F0F0\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#C9E9D2\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:30:31", "2025-08-16 18:30:31"),
	(302, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#8beea7\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#E0E0E0\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#E0E0E0\",\"appBar\":\"#546E7A\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#ECECEC\",\"#F0F0F0\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#C9E9D2\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:30:50", "2025-08-16 18:30:50"),
	(303, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#9fefb6\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#E0E0E0\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#E0E0E0\",\"appBar\":\"#546E7A\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#ECECEC\",\"#F0F0F0\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#C9E9D2\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:30:59", "2025-08-16 18:30:59"),
	(304, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#9fefb6\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#E0E0E0\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#E0E0E0\",\"appBar\":\"#546E7A\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#C9E9D2\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:31:35", "2025-08-16 18:31:35"),
	(305, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#9fefb6\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#E0E0E0\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#546E7A\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#C9E9D2\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:31:50", "2025-08-16 18:31:50"),
	(306, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#9fefb6\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#546E7A\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#C9E9D2\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:32:46", "2025-08-16 18:32:46"),
	(307, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#9fefb6\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#6fafcc\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#C9E9D2\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:33:30", "2025-08-16 18:33:30"),
	(308, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#9fefb6\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#6fafcc\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#84b7cf\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:34:03", "2025-08-16 18:34:03"),
	(309, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#6aa47b\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#6fafcc\",\"dialog\":\"#E0E0E0\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#E0E0E0\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#84b7cf\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:34:58", "2025-08-16 18:34:58"),
	(310, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#757575\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#6aa47b\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#6fafcc\",\"dialog\":\"#d9d7d7\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#d9d8d8\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#84b7cf\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:36:04", "2025-08-16 18:36:04"),
	(311, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#6a6969\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#6aa47b\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#6fafcc\",\"dialog\":\"#d9d7d7\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#d9d8d8\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#84b7cf\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "0Doyc9IBLOCpPLB54_Q6u0VYoJWEFndn", "Se actualizó la paleta de colores del modo light.", "2025-08-16 18:38:27", "2025-08-16 18:38:27"),
	(312, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"30.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: 30.000, Stock mínimo: 5.00", "2025-08-16 23:52:36", "2025-08-16 23:52:36"),
	(313, 1, "ABRIR_SESION_CAJA", "cash_session", 28, NULL, "{\"status\":\"abierta\",\"opening_amount\":1}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "kaaWFhX7oIfgUaZ0R-lz-tmvqXcNgvsU", "Apertura de sesión de caja con monto inicial: 1", "2025-08-17 14:38:04", "2025-08-17 14:38:04"),
	(314, 1, "ALERTA_STOCK_BAJO", "stock", 5, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"3.250\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Jamon Cocido Paladini. Stock actual: 3.250, Stock mínimo: 5.00", "2025-08-17 19:00:40", "2025-08-17 19:00:40"),
	(315, 1, "CREAR_VENTA", "sale", 85, NULL, "{\"payments\":[{\"amount\":5000,\"method_id\":1}],\"total_neto\":5000,\"customer_id\":1,\"total_amount\":5000,\"cash_session_id\":28,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "kaaWFhX7oIfgUaZ0R-lz-tmvqXcNgvsU", "Nueva venta registrada por 5000 con pagos: [\"5000 (1)\"]", "2025-08-17 19:00:40", "2025-08-17 19:00:40"),
	(316, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-18 11:00:00", "2025-08-18 11:00:00"),
	(317, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-18 12:00:00", "2025-08-18 12:00:00"),
	(318, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-18 13:00:00", "2025-08-18 13:00:00"),
	(319, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-18 14:00:00", "2025-08-18 14:00:00"),
	(320, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-18 15:00:00", "2025-08-18 15:00:00"),
	(321, 1, "CREAR_TICKET_PENDIENTE", "pending_ticket", 1, NULL, "{\"name\":\"prueba1\",\"ticket_data\":{\"customer\":{\"id\":1,\"name\":\"Consumidor Final\"},\"impuesto\":0,\"subtotal\":250.5,\"descuento\":0,\"ivaActivo\":false,\"tempTable\":[{\"cost\":250.5,\"name\":\"Producto de Ejemplo 2\",\"price\":\"250.50\",\"temp_id\":1755530004537.1746,\"stock_id\":2,\"units_id\":1,\"force_sale\":false,\"category_id\":1,\"description\":\"Descripción del producto de ejemplo 2\",\"quantityPerUnits\":1}],\"totalFinal\":250.5,\"paymentType\":{\"id\":1,\"active\":true,\"method\":\"Efectivo\",\"createdAt\":\"2025-07-11T11:19:32.000Z\",\"updatedAt\":\"2025-07-11T11:19:32.000Z\",\"description\":\"Pago en efectivo\"},\"mixedPayments\":[{\"amount\":\"\",\"payment_method_id\":null},{\"amount\":\"\",\"payment_method_id\":null}],\"paymentOption\":\"single\"}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "GTmmNOrgT4F9SkDhVs223w3EMqDFFjMK", "Se creó el ticket pendiente \"prueba1\".", "2025-08-18 15:42:07", "2025-08-18 15:42:07"),
	(322, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#ef160c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#5070c3\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "GTmmNOrgT4F9SkDhVs223w3EMqDFFjMK", "Se actualizó la paleta de colores del modo dark.", "2025-08-18 15:44:28", "2025-08-18 15:44:28"),
	(323, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#ef160c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e42cb\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "GTmmNOrgT4F9SkDhVs223w3EMqDFFjMK", "Se actualizó la paleta de colores del modo dark.", "2025-08-18 15:45:15", "2025-08-18 15:45:15"),
	(324, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#ef160c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e42cb\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "GTmmNOrgT4F9SkDhVs223w3EMqDFFjMK", "Se actualizó la paleta de colores del modo dark.", "2025-08-18 15:45:41", "2025-08-18 15:45:41"),
	(325, 1, "CREAR_TICKET_PENDIENTE", "pending_ticket", 2, NULL, "{\"name\":\"maxi\",\"ticket_data\":{\"customer\":{\"id\":1,\"name\":\"Consumidor Final\"},\"impuesto\":0,\"subtotal\":250.5,\"descuento\":0,\"ivaActivo\":false,\"tempTable\":[{\"cost\":250.5,\"name\":\"Producto de Ejemplo 2\",\"price\":\"250.50\",\"temp_id\":1755532181544.5483,\"stock_id\":2,\"units_id\":1,\"force_sale\":false,\"category_id\":1,\"description\":\"Descripción del producto de ejemplo 2\",\"quantityPerUnits\":1}],\"totalFinal\":250.5,\"paymentType\":{\"id\":1,\"active\":true,\"method\":\"Efectivo\",\"createdAt\":\"2025-07-11T11:19:32.000Z\",\"updatedAt\":\"2025-07-11T11:19:32.000Z\",\"description\":\"Pago en efectivo\"},\"mixedPayments\":[{\"amount\":\"\",\"payment_method_id\":null},{\"amount\":\"\",\"payment_method_id\":null}],\"paymentOption\":\"single\"}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "GTmmNOrgT4F9SkDhVs223w3EMqDFFjMK", "Se creó el ticket pendiente \"maxi\".", "2025-08-18 15:49:51", "2025-08-18 15:49:51"),
	(326, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"29.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: 29.000, Stock mínimo: 5.00", "2025-08-18 15:50:46", "2025-08-18 15:50:46"),
	(327, 1, "CREAR_VENTA", "sale", 86, NULL, "{\"payments\":[{\"amount\":250.5,\"method_id\":1}],\"total_neto\":250.5,\"customer_id\":1,\"total_amount\":250.5,\"cash_session_id\":28,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "GTmmNOrgT4F9SkDhVs223w3EMqDFFjMK", "Nueva venta registrada por 250.5 con pagos: [\"250.5 (1)\"]", "2025-08-18 15:50:46", "2025-08-18 15:50:46"),
	(328, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"28.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: 28.000, Stock mínimo: 5.00", "2025-08-18 15:51:01", "2025-08-18 15:51:01"),
	(329, 1, "CREAR_VENTA", "sale", 87, NULL, "{\"payments\":[{\"amount\":250.5,\"method_id\":1}],\"total_neto\":250.5,\"customer_id\":1,\"total_amount\":250.5,\"cash_session_id\":28,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "GTmmNOrgT4F9SkDhVs223w3EMqDFFjMK", "Nueva venta registrada por 250.5 con pagos: [\"250.5 (1)\"]", "2025-08-18 15:51:01", "2025-08-18 15:51:01"),
	(330, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-18 21:00:00", "2025-08-18 21:00:00"),
	(331, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"27.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: 27.000, Stock mínimo: 5.00", "2025-08-18 21:02:22", "2025-08-18 21:02:22"),
	(332, 1, "CREAR_VENTA", "sale", 88, NULL, "{\"payments\":[{\"amount\":250.5,\"method_id\":1}],\"total_neto\":250.5,\"customer_id\":1,\"total_amount\":250.5,\"cash_session_id\":28,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Nueva venta registrada por 250.5 con pagos: [\"250.5 (1)\"]", "2025-08-18 21:02:22", "2025-08-18 21:02:22"),
	(333, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"26.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: 26.000, Stock mínimo: 5.00", "2025-08-18 21:11:09", "2025-08-18 21:11:09"),
	(334, 1, "CREAR_VENTA", "sale", 89, NULL, "{\"payments\":[{\"amount\":250.5,\"method_id\":1}],\"total_neto\":250.5,\"customer_id\":1,\"total_amount\":250.5,\"cash_session_id\":28,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Nueva venta registrada por 250.5 con pagos: [\"250.5 (1)\"]", "2025-08-18 21:11:09", "2025-08-18 21:11:09"),
	(335, 1, "ALERTA_STOCK_BAJO", "stock", 2, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"25.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto de Ejemplo 2. Stock actual: 25.000, Stock mínimo: 5.00", "2025-08-18 21:13:03", "2025-08-18 21:13:03"),
	(336, 1, "CREAR_VENTA", "sale", 90, NULL, "{\"payments\":[{\"amount\":250.5,\"method_id\":1}],\"total_neto\":250.5,\"customer_id\":1,\"total_amount\":250.5,\"cash_session_id\":28,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Nueva venta registrada por 250.5 con pagos: [\"250.5 (1)\"]", "2025-08-18 21:13:04", "2025-08-18 21:13:04"),
	(337, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 7, NULL, "{\"type\":\"ingreso\",\"amount\":1000,\"description\":\"prueba\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: ingreso de 1000 en sesión 28.", "2025-08-18 21:24:41", "2025-08-18 21:24:41"),
	(338, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 8, NULL, "{\"type\":\"egreso\",\"amount\":1000,\"description\":\"prueba2\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: egreso de 1000 en sesión 28.", "2025-08-18 21:28:47", "2025-08-18 21:28:47"),
	(339, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-18 22:00:00", "2025-08-18 22:00:00"),
	(340, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-18 23:00:00", "2025-08-18 23:00:00"),
	(341, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 9, NULL, "{\"type\":\"ingreso\",\"amount\":1000,\"description\":\"ingreso\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: ingreso de 1000 en sesión 28.", "2025-08-18 23:24:01", "2025-08-18 23:24:01"),
	(342, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 10, NULL, "{\"type\":\"egreso\",\"amount\":1000,\"description\":\"egreso\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: egreso de 1000 en sesión 28.", "2025-08-18 23:24:14", "2025-08-18 23:24:14"),
	(343, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 11, NULL, "{\"type\":\"ingreso\",\"amount\":1000,\"description\":\"ingreso\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: ingreso de 1000 en sesión 28.", "2025-08-18 23:24:29", "2025-08-18 23:24:29"),
	(344, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 12, NULL, "{\"type\":\"egreso\",\"amount\":1000,\"description\":\"egreso\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: egreso de 1000 en sesión 28.", "2025-08-18 23:24:49", "2025-08-18 23:24:49"),
	(345, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 13, NULL, "{\"type\":\"ingreso\",\"amount\":1000,\"description\":\"ingreso\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: ingreso de 1000 en sesión 28.", "2025-08-18 23:41:27", "2025-08-18 23:41:27"),
	(346, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 14, NULL, "{\"type\":\"ingreso\",\"amount\":1000,\"description\":\"dsfads\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: ingreso de 1000 en sesión 28.", "2025-08-18 23:43:56", "2025-08-18 23:43:56"),
	(347, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 15, NULL, "{\"type\":\"ingreso\",\"amount\":1000,\"description\":\"sdfsd\",\"cash_session_id\":28}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "BXY5DD7PeSkxkpUCdlS-mfBnrZYnP3q7", "Movimiento de caja registrado: ingreso de 1000 en sesión 28.", "2025-08-18 23:45:22", "2025-08-18 23:45:22"),
	(348, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-19 11:00:00", "2025-08-19 11:00:00"),
	(349, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-19 12:00:00", "2025-08-19 12:00:00"),
	(350, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-19 13:00:00", "2025-08-19 13:00:00"),
	(351, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-19 14:00:00", "2025-08-19 14:00:00"),
	(352, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 28, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-19 15:00:00", "2025-08-19 15:00:00"),
	(353, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 28, NULL, "{\"status\":\"cerrada\",\"declared\":9253.5,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "O1ZUGGWprmvHImULO_aX-jWdkb-vGf4T", "Administrador cerró su propia caja directamente. Declarado: 9253.5, Diferencia Final: 0", "2025-08-20 10:19:33", "2025-08-20 10:19:33"),
	(354, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#3b2734\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e42cb\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "O1ZUGGWprmvHImULO_aX-jWdkb-vGf4T", "Se actualizó la paleta de colores del modo dark.", "2025-08-20 11:09:26", "2025-08-20 11:09:26"),
	(355, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#4b243d\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e42cb\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "O1ZUGGWprmvHImULO_aX-jWdkb-vGf4T", "Se actualizó la paleta de colores del modo dark.", "2025-08-20 11:09:39", "2025-08-20 11:09:39"),
	(356, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e42cb\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "O1ZUGGWprmvHImULO_aX-jWdkb-vGf4T", "Se actualizó la paleta de colores del modo dark.", "2025-08-20 11:09:54", "2025-08-20 11:09:54"),
	(357, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e42cb\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "O1ZUGGWprmvHImULO_aX-jWdkb-vGf4T", "Se actualizó la paleta de colores del modo dark.", "2025-08-20 11:10:31", "2025-08-20 11:10:31"),
	(358, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "O1ZUGGWprmvHImULO_aX-jWdkb-vGf4T", "Se actualizó la paleta de colores del modo dark.", "2025-08-20 11:21:25", "2025-08-20 11:21:25"),
	(359, 1, "ABRIR_SESION_CAJA", "cash_session", 29, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "tqZBDQm17IWyoSe6izuD5FDuiCQLy5z3", "Apertura de sesión de caja con monto inicial: 1000", "2025-08-21 00:02:51", "2025-08-21 00:02:51"),
	(360, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-21 13:00:00", "2025-08-21 13:00:00"),
	(361, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-21 14:00:00", "2025-08-21 14:00:00"),
	(362, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-21 15:00:00", "2025-08-21 15:00:00"),
	(363, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-21 18:00:00", "2025-08-21 18:00:00"),
	(364, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb1e00\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "EdbmBpC4il8UsBN2bBfB6MVThVhpzpCQ", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:10:50", "2025-08-21 18:10:50"),
	(365, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#9f0103\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "EdbmBpC4il8UsBN2bBfB6MVThVhpzpCQ", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:11:51", "2025-08-21 18:11:51"),
	(366, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#349f01\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "EdbmBpC4il8UsBN2bBfB6MVThVhpzpCQ", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:12:21", "2025-08-21 18:12:21"),
	(367, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#000000\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "EdbmBpC4il8UsBN2bBfB6MVThVhpzpCQ", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:14:02", "2025-08-21 18:14:02"),
	(368, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fc0202\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "EdbmBpC4il8UsBN2bBfB6MVThVhpzpCQ", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:14:57", "2025-08-21 18:14:57"),
	(369, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#740000\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "EdbmBpC4il8UsBN2bBfB6MVThVhpzpCQ", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:15:47", "2025-08-21 18:15:47"),
	(370, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#25111e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "ggszYM9ig8sQbnz5Y-lQ1tbEmgQ6r_jX", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:31:44", "2025-08-21 18:31:44"),
	(371, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#280c1e\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "ggszYM9ig8sQbnz5Y-lQ1tbEmgQ6r_jX", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:34:10", "2025-08-21 18:34:10"),
	(372, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#411028\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#0e0c1f\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "ggszYM9ig8sQbnz5Y-lQ1tbEmgQ6r_jX", "Se actualizó la paleta de colores del modo dark.", "2025-08-21 18:34:29", "2025-08-21 18:34:29"),
	(373, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-21 19:00:00", "2025-08-21 19:00:00"),
	(374, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-21 23:00:00", "2025-08-21 23:00:00"),
	(375, 1, "PRICE_OVERRIDE", "sale_item", 12, NULL, "{\"sale_id\":91,\"new_price\":\"1800.00\",\"product_name\":\"Huevo\",\"original_price\":\"300.00\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "29", "Cambio de precio para \"Huevo\" en la venta #91. Original: 300.00, Nuevo: 1800.00", "2025-08-21 23:34:43", "2025-08-21 23:34:43"),
	(376, 1, "CREAR_VENTA", "sale", 91, NULL, "{\"payments\":[{\"amount\":5400,\"method_id\":1}],\"total_neto\":5400,\"customer_id\":1,\"total_amount\":5400,\"cash_session_id\":29,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "ggszYM9ig8sQbnz5Y-lQ1tbEmgQ6r_jX", "Nueva venta registrada por 5400 con pagos: [\"5400 (1)\"]", "2025-08-21 23:34:43", "2025-08-21 23:34:43"),
	(377, 1, "PRICE_OVERRIDE", "sale_item", 12, NULL, "{\"sale_id\":92,\"new_price\":\"1800.00\",\"product_name\":\"Huevo\",\"original_price\":\"300.00\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "29", "Cambio de precio para \"Huevo\" en la venta #92. Original: 300.00, Nuevo: 1800.00", "2025-08-21 23:38:34", "2025-08-21 23:38:34"),
	(378, 1, "CREAR_VENTA", "sale", 92, NULL, "{\"payments\":[{\"amount\":1800,\"method_id\":1}],\"total_neto\":1800,\"customer_id\":1,\"total_amount\":1800,\"cash_session_id\":29,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "ggszYM9ig8sQbnz5Y-lQ1tbEmgQ6r_jX", "Nueva venta registrada por 1800 con pagos: [\"1800 (1)\"]", "2025-08-21 23:38:34", "2025-08-21 23:38:34"),
	(379, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-22 12:00:00", "2025-08-22 12:00:00"),
	(380, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-22 13:00:00", "2025-08-22 13:00:00"),
	(381, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-22 14:00:00", "2025-08-22 14:00:00"),
	(382, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-22 15:00:00", "2025-08-22 15:00:00"),
	(383, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-23 16:00:00", "2025-08-23 16:00:00"),
	(384, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-23 17:00:00", "2025-08-23 17:00:00"),
	(385, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-23 18:00:00", "2025-08-23 18:00:00"),
	(386, 1, "CREAR_VENTA", "sale", 101, NULL, "{\"payments\":[{\"amount\":15000,\"method_id\":1}],\"total_neto\":15000,\"customer_id\":1,\"total_amount\":15000,\"cash_session_id\":29,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "3LHUuk6UHaaVG29TqJIXsNVMOBJP8_8x", "Nueva venta registrada por 15000 con pagos: [\"15000 (1)\"]", "2025-08-23 18:19:41", "2025-08-23 18:19:41"),
	(387, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-23 19:00:00", "2025-08-23 19:00:00"),
	(388, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-23 20:00:00", "2025-08-23 20:00:00"),
	(389, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-23 21:00:00", "2025-08-23 21:00:00"),
	(390, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-24 16:00:00", "2025-08-24 16:00:00"),
	(391, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-24 17:00:00", "2025-08-24 17:00:00"),
	(392, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-24 18:00:00", "2025-08-24 18:00:00"),
	(393, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-24 19:00:00", "2025-08-24 19:00:00"),
	(394, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-24 20:00:00", "2025-08-24 20:00:00"),
	(395, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-24 23:00:00", "2025-08-24 23:00:00"),
	(396, 1, "CREAR_VENTA", "sale", 102, NULL, "{\"payments\":[{\"amount\":2400,\"method_id\":1}],\"total_neto\":2400,\"customer_id\":1,\"total_amount\":2400,\"cash_session_id\":29,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "027dOh61RNsw-nK7W9ng1S3ZlnIl8rSb", "Nueva venta registrada por 2400 con pagos: [\"2400 (1)\"]", "2025-08-25 10:42:23", "2025-08-25 10:42:23"),
	(397, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-25 11:00:00", "2025-08-25 11:00:00"),
	(398, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-25 12:00:00", "2025-08-25 12:00:00"),
	(399, 1, "ALERTA_STOCK_BAJO", "stock", 3, NULL, "{\"min_stock\":\"24.00\",\"current_stock\":\"1.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Coca-Cola 500. Stock actual: 1.000, Stock mínimo: 24.00", "2025-08-25 12:19:44", "2025-08-25 12:19:44"),
	(400, 1, "CREAR_VENTA", "sale", 103, NULL, "{\"payments\":[{\"amount\":1500,\"method_id\":1}],\"total_neto\":1200,\"customer_id\":1,\"total_amount\":1200,\"cash_session_id\":29,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "kTiKwiy_x1ae2USzElIPhD10xrvAcZkk", "Nueva venta registrada por 1200 con pagos: [\"1500 (1)\"]", "2025-08-25 12:19:44", "2025-08-25 12:19:44"),
	(401, 1, "CREAR_VENTA", "sale", 104, NULL, "{\"payments\":[{\"amount\":1200,\"method_id\":1}],\"total_neto\":1200,\"customer_id\":1,\"total_amount\":1200,\"cash_session_id\":29,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "kTiKwiy_x1ae2USzElIPhD10xrvAcZkk", "Nueva venta registrada por 1200 con pagos: [\"1200 (1)\"]", "2025-08-25 12:55:13", "2025-08-25 12:55:13"),
	(402, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-25 13:00:00", "2025-08-25 13:00:00"),
	(403, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-25 23:00:00", "2025-08-25 23:00:00"),
	(404, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 29, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-26 00:00:00", "2025-08-26 00:00:00"),
	(405, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#411028\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#252236\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "liMwY8u6XDIwznv5esqWDIT72-Exat8M", "Se actualizó la paleta de colores del modo dark.", "2025-08-26 10:13:29", "2025-08-26 10:13:29"),
	(406, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"contained\":{\"main\":\"#3b0909\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#411028\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#252236\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "liMwY8u6XDIwznv5esqWDIT72-Exat8M", "Se actualizó la paleta de colores del modo dark.", "2025-08-26 10:18:13", "2025-08-26 10:18:13"),
	(407, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#3b0b0b\"},\"contained\":{\"main\":\"#3b0909\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#411028\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#252236\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#452134\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "liMwY8u6XDIwznv5esqWDIT72-Exat8M", "Se actualizó la paleta de colores del modo dark.", "2025-08-26 10:18:23", "2025-08-26 10:18:23"),
	(408, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 29, NULL, "{\"status\":\"cerrada\",\"declared\":28300,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "liMwY8u6XDIwznv5esqWDIT72-Exat8M", "Administrador cerró su propia caja directamente. Declarado: 28300, Diferencia Final: 0", "2025-08-26 10:51:50", "2025-08-26 10:51:50"),
	(409, 1, "REGISTRAR_PAGO_CLIENTE", "customer_payment", 23, NULL, "{\"amount\":50,\"new_debt\":100.75,\"customer_id\":\"2\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "liMwY8u6XDIwznv5esqWDIT72-Exat8M", "Se registró un pago de 50 para el cliente Juan Perez. Deuda actualizada a 100.75.", "2025-08-26 10:52:05", "2025-08-26 10:52:05"),
	(410, 1, "ABRIR_SESION_CAJA", "cash_session", 30, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "liMwY8u6XDIwznv5esqWDIT72-Exat8M", "Apertura de sesión de caja con monto inicial: 1000", "2025-08-26 10:56:58", "2025-08-26 10:56:58"),
	(411, 1, "CASH_INCOME", "cash_session", 30, NULL, "{\"amount\":50,\"description\":\"Cobranza a cliente: Juan Perez\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "30", "Ingreso de efectivo por cobranza: 50 a cliente Juan Perez", "2025-08-26 10:57:18", "2025-08-26 10:57:18"),
	(412, 1, "REGISTRAR_PAGO_CLIENTE", "customer_payment", 24, NULL, "{\"amount\":50,\"new_debt\":50.75,\"customer_id\":\"2\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "30", "Se registró un pago de 50 para el cliente Juan Perez. Deuda actualizada a 50.75.", "2025-08-26 10:57:18", "2025-08-26 10:57:18"),
	(413, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-26 23:00:00", "2025-08-26 23:00:00"),
	(414, 1, "PRICE_OVERRIDE", "sale_item", 6, NULL, "{\"sale_id\":117,\"new_price\":7000,\"product_name\":\"Queso Cremoso Ilolay\",\"original_price\":\"7500.00\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "30", "Cambio de precio para \"Queso Cremoso Ilolay\" en la venta #117. Original: 7500.00, Nuevo: 7000", "2025-08-26 23:30:06", "2025-08-26 23:30:06"),
	(415, 1, "PRICE_OVERRIDE", "sale_item", 6, NULL, "{\"sale_id\":117,\"new_price\":6500,\"product_name\":\"Queso Cremoso Ilolay\",\"original_price\":\"7500.00\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "30", "Cambio de precio para \"Queso Cremoso Ilolay\" en la venta #117. Original: 7500.00, Nuevo: 6500", "2025-08-26 23:30:06", "2025-08-26 23:30:06"),
	(416, 1, "CREAR_VENTA", "sale", 117, NULL, "{\"payments\":[{\"amount\":21000,\"method_id\":1}],\"total_neto\":21000,\"customer_id\":1,\"total_amount\":21000,\"cash_session_id\":30,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "CoXTd5ka63FVG-_hwgyyXEmudSW4i9pg", "Nueva venta registrada por 21000 con pagos: [\"21000 (1)\"]", "2025-08-26 23:30:06", "2025-08-26 23:30:06"),
	(417, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-27 00:00:00", "2025-08-27 00:00:00"),
	(418, 1, "ALERTA_STOCK_BAJO", "stock", 4, NULL, "{\"min_stock\":\"10.00\",\"current_stock\":\"1.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto Ejemplo. Stock actual: 1.000, Stock mínimo: 10.00", "2025-08-27 13:12:32", "2025-08-27 13:12:32"),
	(419, 1, "ALERTA_STOCK_BAJO", "stock", 5, NULL, "{\"min_stock\":\"5.00\",\"current_stock\":\"2.250\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Jamon Cocido Paladini. Stock actual: 2.250, Stock mínimo: 5.00", "2025-08-27 13:12:32", "2025-08-27 13:12:32"),
	(420, 1, "CREAR_VENTA", "sale", 118, NULL, "{\"payments\":[{\"amount\":11400,\"method_id\":1}],\"total_neto\":11350.75,\"customer_id\":1,\"total_amount\":11350.75,\"cash_session_id\":30,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "54VriBCkmznA0P7l0UBV7dLQUmYDZpLl", "Nueva venta registrada por 11350.75 con pagos: [\"11400 (1)\"]", "2025-08-27 13:12:32", "2025-08-27 13:12:32"),
	(421, 1, "CREAR_VENTA", "sale", 119, NULL, "{\"payments\":[{\"amount\":12700,\"method_id\":1}],\"total_neto\":12700,\"customer_id\":1,\"total_amount\":12700,\"cash_session_id\":30,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "54VriBCkmznA0P7l0UBV7dLQUmYDZpLl", "Nueva venta registrada por 12700 con pagos: [\"12700 (1)\"]", "2025-08-27 13:15:06", "2025-08-27 13:15:06"),
	(422, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-27 14:00:00", "2025-08-27 14:00:00"),
	(423, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-27 15:00:00", "2025-08-27 15:00:00"),
	(424, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-28 21:00:00", "2025-08-28 21:00:00"),
	(425, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-28 22:00:00", "2025-08-28 22:00:00"),
	(426, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-29 13:00:00", "2025-08-29 13:00:00"),
	(427, 1, "CREAR_VENTA", "sale", 120, NULL, "{\"payments\":[{\"amount\":17500,\"method_id\":1}],\"total_neto\":17400,\"customer_id\":1,\"total_amount\":17400,\"cash_session_id\":30,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "2QQrZ7UFkQnI_Otdt_LadWJep2HUebZ3", "Nueva venta registrada por 17400 con pagos: [\"17500 (1)\"]", "2025-08-29 13:28:17", "2025-08-29 13:28:17"),
	(428, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-29 14:00:00", "2025-08-29 14:00:00"),
	(429, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-29 15:00:00", "2025-08-29 15:00:00"),
	(430, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-30 14:00:00", "2025-08-30 14:00:00"),
	(431, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-30 15:00:00", "2025-08-30 15:00:00"),
	(432, 1, "UPDATE_USER_PERMISSION", "user_permissions", 3, NULL, "{\"type\":\"grant\",\"user_id\":\"3\",\"permission_id\":27}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "IBDSc0JnScfRrmWx86ydQe28uj2bssOT", "Se aplicó el permiso \'grant\' (ID: 27) al usuario con ID: 3.", "2025-08-30 15:01:05", "2025-08-30 15:01:05"),
	(433, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-30 16:00:00", "2025-08-30 16:00:00"),
	(434, 1, "UPDATE_USER_PERMISSION", "user_permissions", 3, NULL, "{\"type\":\"revoke\",\"user_id\":\"3\",\"permission_id\":27}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "047K6jJyks5qlTvGulVK-qTdP9T4XFGk", "Se aplicó el permiso \'revoke\' (ID: 27) al usuario con ID: 3.", "2025-08-30 16:13:33", "2025-08-30 16:13:33"),
	(435, 1, "UPDATE_USER_PERMISSION", "user_permissions", 3, NULL, "{\"type\":\"grant\",\"user_id\":\"3\",\"permission_id\":36}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "047K6jJyks5qlTvGulVK-qTdP9T4XFGk", "Se aplicó el permiso \'grant\' (ID: 36) al usuario con ID: 3.", "2025-08-30 16:14:03", "2025-08-30 16:14:03"),
	(436, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-08-30 17:00:00", "2025-08-30 17:00:00"),
	(437, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-01 11:00:00", "2025-09-01 11:00:00"),
	(438, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-01 12:00:00", "2025-09-01 12:00:00"),
	(439, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-01 13:00:00", "2025-09-01 13:00:00"),
	(440, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-01 14:00:00", "2025-09-01 14:00:00"),
	(441, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-01 15:00:00", "2025-09-01 15:00:00"),
	(442, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-01 22:00:00", "2025-09-01 22:00:00"),
	(443, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-01 23:00:00", "2025-09-01 23:00:00"),
	(444, 1, "CREAR_VENTA", "sale", 121, NULL, "{\"payments\":[{\"amount\":150,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":30,\"promotion_discount\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "hLLhYm07V7Vu8W2FbegOgv4sgzbEe-kE", "Nueva venta registrada por 150 con pagos: [\"150 (1)\"]", "2025-09-01 23:52:45", "2025-09-01 23:52:45"),
	(445, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 30, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-02 00:00:00", "2025-09-02 00:00:00"),
	(446, 1, "CASH_INCOME", "cash_session", 30, NULL, "{\"amount\":10,\"description\":\"Cobranza a cliente: Juan Perez\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "30", "Ingreso de efectivo por cobranza: 10 a cliente Juan Perez", "2025-09-02 00:03:51", "2025-09-02 00:03:51"),
	(447, 1, "REGISTRAR_PAGO_CLIENTE", "customer_payment", 25, NULL, "{\"amount\":10,\"new_debt\":40.75,\"customer_id\":\"2\"}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "30", "Se registró un pago de 10 para el cliente Juan Perez. Deuda actualizada a 40.75.", "2025-09-02 00:03:51", "2025-09-02 00:03:51"),
	(448, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 30, NULL, "{\"status\":\"cerrada\",\"declared\":63810,\"final_discrepancy\":0}", "::1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "hLLhYm07V7Vu8W2FbegOgv4sgzbEe-kE", "Administrador cerró su propia caja directamente. Declarado: 63810, Diferencia Final: 0", "2025-09-02 00:30:03", "2025-09-02 00:30:03"),
	(449, 5, "ABRIR_SESION_CAJA", "cash_session", 31, NULL, "{\"status\":\"abierta\",\"opening_amount\":500}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Apertura de sesión de caja con monto inicial: 500", "2025-09-02 11:31:16", "2025-09-02 11:31:16"),
	(450, 5, "CREAR_VENTA", "sale", 122, NULL, "{\"payments\":[{\"amount\":200,\"method_id\":1}],\"total_neto\":150,\"customer_id\":1,\"total_amount\":150,\"cash_session_id\":31,\"promotion_discount\":0}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Nueva venta registrada por 150 con pagos: [\"200 (1)\"]", "2025-09-02 11:31:52", "2025-09-02 11:31:52"),
	(451, 5, "CASH_MOVEMENT_CREATED", "cash_movement", 18, NULL, "{\"type\":\"egreso\",\"amount\":200,\"description\":\"pago a proveedor\",\"cash_session_id\":31}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Movimiento de caja registrado: egreso de 200 en sesión 31.", "2025-09-02 11:33:28", "2025-09-02 11:33:28"),
	(452, 5, "CREAR_TICKET_PENDIENTE", "pending_ticket", 3, NULL, "{\"name\":\"para maisi\",\"ticket_data\":{\"customer\":{\"id\":1,\"name\":\"Consumidor Final\"},\"impuesto\":0,\"subtotal\":22780,\"descuento\":0,\"ivaActivo\":false,\"tempTable\":[{\"cost\":1680,\"name\":\"Huevo (1/2 Docena)\",\"type\":\"presentation\",\"price\":\"1680.00\",\"temp_id\":1756813649767.007,\"quantity\":1,\"stock_id\":12,\"units_id\":1,\"force_sale\":false,\"category_id\":1,\"description\":\"Huevo\",\"is_manual_entry\":false,\"presentation_id\":9,\"quantity_for_stock_deduction\":6},{\"cost\":3600,\"name\":\"Queso Cremoso Ilolay (1/2 Horma)\",\"type\":\"presentation\",\"price\":7200,\"temp_id\":1756813844919.4143,\"quantity\":0.5,\"stock_id\":6,\"units_id\":2,\"force_sale\":false,\"category_id\":2,\"description\":\"Cremoso marca Ilolay\",\"is_manual_entry\":false,\"presentation_id\":11,\"quantity_for_stock_deduction\":0.5},{\"id\":1,\"cost\":15000,\"name\":\"FernetCola\",\"type\":\"combo\",\"price\":\"15000.00\",\"temp_id\":1756813870383.5833,\"quantity\":1,\"description\":\"1.000x Fernet 750cc, 1.000x Coca-Cola 1.5\"},{\"cost\":2500,\"name\":\"Coca-Cola 1.5\",\"type\":\"product\",\"price\":\"2500.00\",\"temp_id\":1756813906415.774,\"quantity\":1,\"stock_id\":13,\"units_id\":1,\"force_sale\":false,\"category_id\":4,\"description\":\"Coca-Cola de 1.5 Litros\",\"quantity_for_stock_deduction\":1}],\"totalFinal\":22780,\"paymentType\":{\"id\":1,\"active\":true,\"method\":\"Efectivo\",\"createdAt\":\"2025-07-11T11:19:32.000Z\",\"updatedAt\":\"2025-07-11T11:19:32.000Z\",\"description\":\"Pago en efectivo\"},\"mixedPayments\":[{\"amount\":\"\",\"payment_method_id\":null},{\"amount\":\"\",\"payment_method_id\":null}],\"paymentOption\":\"single\"}}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Se creó el ticket pendiente \"para maisi\".", "2025-09-02 11:53:01", "2025-09-02 11:53:01"),
	(453, 5, "CASH_INCOME", "cash_session", 31, NULL, "{\"amount\":0.75,\"description\":\"Cobranza a cliente: Juan Perez\"}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "31", "Ingreso de efectivo por cobranza: 0.75 a cliente Juan Perez", "2025-09-02 11:56:25", "2025-09-02 11:56:25"),
	(454, 5, "REGISTRAR_PAGO_CLIENTE", "customer_payment", 26, NULL, "{\"amount\":0.75,\"new_debt\":40,\"customer_id\":\"2\"}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "31", "Se registró un pago de 0.75 para el cliente Juan Perez. Deuda actualizada a 40.", "2025-09-02 11:56:25", "2025-09-02 11:56:25"),
	(455, 5, "CREAR_VENTA", "sale", 123, NULL, "{\"payments\":[{\"amount\":\"7200.00\",\"method_id\":2}],\"total_neto\":7200,\"customer_id\":1,\"total_amount\":7200,\"cash_session_id\":31,\"promotion_discount\":0}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Nueva venta registrada por 7200 con pagos: [\"7200.00 (2)\"]", "2025-09-02 11:58:38", "2025-09-02 11:58:38"),
	(456, 5, "CAMBIO_PRECIO_MANUAL", "sale_item", 12, NULL, "{\"sale_id\":124,\"new_price\":\"1680.00\",\"product_name\":\"Huevo\",\"original_price\":\"300.00\"}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "31", "Cambio de precio para \"Huevo\" en la venta #124. Original: 300.00, Nuevo: 1680.00", "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(457, 5, "CAMBIO_PRECIO_MANUAL", "sale_item", 6, NULL, "{\"sale_id\":124,\"new_price\":7200,\"product_name\":\"Queso Cremoso Ilolay\",\"original_price\":\"7500.00\"}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "31", "Cambio de precio para \"Queso Cremoso Ilolay\" en la venta #124. Original: 7500.00, Nuevo: 7200", "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(458, 5, "CREAR_VENTA", "sale", 124, NULL, "{\"payments\":[{\"amount\":22780,\"method_id\":6}],\"total_neto\":22780,\"customer_id\":2,\"total_amount\":22780,\"cash_session_id\":31,\"promotion_discount\":0}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Nueva venta registrada por 22780 con pagos: [\"22780 (6)\"]", "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(459, 5, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#3b0b0b\"},\"contained\":{\"main\":\"#3b0909\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#411028\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#54143c\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#252236\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#784b63\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Se actualizó la paleta de colores del modo dark.", "2025-09-02 12:04:23", "2025-09-02 12:04:23"),
	(460, 5, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#3b0b0b\"},\"contained\":{\"main\":\"#3b0909\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#411028\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#ff009f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#252236\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#784b63\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Se actualizó la paleta de colores del modo dark.", "2025-09-02 12:04:59", "2025-09-02 12:04:59"),
	(461, 5, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#ff008a\"},\"contained\":{\"main\":\"#3b0909\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#411028\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#ff009f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#252236\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#784b63\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Se actualizó la paleta de colores del modo dark.", "2025-09-02 12:05:58", "2025-09-02 12:05:58"),
	(462, 5, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#ff008a\"},\"contained\":{\"main\":\"#3b0909\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#fc1486\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#ff009f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#252236\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#784b63\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Se actualizó la paleta de colores del modo dark.", "2025-09-02 12:06:26", "2025-09-02 12:06:26"),
	(463, 5, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#ff008a\"},\"contained\":{\"main\":\"#3b0909\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#ff009f\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f91a1e\",\"main\":\"#ffc226\"},\"secondary\":{\"main\":\"#ff009f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#252236\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#784b63\",\"#8e496d\"],\"direction\":\"135deg\"}}}}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Se actualizó la paleta de colores del modo dark.", "2025-09-02 12:06:55", "2025-09-02 12:06:55"),
	(464, 5, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#1A1A1A\",\"appBar\":\"#8C3061\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "192.168.100.200", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "wzed71t5_J1goHbWnR1Lhrj-ZXbKuuWW", "Se actualizó la paleta de colores del modo dark.", "2025-09-02 12:08:03", "2025-09-02 12:08:03"),
	(465, 1, "ABRIR_SESION_CAJA", "cash_session", 32, NULL, "{\"status\":\"abierta\",\"opening_amount\":5000}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "NVpkQWTb6A9HJ0R5iM6M0evgwnLc9Uvw", "Apertura de sesión de caja con monto inicial: 5000", "2025-09-02 12:35:25", "2025-09-02 12:35:25"),
	(466, 1, "CAMBIO_PRECIO_MANUAL", "sale_item", 6, NULL, "{\"sale_id\":125,\"new_price\":7200,\"product_name\":\"Queso Cremoso Ilolay\",\"original_price\":\"7500.00\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "32", "Cambio de precio para \"Queso Cremoso Ilolay\" en la venta #125. Original: 7500.00, Nuevo: 7200", "2025-09-02 15:37:59", "2025-09-02 15:37:59"),
	(467, 1, "CREAR_VENTA", "sale", 125, NULL, "{\"payments\":[{\"amount\":3600,\"method_id\":1}],\"total_neto\":3600,\"customer_id\":1,\"total_amount\":3600,\"cash_session_id\":32,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "QxAamdrbA-L2dE7CqxJUp-1yVOAzVl2T", "Nueva venta registrada por 3600 con pagos: [\"3600 (1)\"]", "2025-09-02 15:37:59", "2025-09-02 15:37:59"),
	(468, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1,\"quantity\":10,\"description\":\"N/A\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "QxAamdrbA-L2dE7CqxJUp-1yVOAzVl2T", "Producto \"undefined\" (cantidad: 10, precio: 1) agregado manualmente a la venta.", "2025-09-02 18:35:24", "2025-09-02 18:35:24"),
	(469, 1, "CREAR_VENTA", "sale", 126, NULL, "{\"payments\":[{\"amount\":160,\"method_id\":1}],\"total_neto\":160,\"customer_id\":1,\"total_amount\":160,\"cash_session_id\":32,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "QxAamdrbA-L2dE7CqxJUp-1yVOAzVl2T", "Nueva venta registrada por 160 con pagos: [\"160 (1)\"]", "2025-09-02 18:35:24", "2025-09-02 18:35:24"),
	(470, 1, "CAMBIO_PRECIO_MANUAL", "sale_item", 12, NULL, "{\"sale_id\":127,\"new_price\":300,\"product_name\":\"Huevo\",\"original_price\":\"300.00\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "32", "Cambio de precio para \"Huevo\" en la venta #127. Original: 300.00, Nuevo: 300", "2025-09-02 19:11:33", "2025-09-02 19:11:33"),
	(471, 1, "CREAR_VENTA", "sale", 127, NULL, "{\"payments\":[{\"amount\":1650,\"method_id\":1}],\"total_neto\":1650,\"customer_id\":1,\"total_amount\":1650,\"cash_session_id\":32,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36", "QxAamdrbA-L2dE7CqxJUp-1yVOAzVl2T", "Nueva venta registrada por 1650 con pagos: [\"1650 (1)\"]", "2025-09-02 19:11:33", "2025-09-02 19:11:33"),
	(472, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 31, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-03 12:00:00", "2025-09-03 12:00:00"),
	(473, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 32, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-03 12:00:00", "2025-09-03 12:00:00"),
	(474, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 31, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-03 13:00:00", "2025-09-03 13:00:00"),
	(475, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 32, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-03 13:00:00", "2025-09-03 13:00:00"),
	(476, 1, "ALERTA_STOCK_BAJO", "stock", 8, NULL, "{\"min_stock\":\"20.00\",\"current_stock\":\"106.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Lustra Muebles Suiza 360cm. Stock actual: 106.000, Stock mínimo: 20.00", "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(477, 1, "ALERTA_STOCK_BAJO", "stock", 4, NULL, "{\"min_stock\":\"10.00\",\"current_stock\":\"0.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto Ejemplo. Stock actual: 0.000, Stock mínimo: 10.00", "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(478, 1, "CREAR_VENTA", "sale", 128, NULL, "{\"payments\":[{\"amount\":27514.25,\"method_id\":1}],\"total_neto\":27514.25,\"customer_id\":1,\"total_amount\":27514.25,\"cash_session_id\":32,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "XkBgVAodIMHMUdnJmXdFiqtU7FHE8Hoj", "Nueva venta registrada por 27514.25 con pagos: [\"27514.25 (1)\"]", "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(479, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 31, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-03 14:00:00", "2025-09-03 14:00:00"),
	(480, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 32, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-03 14:00:00", "2025-09-03 14:00:00"),
	(481, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 31, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-03 15:00:00", "2025-09-03 15:00:00"),
	(482, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 32, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-03 15:00:00", "2025-09-03 15:00:00"),
	(483, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 31, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-04 13:00:00", "2025-09-04 13:00:00"),
	(484, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 32, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-04 13:00:00", "2025-09-04 13:00:00"),
	(485, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 31, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-04 14:00:00", "2025-09-04 14:00:00"),
	(486, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 32, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-04 14:00:00", "2025-09-04 14:00:00"),
	(487, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 31, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-04 15:00:00", "2025-09-04 15:00:00"),
	(488, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 32, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-04 15:00:00", "2025-09-04 15:00:00"),
	(489, 1, "INICIO_CIERRE_CAJA", "cash_session", 31, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":30130,\"discrepancy\":29629.25}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "QOWr7ay8cLIt-mqc7lMjXO_ESAhFMiEU", "Cajero inició cierre. Declarado: 30130, Diferencia Preliminar: 29629.25", "2025-09-04 15:44:50", "2025-09-04 15:44:50"),
	(490, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 31, NULL, "{\"status\":\"cerrada\",\"verified_amount\":500.75,\"final_discrepancy\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "QOWr7ay8cLIt-mqc7lMjXO_ESAhFMiEU", "Admin finalizó cierre. Verificado: 500.75, Diferencia Final: 0", "2025-09-04 15:47:38", "2025-09-04 15:47:38"),
	(491, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 32, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-04 21:00:00", "2025-09-04 21:00:00"),
	(492, 1, "CIERRE_DIRECTO_CAJA_ADMIN", "cash_session", 32, NULL, "{\"status\":\"cerrada\",\"declared\":37924.25,\"final_discrepancy\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "_cHDYJrqQL4MrFd4PTBVQQ-rHrXKcQ6u", "Administrador cerró su propia caja directamente. Declarado: 37924.25, Diferencia Final: 0", "2025-09-04 21:04:59", "2025-09-04 21:04:59"),
	(493, 1, "ABRIR_SESION_CAJA", "cash_session", 33, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "_hynrcQiNaBbcz4IhuBC9ylUB8P7Zt2e", "Apertura de sesión de caja con monto inicial: 1000", "2025-09-05 10:23:23", "2025-09-05 10:23:23"),
	(494, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-06 18:00:00", "2025-09-06 18:00:00"),
	(495, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-06 19:00:00", "2025-09-06 19:00:00"),
	(496, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-06 20:00:00", "2025-09-06 20:00:00"),
	(497, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#D95F59\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#8C3061\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "0RtZ-piAUPenTo1lrHrC_QjFTTCcU5tt", "Se actualizó la paleta de colores del modo dark.", "2025-09-06 20:33:37", "2025-09-06 20:33:37"),
	(498, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-06 21:00:00", "2025-09-06 21:00:00"),
	(499, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-06 22:00:00", "2025-09-06 22:00:00"),
	(500, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-07 16:00:00", "2025-09-07 16:00:00"),
	(501, 1, "CREAR_TICKET_PENDIENTE", "pending_ticket", 4, NULL, "{\"name\":\"Pedido 1\",\"ticket_data\":{\"customer\":{\"id\":1,\"name\":\"Consumidor Final\"},\"impuesto\":0,\"subtotal\":39854.05,\"descuento\":0,\"ivaActivo\":false,\"tempTable\":[{\"cost\":1250,\"name\":\"Mortadela\",\"type\":\"product\",\"price\":\"2500.00\",\"temp_id\":1757260494345.5078,\"quantity\":0.5,\"stock_id\":15,\"units_id\":2,\"force_sale\":false,\"category_id\":1,\"description\":\"bocha\",\"is_manual_entry\":false,\"quantity_for_stock_deduction\":0.5},{\"cost\":6500,\"name\":\"Lustra Muebles Suiza 360cm\",\"type\":\"product\",\"price\":\"6500.00\",\"temp_id\":1757260457486.2556,\"quantity\":1,\"stock_id\":8,\"units_id\":1,\"force_sale\":false,\"category_id\":8,\"description\":\"Aerosol naranja  pimienta\",\"quantity_for_stock_deduction\":1},{\"cost\":1680,\"name\":\"Huevo (1/2 Docena)\",\"type\":\"presentation\",\"price\":\"1680.00\",\"temp_id\":1756911690622.8877,\"quantity\":1,\"stock_id\":12,\"units_id\":1,\"force_sale\":false,\"category_id\":1,\"description\":\"Huevo\",\"is_manual_entry\":false,\"presentation_id\":9,\"quantity_for_stock_deduction\":6},{\"cost\":1200,\"name\":\"Coca-Cola 500\",\"type\":\"product\",\"price\":\"1200.00\",\"temp_id\":1756911669107.833,\"quantity\":1,\"stock_id\":3,\"units_id\":1,\"force_sale\":false,\"category_id\":4,\"description\":\"Coca-Colar de 500ml\",\"quantity_for_stock_deduction\":1},{\"id\":1,\"cost\":15000,\"name\":\"FernetCola\",\"type\":\"combo\",\"price\":\"15000.00\",\"temp_id\":1756911665193.2266,\"quantity\":1,\"description\":\"1x Coca-Cola 1.5, 1x Fernet 750cc\"},{\"cost\":150.75,\"name\":\"Producto Ejemplo\",\"type\":\"product\",\"price\":\"150.75\",\"temp_id\":1756911652428.996,\"quantity\":1,\"stock_id\":4,\"units_id\":1,\"force_sale\":true,\"category_id\":1,\"description\":\"Breve descripción del producto\",\"quantity_for_stock_deduction\":1},{\"cost\":250.5,\"name\":\"Producto de Ejemplo 2\",\"type\":\"product\",\"price\":\"250.50\",\"temp_id\":1756911649047.545,\"quantity\":1,\"stock_id\":2,\"units_id\":1,\"force_sale\":false,\"category_id\":1,\"description\":\"Descripción del producto de ejemplo 2\",\"quantity_for_stock_deduction\":1},{\"cost\":150,\"name\":\"Producto de Ejemplo 1\",\"type\":\"product\",\"price\":\"150.00\",\"temp_id\":1756911647839.8928,\"quantity\":1,\"stock_id\":1,\"units_id\":1,\"force_sale\":false,\"category_id\":1,\"description\":\"Descripción del producto de ejemplo 1\",\"quantity_for_stock_deduction\":1},{\"cost\":13672.8,\"name\":\"Queso Cremoso Ilolay (1/2 Horma)\",\"type\":\"presentation\",\"price\":7200,\"temp_id\":1756911639924.2517,\"quantity\":1.899,\"stock_id\":6,\"units_id\":2,\"force_sale\":false,\"category_id\":2,\"description\":\"Cremoso marca Ilolay\",\"is_manual_entry\":false,\"presentation_id\":11,\"quantity_for_stock_deduction\":1.899}],\"totalFinal\":39854.05,\"paymentType\":{\"id\":1,\"active\":true,\"method\":\"Efectivo\",\"createdAt\":\"2025-07-11T11:19:32.000Z\",\"updatedAt\":\"2025-07-11T11:19:32.000Z\",\"description\":\"Pago en efectivo\"},\"mixedPayments\":[{\"amount\":\"\",\"payment_method_id\":null},{\"amount\":\"\",\"payment_method_id\":null}],\"paymentOption\":\"single\"}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "H7PzeE3_NWDNOdgAN5WpiWv-R38wk_pg", "Se creó el ticket pendiente \"Pedido 1\".", "2025-09-07 16:09:47", "2025-09-07 16:09:47"),
	(502, 1, "ALERTA_STOCK_BAJO", "stock", 8, NULL, "{\"min_stock\":\"20.00\",\"current_stock\":\"105.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Lustra Muebles Suiza 360cm. Stock actual: 105.000, Stock mínimo: 20.00", "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(503, 1, "CAMBIO_PRECIO_MANUAL", "sale_item", 12, NULL, "{\"sale_id\":129,\"new_price\":\"1680.00\",\"product_name\":\"Huevo\",\"original_price\":\"300.00\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "33", "Cambio de precio para \"Huevo\" en la venta #129. Original: 300.00, Nuevo: 1680.00", "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(504, 1, "VENTA_FORZADA_STOCK_NEGATIVO", "stock", 4, NULL, "{\"stock_after\":-1,\"product_name\":\"Producto Ejemplo\",\"stock_before\":\"0.000\",\"quantity_sold\":1}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "H7PzeE3_NWDNOdgAN5WpiWv-R38wk_pg", "Venta forzada de 1 unidades de Producto Ejemplo. Stock pasó de 0.000 a -1.", "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(505, 1, "ALERTA_STOCK_BAJO", "stock", 4, NULL, "{\"min_stock\":\"10.00\",\"current_stock\":\"-1.000\"}", NULL, NULL, NULL, "Alerta de stock bajo para el producto Producto Ejemplo. Stock actual: -1.000, Stock mínimo: 10.00", "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(506, 1, "CAMBIO_PRECIO_MANUAL", "sale_item", 6, NULL, "{\"sale_id\":129,\"new_price\":7200,\"product_name\":\"Queso Cremoso Ilolay\",\"original_price\":\"7500.00\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "33", "Cambio de precio para \"Queso Cremoso Ilolay\" en la venta #129. Original: 7500.00, Nuevo: 7200", "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(507, 1, "CREAR_VENTA", "sale", 129, NULL, "{\"payments\":[{\"amount\":\"39854.05\",\"method_id\":4}],\"total_neto\":39854.05,\"customer_id\":1,\"total_amount\":39854.05,\"cash_session_id\":33,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "H7PzeE3_NWDNOdgAN5WpiWv-R38wk_pg", "Nueva venta registrada por 39854.05 con pagos: [\"39854.05 (4)\"]", "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(508, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-08 14:00:00", "2025-09-08 14:00:00"),
	(509, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#8C3061\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 14:06:37", "2025-09-08 14:06:37"),
	(510, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#0056c7\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 14:15:53", "2025-09-08 14:15:53"),
	(511, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22\",\"#0d1117\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#00f5ff33\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 14:46:17", "2025-09-08 14:46:17"),
	(512, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#04142aff\",\"#a7c2ebff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#00f5ff33\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 14:57:25", "2025-09-08 14:57:25");
INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `session_id`, `details`, `createdAt`, `updatedAt`) VALUES
	(513, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-08 15:00:00", "2025-09-08 15:00:00"),
	(514, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#161b22ff\",\"#0d1117ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#00f5ff33\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 15:10:16", "2025-09-08 15:10:16"),
	(515, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#00f5ff33\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 15:11:40", "2025-09-08 15:11:40"),
	(516, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#023133ff\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#8C3061\",\"#D95F59\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 15:14:28", "2025-09-08 15:14:28"),
	(517, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#023133ff\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#023133ff\",\"#079096ff\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 15:29:23", "2025-09-08 15:29:23"),
	(518, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#651f44ff\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#023133ff\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#023133ff\",\"#079096ff\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "K21GsY8dxeI27eKcyKiu6YR0jjaxYCOi", "Se actualizó la paleta de colores del modo dark.", "2025-09-08 15:32:13", "2025-09-08 15:32:13"),
	(519, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":0.5,\"description\":\"N/A\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "rtgRo2kAnbfXVMfWqWZRTfOv24jeygSv", "Producto \"undefined\" (cantidad: 0.5, precio: 1000) agregado manualmente a la venta.", "2025-09-09 10:44:45", "2025-09-09 10:44:45"),
	(520, 1, "CREAR_VENTA", "sale", 130, NULL, "{\"payments\":[{\"amount\":800,\"method_id\":1}],\"total_neto\":800,\"customer_id\":1,\"total_amount\":800,\"cash_session_id\":33,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "rtgRo2kAnbfXVMfWqWZRTfOv24jeygSv", "Nueva venta registrada por 800 con pagos: [\"800 (1)\"]", "2025-09-09 10:44:45", "2025-09-09 10:44:45"),
	(521, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#651f44ff\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#023133ff\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#8C3061\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#023133ff\",\"#08a5abff\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "rtgRo2kAnbfXVMfWqWZRTfOv24jeygSv", "Se actualizó la paleta de colores del modo dark.", "2025-09-09 10:45:28", "2025-09-09 10:45:28"),
	(522, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#651f44ff\"}},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#023133ff\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#b50345ff\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#023133ff\",\"#08a5abff\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "rtgRo2kAnbfXVMfWqWZRTfOv24jeygSv", "Se actualizó la paleta de colores del modo dark.", "2025-09-09 10:47:18", "2025-09-09 10:47:18"),
	(523, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"dark\",\"palette\":{\"info\":{\"dark\":\"#42a5f5\",\"main\":\"#63b3ed\"},\"text\":{\"primary\":\"#c9d1d9\",\"secondary\":\"#8b949e\",\"titlePrimary\":\"#c9d1d9\",\"titleSecondary\":\"#8b949e\"},\"button\":{\"outlined\":{\"main\":\"#651f44ff\"}},\"common\":{\"backdropOverlay\":\"#1e1d1dff\"},\"divider\":\"#424242\",\"primary\":{\"main\":\"#8C3061\"},\"shadows\":{\"card\":{\"color\":\"#00f5ff33\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"#00f5ff88\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#fb8c00\",\"main\":\"#ffa726\"},\"secondary\":{\"main\":\"#cc6c9f\"},\"background\":{\"card\":{\"type\":\"radial\",\"shape\":\"circle\",\"colors\":[\"#0d1117ff\",\"#1b1f28ff\"],\"position\":\"top left\"},\"paper\":\"#151515\",\"appBar\":\"#023133ff\",\"dialog\":\"#1A1A1A\",\"default\":{\"type\":\"linear\",\"colors\":[\"#020203\",\"#0e0d17\"],\"direction\":\"135deg\"},\"styledCard\":\"#1A1A1A\",\"tableHeader\":\"#b50345ff\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#023133ff\",\"#08a5abff\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "rtgRo2kAnbfXVMfWqWZRTfOv24jeygSv", "Se actualizó la paleta de colores del modo dark.", "2025-09-09 10:48:24", "2025-09-09 10:48:24"),
	(524, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-09 11:00:00", "2025-09-09 11:00:00"),
	(525, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-09 12:00:00", "2025-09-09 12:00:00"),
	(526, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-09 13:00:00", "2025-09-09 13:00:00"),
	(527, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-09 14:00:00", "2025-09-09 14:00:00"),
	(528, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-09 15:00:00", "2025-09-09 15:00:00"),
	(529, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-10 14:00:00", "2025-09-10 14:00:00"),
	(530, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-10 15:00:00", "2025-09-10 15:00:00"),
	(531, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-10 17:00:00", "2025-09-10 17:00:00"),
	(532, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-10 18:00:00", "2025-09-10 18:00:00"),
	(533, 6, "ABRIR_SESION_CAJA", "cash_session", 34, NULL, "{\"status\":\"abierta\",\"opening_amount\":5000}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "15gCAOfo59fwRjvxQIt_GV_w9yDjCw3Y", "Apertura de sesión de caja con monto inicial: 5000", "2025-09-10 18:15:42", "2025-09-10 18:15:42"),
	(534, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-10 19:00:00", "2025-09-10 19:00:00"),
	(535, 6, "CASH_INCOME", "cash_session", 34, NULL, "{\"amount\":1,\"description\":\"Cobranza a cliente: Juan Perez\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "34", "Ingreso de efectivo por cobranza: 1 a cliente Juan Perez", "2025-09-10 19:08:26", "2025-09-10 19:08:26"),
	(536, 6, "REGISTRAR_PAGO_CLIENTE", "customer_payment", 27, NULL, "{\"amount\":1,\"new_debt\":22819,\"customer_id\":\"2\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "34", "Se registró un pago de 1 para el cliente Juan Perez. Deuda actualizada a 22819.", "2025-09-10 19:08:26", "2025-09-10 19:08:26"),
	(537, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-10 21:00:00", "2025-09-10 21:00:00"),
	(538, 1, "CREAR_TICKET_PENDIENTE", "pending_ticket", 5, NULL, "{\"name\":\"1\",\"ticket_data\":{\"customer\":{\"id\":1,\"dni\":\"00000000\",\"debt\":\"0.00\",\"name\":\"Consumidor Final\",\"email\":\"consumidor.final@example.com\",\"phone\":\"000000000\",\"address\":\"N/A\",\"createdAt\":\"2025-07-11T11:19:32.000Z\",\"updatedAt\":\"2025-07-11T11:19:32.000Z\",\"credit_limit\":\"0.00\",\"discount_percentage\":\"0.00\"},\"impuesto\":0,\"subtotal\":4100,\"descuento\":0,\"ivaActivo\":false,\"tempTable\":[{\"cost\":1000,\"name\":\"cartulina\",\"price\":1000,\"temp_id\":1757537937543.9192,\"quantity\":1,\"stock_id\":null,\"units_id\":null,\"force_sale\":false,\"category_id\":null,\"description\":\"Producto manual\",\"is_manual_entry\":true,\"presentation_id\":null,\"quantity_for_stock_deduction\":1},{\"cost\":2400,\"name\":\"Coca-Cola 500\",\"type\":\"product\",\"price\":\"1200.00\",\"temp_id\":1757537865964.3962,\"quantity\":2,\"stock_id\":3,\"units_id\":1,\"force_sale\":false,\"category_id\":4,\"description\":\"Coca-Colar de 500ml\",\"quantity_for_stock_deduction\":2},{\"cost\":900,\"name\":\"Huevo\",\"type\":\"product\",\"price\":\"300.00\",\"temp_id\":1757537723607.213,\"quantity\":3,\"stock_id\":12,\"units_id\":1,\"force_sale\":false,\"category_id\":1,\"description\":\"Huevo\",\"quantity_for_stock_deduction\":3}],\"totalFinal\":4100,\"paymentType\":{\"id\":1,\"active\":true,\"method\":\"Efectivo\",\"createdAt\":\"2025-07-11T11:19:32.000Z\",\"updatedAt\":\"2025-07-11T11:19:32.000Z\",\"description\":\"Pago en efectivo\"},\"mixedPayments\":[{\"amount\":\"\",\"payment_method_id\":null},{\"amount\":\"\",\"payment_method_id\":null}],\"paymentOption\":\"single\"}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "ePBjcJ6lqNkQV2DRTw31HI5MKuYnAq2d", "Se creó el ticket pendiente \"1\".", "2025-09-10 21:03:34", "2025-09-10 21:03:34"),
	(539, 1, "VENTA_PRODUCTO_MANUAL", "sale_item", NULL, NULL, "{\"price\":1000,\"quantity\":1,\"description\":\"N/A\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "ePBjcJ6lqNkQV2DRTw31HI5MKuYnAq2d", "Producto \"undefined\" (cantidad: 1, precio: 1000) agregado manualmente a la venta.", "2025-09-10 21:05:43", "2025-09-10 21:05:43"),
	(540, 1, "CREAR_VENTA", "sale", 131, NULL, "{\"payments\":[{\"amount\":3000,\"method_id\":1},{\"amount\":1100,\"method_id\":2}],\"total_neto\":4100,\"customer_id\":1,\"total_amount\":4100,\"cash_session_id\":33,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "ePBjcJ6lqNkQV2DRTw31HI5MKuYnAq2d", "Nueva venta registrada por 4100 con pagos: [\"3000 (1)\",\"1100 (2)\"]", "2025-09-10 21:05:43", "2025-09-10 21:05:43"),
	(541, 6, "CREAR_VENTA", "sale", 132, NULL, "{\"payments\":[{\"amount\":1000,\"method_id\":1},{\"amount\":200,\"method_id\":2}],\"total_neto\":1200,\"customer_id\":1,\"total_amount\":1200,\"cash_session_id\":34,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "LgwI5OO1UOeKXHL7_1WatWM4dEti0sbi", "Nueva venta registrada por 1200 con pagos: [\"1000 (1)\",\"200 (2)\"]", "2025-09-10 21:16:25", "2025-09-10 21:16:25"),
	(542, 6, "INICIO_CIERRE_CAJA", "cash_session", 34, NULL, "{\"status\":\"pendiente_cierre\",\"declared\":6001,\"discrepancy\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "LgwI5OO1UOeKXHL7_1WatWM4dEti0sbi", "Cajero inició cierre. Declarado: 6001, Diferencia Preliminar: 0", "2025-09-10 21:20:01", "2025-09-10 21:20:01"),
	(543, 1, "FINALIZAR_CIERRE_CAJA", "cash_session", 34, NULL, "{\"status\":\"cerrada\",\"verified_amount\":5201,\"final_discrepancy\":-800}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "3VNNoWNL2Bz1_G1-UgDOsnXOLnxFByJ7", "Admin finalizó cierre. Verificado: 5201, Diferencia Final: -800", "2025-09-10 21:21:15", "2025-09-10 21:21:15"),
	(544, 1, "ACTUALIZAR_TEMA", "theme", NULL, NULL, "{\"mode\":\"light\",\"palette\":{\"info\":{\"dark\":\"#1976d2\",\"main\":\"#2196f3\"},\"text\":{\"primary\":\"#212121\",\"secondary\":\"#757575\",\"titlePrimary\":\"#212121\",\"titleSecondary\":\"#6a6969\"},\"common\":{\"backdropOverlay\":\"rgba(0, 0, 0, 0.75)\"},\"divider\":\"#BDBDBD\",\"primary\":{\"main\":\"#426b7e\"},\"shadows\":{\"card\":{\"color\":\"rgba(0, 0, 0, 0.2)\",\"properties\":\"inset 0 0 12px\"},\"cardHover\":{\"color\":\"rgba(0, 0, 0, 0.3)\",\"properties\":\"0 0 24px\"}},\"warning\":{\"dark\":\"#f57c00\",\"main\":\"#ff9800\"},\"secondary\":{\"main\":\"#6aa47b\"},\"background\":{\"card\":{\"type\":\"linear\",\"colors\":[\"#cfcfcf\",\"#E8E8E8\"],\"direction\":\"135deg\"},\"paper\":\"#d9d8d8\",\"appBar\":\"#cc6f75ff\",\"dialog\":\"#d9d7d7\",\"default\":{\"type\":\"linear\",\"colors\":[\"#e6e4e4\",\"#ebebeb\"],\"direction\":\"135deg\"},\"styledCard\":\"#d9d8d8\",\"tableHeader\":\"#546E7A\",\"componentHeaderBackground\":{\"type\":\"linear\",\"colors\":[\"#546E7A\",\"#84b7cf\"],\"direction\":\"135deg\"}}}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "3VNNoWNL2Bz1_G1-UgDOsnXOLnxFByJ7", "Se actualizó la paleta de colores del modo light.", "2025-09-10 21:48:24", "2025-09-10 21:48:24"),
	(545, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 21, NULL, "{\"type\":\"ingreso\",\"amount\":5000,\"description\":\"jhhj\",\"cash_session_id\":33}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "3VNNoWNL2Bz1_G1-UgDOsnXOLnxFByJ7", "Movimiento de caja registrado: ingreso de 5000 en sesión 33.", "2025-09-10 21:58:27", "2025-09-10 21:58:27"),
	(546, 1, "CASH_MOVEMENT_CREATED", "cash_movement", 22, NULL, "{\"type\":\"egreso\",\"amount\":8000,\"description\":\"prov x\",\"cash_session_id\":33}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "3VNNoWNL2Bz1_G1-UgDOsnXOLnxFByJ7", "Movimiento de caja registrado: egreso de 8000 en sesión 33.", "2025-09-10 21:59:43", "2025-09-10 21:59:43"),
	(547, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-10 22:00:00", "2025-09-10 22:00:00"),
	(548, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-11 12:00:00", "2025-09-11 12:00:00"),
	(549, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-11 13:00:00", "2025-09-11 13:00:00"),
	(550, 1, "CASH_INCOME", "cash_session", 33, NULL, "{\"amount\":10,\"description\":\"Cobranza a cliente: Juan Perez\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "33", "Ingreso de efectivo por cobranza: 10 a cliente Juan Perez", "2025-09-11 13:37:45", "2025-09-11 13:37:45"),
	(551, 1, "REGISTRAR_PAGO_CLIENTE", "customer_payment", 28, NULL, "{\"amount\":10,\"new_debt\":22809,\"customer_id\":\"2\"}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "33", "Se registró un pago de 10 para el cliente Juan Perez. Deuda actualizada a 22809.", "2025-09-11 13:37:45", "2025-09-11 13:37:45"),
	(552, 6, "ABRIR_SESION_CAJA", "cash_session", 35, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "cwNBv-HRQ-n7-AwttNKHT_97qPNO_aD1", "Apertura de sesión de caja con monto inicial: 1000", "2025-09-11 13:58:18", "2025-09-11 13:58:18"),
	(553, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-11 14:00:00", "2025-09-11 14:00:00"),
	(554, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-11 15:00:00", "2025-09-11 15:00:00"),
	(555, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 11:00:00", "2025-09-12 11:00:00"),
	(556, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 35, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 11:00:00", "2025-09-12 11:00:00"),
	(557, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 12:00:00", "2025-09-12 12:00:00"),
	(558, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 35, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 12:00:00", "2025-09-12 12:00:00"),
	(559, 6, "CREAR_TICKET_PENDIENTE", "pending_ticket", 6, NULL, "{\"name\":\"1\",\"ticket_data\":{\"customer\":{\"id\":4,\"dni\":\"30987654\",\"debt\":\"0.00\",\"name\":\"Carlos Lopez\",\"email\":\"carlos.lopez@example.com\",\"phone\":\"1144556677\",\"address\":\"Ruta 66 Km 10, Campo\",\"createdAt\":\"2025-07-21T12:24:46.000Z\",\"updatedAt\":\"2025-07-25T14:16:33.000Z\",\"credit_limit\":\"1500.00\",\"discount_percentage\":\"10.00\"},\"impuesto\":0,\"subtotal\":1200,\"descuento\":0,\"ivaActivo\":false,\"tempTable\":[{\"cost\":1200,\"name\":\"Coca-Cola 500\",\"type\":\"product\",\"price\":\"1200.00\",\"temp_id\":1757680008180.5898,\"quantity\":1,\"stock_id\":3,\"units_id\":1,\"force_sale\":false,\"category_id\":4,\"description\":\"Coca-Colar de 500ml\",\"quantity_for_stock_deduction\":1}],\"totalFinal\":1200,\"paymentType\":{\"id\":2,\"active\":true,\"method\":\"Mercado Pago\",\"createdAt\":\"2025-07-18T00:00:00.000Z\",\"updatedAt\":\"2025-07-18T00:00:00.000Z\",\"description\":\"Transferencia o QR.\"},\"mixedPayments\":[{\"amount\":\"\",\"payment_method_id\":null},{\"amount\":\"\",\"payment_method_id\":null}],\"paymentOption\":\"single\"}}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "mfADSABAFuhCXBe8d_NdW_4lV-O3OJ8D", "Se creó el ticket pendiente \"1\".", "2025-09-12 12:27:00", "2025-09-12 12:27:00"),
	(560, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 13:00:00", "2025-09-12 13:00:00"),
	(561, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 35, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 13:00:00", "2025-09-12 13:00:00"),
	(562, 3, "ABRIR_SESION_CAJA", "cash_session", 36, NULL, "{\"status\":\"abierta\",\"opening_amount\":1000}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "0aNfY7s0zXZSAen4O_mN-BbUab5LqMhK", "Apertura de sesión de caja con monto inicial: 1000", "2025-09-12 13:07:53", "2025-09-12 13:07:53"),
	(563, 3, "CREAR_VENTA", "sale", 133, NULL, "{\"payments\":[{\"amount\":250.5,\"method_id\":1}],\"total_neto\":250.5,\"customer_id\":1,\"total_amount\":250.5,\"cash_session_id\":36,\"promotion_discount\":0}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "0aNfY7s0zXZSAen4O_mN-BbUab5LqMhK", "Nueva venta registrada por 250.5 con pagos: [\"250.5 (1)\"]", "2025-09-12 13:08:09", "2025-09-12 13:08:09"),
	(564, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 14:00:00", "2025-09-12 14:00:00"),
	(565, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 35, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 14:00:00", "2025-09-12 14:00:00"),
	(566, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 33, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 15:00:00", "2025-09-12 15:00:00"),
	(567, 1, "ALERTA_SESION_PROLONGADA", "cash_session", 35, NULL, NULL, "127.0.0.1", "System Monitor", NULL, "La sesión ha estado abierta por más de 12 horas - Usuario: undefined", "2025-09-12 15:00:00", "2025-09-12 15:00:00"),
	(568, 1, "UPDATE_USER_PERMISSION", "user_permissions", 2, NULL, "{\"type\":\"revoke\",\"user_id\":\"2\",\"permission_id\":3}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "lwJfvRMvfiGZ-Z6Zl3MnRkQqop98M3BP", "Se aplicó el permiso \'revoke\' (ID: 3) al usuario con ID: 2.", "2025-09-12 15:43:02", "2025-09-12 15:43:02"),
	(569, 1, "UPDATE_USER_PERMISSION", "user_permissions", 2, NULL, "{\"type\":\"revoke\",\"user_id\":\"2\",\"permission_id\":3}", "127.0.0.1", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36", "lwJfvRMvfiGZ-Z6Zl3MnRkQqop98M3BP", "Se aplicó el permiso \'revoke\' (ID: 3) al usuario con ID: 2.", "2025-09-12 15:46:27", "2025-09-12 15:46:27");

/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table cash_session_movements
# ------------------------------------------------------------

DROP TABLE IF EXISTS `cash_session_movements`;

CREATE TABLE `cash_session_movements` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cash_session_id` bigint NOT NULL,
  `user_id` int NOT NULL,
  `type` enum('ingreso','egreso') COLLATE utf8mb4_spanish2_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cash_session_id` (`cash_session_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `cash_session_movements_ibfk_1` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cash_session_movements_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `cash_session_movements` WRITE;
/*!40000 ALTER TABLE `cash_session_movements` DISABLE KEYS */;

INSERT INTO `cash_session_movements` (`id`, `cash_session_id`, `user_id`, `type`, `amount`, `description`, `createdAt`, `updatedAt`) VALUES
	(1, 16, 1, "egreso", 1000, "pago x", "2025-08-02 20:30:01", "2025-08-02 20:30:01"),
	(2, 16, 1, "egreso", 1000, "pago x 2", "2025-08-02 20:30:23", "2025-08-02 20:30:23"),
	(3, 16, 1, "egreso", 1000, "pago x3", "2025-08-02 22:53:33", "2025-08-02 22:53:33"),
	(4, 20, 1, "egreso", 1000, "pago x4", "2025-08-02 22:54:04", "2025-08-02 22:54:04"),
	(5, 16, 1, "egreso", 1000, "pago x6", "2025-08-02 23:02:53", "2025-08-02 23:02:53"),
	(6, 21, 1, "egreso", 1000, "pago proveedor xx", "2025-08-05 11:38:19", "2025-08-05 11:38:19"),
	(7, 28, 1, "ingreso", 1000, "prueba", "2025-08-18 21:24:41", "2025-08-18 21:24:41"),
	(8, 28, 1, "egreso", 1000, "prueba2", "2025-08-18 21:28:47", "2025-08-18 21:28:47"),
	(9, 28, 1, "ingreso", 1000, "ingreso", "2025-08-18 23:24:01", "2025-08-18 23:24:01"),
	(10, 28, 1, "egreso", 1000, "egreso", "2025-08-18 23:24:14", "2025-08-18 23:24:14"),
	(11, 28, 1, "ingreso", 1000, "ingreso", "2025-08-18 23:24:29", "2025-08-18 23:24:29"),
	(12, 28, 1, "egreso", 1000, "egreso", "2025-08-18 23:24:49", "2025-08-18 23:24:49"),
	(13, 28, 1, "ingreso", 1000, "ingreso", "2025-08-18 23:41:27", "2025-08-18 23:41:27"),
	(14, 28, 1, "ingreso", 1000, "dsfads", "2025-08-18 23:43:56", "2025-08-18 23:43:56"),
	(15, 28, 1, "ingreso", 1000, "sdfsd", "2025-08-18 23:45:22", "2025-08-18 23:45:22"),
	(16, 30, 1, "ingreso", 50, "Cobranza a cliente: Juan Perez", "2025-08-26 10:57:18", "2025-08-26 10:57:18"),
	(17, 30, 1, "ingreso", 10, "Cobranza a cliente: Juan Perez", "2025-09-02 00:03:51", "2025-09-02 00:03:51"),
	(18, 31, 5, "egreso", 200, "pago a proveedor", "2025-09-02 11:33:28", "2025-09-02 11:33:28"),
	(19, 31, 5, "ingreso", 0.75, "Cobranza a cliente: Juan Perez", "2025-09-02 11:56:25", "2025-09-02 11:56:25"),
	(20, 34, 6, "ingreso", 1, "Cobranza a cliente: Juan Perez", "2025-09-10 19:08:26", "2025-09-10 19:08:26"),
	(21, 33, 1, "ingreso", 5000, "jhhj", "2025-09-10 21:58:27", "2025-09-10 21:58:27"),
	(22, 33, 1, "egreso", 8000, "prov x", "2025-09-10 21:59:43", "2025-09-10 21:59:43"),
	(23, 33, 1, "ingreso", 10, "Cobranza a cliente: Juan Perez", "2025-09-11 13:37:45", "2025-09-11 13:37:45");

/*!40000 ALTER TABLE `cash_session_movements` ENABLE KEYS */;
UNLOCK TABLES;



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
  `status` enum('abierta','pendiente_cierre','cerrada') COLLATE utf8mb4_spanish2_ci DEFAULT 'abierta',
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
  `admin_notes` text COLLATE utf8mb4_spanish2_ci,
  PRIMARY KEY (`id`),
  KEY `cash_sessions_ibfk_1` (`user_id`),
  KEY `fk_closed_by_user` (`closed_by_user_id`),
  KEY `fk_verified_by_admin` (`verified_by_admin_id`),
  CONSTRAINT `cash_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_closed_by_user` FOREIGN KEY (`closed_by_user_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_verified_by_admin` FOREIGN KEY (`verified_by_admin_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `cash_sessions` WRITE;
/*!40000 ALTER TABLE `cash_sessions` DISABLE KEYS */;

INSERT INTO `cash_sessions` (`id`, `user_id`, `opening_amount`, `cashier_declared_amount`, `total_sales`, `total_discounts`, `opened_at`, `closed_at`, `status`, `notes`, `createdAt`, `updatedAt`, `preliminary_discrepancy`, `closed_by_user_id`, `closed_at_user`, `admin_verified_amount`, `final_discrepancy`, `verified_by_admin_id`, `verified_at`, `total_sales_at_close`, `admin_notes`) VALUES
	(6, 1, 2000, 2500, 0, 0, "2025-07-14 21:58:54", "2025-07-14 21:59:25", "cerrada", "", "2025-07-14 21:58:54", "2025-07-14 21:59:25", 0, NULL, NULL, NULL, 0, NULL, "2025-07-14 21:59:25", 0, NULL),
	(7, 1, 5000, 5000, 0, 0, "2025-07-14 22:10:24", "2025-07-14 22:11:07", "cerrada", "", "2025-07-14 22:10:24", "2025-07-14 22:11:07", 0, NULL, NULL, NULL, 0, NULL, "2025-07-14 22:11:07", 0, NULL),
	(8, 1, 50000, 50000, 0, 0, "2025-07-14 22:13:57", "2025-07-14 22:14:23", "cerrada", "", "2025-07-14 22:13:57", "2025-07-14 22:14:23", 0, NULL, NULL, NULL, 0, NULL, "2025-07-14 22:14:23", 0, NULL),
	(9, 3, 15000, 20000, 0, 0, "2025-07-15 11:06:34", "2025-07-16 11:57:13", "cerrada", "", "2025-07-15 11:06:34", "2025-07-16 11:57:13", 0, NULL, NULL, NULL, 0, NULL, "2025-07-16 11:57:13", 0, NULL),
	(10, 1, 1500, 3000, 0, 0, "2025-07-15 11:15:18", "2025-07-16 11:57:05", "cerrada", "", "2025-07-15 11:15:18", "2025-07-16 11:57:05", 0, NULL, NULL, NULL, 0, NULL, "2025-07-16 11:57:05", 0, NULL),
	(11, 1, 1500, 0, 0, 0, "2025-07-18 11:02:43", "2025-07-18 11:03:09", "cerrada", "", "2025-07-18 11:02:43", "2025-07-18 11:03:09", 0, NULL, NULL, NULL, 0, NULL, "2025-07-18 11:03:09", 0, NULL),
	(12, 1, 5000, 5000, 9600, 0, "2025-07-18 11:33:39", "2025-07-21 12:07:27", "cerrada", "", "2025-07-18 11:33:39", "2025-07-21 12:07:27", 0, NULL, NULL, NULL, 0, NULL, "2025-07-21 12:07:27", 0, NULL),
	(13, 1, 5000, 6000, 1500.75, 0, "2025-07-21 20:30:02", "2025-07-24 13:11:04", "cerrada", "", "2025-07-21 20:30:02", "2025-07-24 13:11:04", 0, NULL, NULL, NULL, 0, NULL, "2025-07-24 13:11:04", 0, NULL),
	(14, 1, 50000, 100000, 58237.75, 0, "2025-07-24 15:03:35", "2025-07-29 13:56:07", "cerrada", "", "2025-07-24 15:03:35", "2025-07-29 13:56:07", 0, NULL, NULL, NULL, 0, NULL, "2025-07-29 13:56:07", 0, NULL),
	(15, 3, 5000, 50000, 150, 0, "2025-07-28 20:24:09", "2025-07-29 13:56:42", "cerrada", "", "2025-07-28 20:24:09", "2025-07-29 13:56:42", 0, NULL, NULL, NULL, 0, NULL, "2025-07-29 13:56:42", 0, NULL),
	(16, 1, 15000, 12171.5, NULL, NULL, "2025-07-29 14:16:09", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-07-29 14:16:09", "2025-08-03 12:05:15", 0, 1, "2025-08-02 23:29:40", 12171.5, 0, 1, "2025-08-03 12:05:15", 1171.5, NULL),
	(17, 3, 6000, 6300, NULL, NULL, "2025-07-30 10:48:13", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-07-30 10:48:13", "2025-07-31 23:12:01", 0, 3, "2025-07-31 12:49:06", 6300, 0, 1, "2025-07-31 23:12:01", 300, NULL),
	(18, 3, 1500, 1750, NULL, NULL, "2025-07-31 13:00:54", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-07-31 13:00:54", "2025-07-31 23:12:56", -0.75, 3, "2025-07-31 13:14:25", 1800, 49.25, 1, "2025-07-31 23:12:56", 5450.75, NULL),
	(19, 3, 2500, 4850, NULL, NULL, "2025-07-31 13:21:42", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-07-31 13:21:42", "2025-07-31 23:12:34", 0, 3, "2025-07-31 21:44:34", 4800, -50, 1, "2025-07-31 23:12:34", 4650, NULL),
	(20, 3, 1500, 500, NULL, NULL, "2025-08-01 13:34:06", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-08-01 13:34:06", "2025-08-05 19:11:02", 0, 3, "2025-08-03 12:39:57", 500, 0, 1, "2025-08-05 19:11:02", 0, NULL),
	(21, 1, 5000, 5150.75, NULL, NULL, "2025-08-04 14:11:18", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-08-04 14:11:18", "2025-08-05 19:10:52", 0, 1, "2025-08-05 11:42:11", 5150.75, 0, 1, "2025-08-05 19:10:52", 1150.75, NULL),
	(22, 1, 1000, 2151.75, NULL, NULL, "2025-08-05 11:45:59", NULL, "cerrada", "", "2025-08-05 11:45:59", "2025-08-05 19:12:05", 0, 1, "2025-08-05 19:12:05", 2151.75, 0, 1, "2025-08-05 19:12:05", 6342.5, NULL),
	(23, 1, 1500, 1500, NULL, NULL, "2025-08-05 19:15:39", NULL, "cerrada", "", "2025-08-05 19:15:39", "2025-08-11 20:30:02", 0, 1, "2025-08-11 20:30:02", 1500, 0, 1, "2025-08-11 20:30:02", 0, NULL),
	(24, 1, 1000, 1000, NULL, NULL, "2025-08-14 19:33:39", NULL, "cerrada", "", "2025-08-14 19:33:39", "2025-08-14 19:38:33", 0, 1, "2025-08-14 19:38:33", 1000, 0, 1, "2025-08-14 19:38:33", 0, NULL),
	(25, 1, 1500, 1500, NULL, NULL, "2025-08-14 19:38:45", NULL, "cerrada", "", "2025-08-14 19:38:45", "2025-08-15 20:11:30", 0, 1, "2025-08-15 20:11:30", 1500, 0, 1, "2025-08-15 20:11:30", 0, NULL),
	(26, 1, 1500, 1500, NULL, NULL, "2025-08-15 21:36:12", NULL, "cerrada", "", "2025-08-15 21:36:12", "2025-08-15 21:36:24", 0, 1, "2025-08-15 21:36:24", 1500, 0, 1, "2025-08-15 21:36:24", 0, NULL),
	(27, 3, 2000, 2000, NULL, NULL, "2025-08-15 21:43:18", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-08-15 21:43:18", "2025-08-15 21:44:01", 0, 3, "2025-08-15 21:43:30", 2000, 0, 1, "2025-08-15 21:44:01", 0, NULL),
	(28, 1, 1, 9253.5, NULL, NULL, "2025-08-17 14:38:04", NULL, "cerrada", "", "2025-08-17 14:38:04", "2025-08-20 10:19:33", 0, 1, "2025-08-20 10:19:33", 9253.5, 0, 1, "2025-08-20 10:19:33", 6252.5, NULL),
	(29, 1, 1000, 28300, NULL, NULL, "2025-08-21 00:02:51", NULL, "cerrada", "", "2025-08-21 00:02:51", "2025-08-26 10:51:50", 0, 1, "2025-08-26 10:51:50", 28300, 0, 1, "2025-08-26 10:51:50", 27000, NULL),
	(30, 1, 1000, 63810, NULL, NULL, "2025-08-26 10:56:58", NULL, "cerrada", "", "2025-08-26 10:56:58", "2025-09-02 00:30:03", 0, 1, "2025-09-02 00:30:03", 63810, 0, 1, "2025-09-02 00:30:03", 62600.75, NULL),
	(31, 5, 500, 30130, NULL, NULL, "2025-09-02 11:31:16", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-09-02 11:31:16", "2025-09-04 15:47:38", 29629.25, 1, "2025-09-04 15:44:50", 500.75, 0, 1, "2025-09-04 15:47:38", 30130, NULL),
	(32, 1, 5000, 37924.25, NULL, NULL, "2025-09-02 12:35:25", NULL, "cerrada", "", "2025-09-02 12:35:25", "2025-09-04 21:04:59", 0, 1, "2025-09-04 21:04:59", 37924.25, 0, 1, "2025-09-04 21:04:59", 32924.25, NULL),
	(33, 1, 1000, NULL, NULL, NULL, "2025-09-05 10:23:23", NULL, "abierta", NULL, "2025-09-05 10:23:23", "2025-09-05 10:23:23", 0, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL),
	(34, 6, 5000, 6001, NULL, NULL, "2025-09-10 18:15:42", NULL, "cerrada", "\n\nVerificación Admin: Sin notas.", "2025-09-10 18:15:42", "2025-09-10 21:21:15", 0, 6, "2025-09-10 21:20:01", 5201, -800, 1, "2025-09-10 21:21:15", 1200, NULL),
	(35, 6, 1000, NULL, NULL, NULL, "2025-09-11 13:58:18", NULL, "abierta", NULL, "2025-09-11 13:58:18", "2025-09-11 13:58:18", 0, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL),
	(36, 3, 1000, NULL, NULL, NULL, "2025-09-12 13:07:53", NULL, "abierta", NULL, "2025-09-12 13:07:53", "2025-09-12 13:07:53", 0, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL);

/*!40000 ALTER TABLE `cash_sessions` ENABLE KEYS */;
UNLOCK TABLES;



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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `combo_items` WRITE;
/*!40000 ALTER TABLE `combo_items` DISABLE KEYS */;

INSERT INTO `combo_items` (`id`, `combo_id`, `stock_id`, `quantity`, `component_presentation_id`, `createdAt`, `updatedAt`) VALUES
	(15, 1, 14, 1, NULL, "2025-09-10 21:39:11", "2025-09-10 21:39:11"),
	(16, 1, 13, 1, NULL, "2025-09-10 21:39:11", "2025-09-10 21:39:11");

/*!40000 ALTER TABLE `combo_items` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table combos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `combos`;

CREATE TABLE `combos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `barcode` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `combos` WRITE;
/*!40000 ALTER TABLE `combos` DISABLE KEYS */;

INSERT INTO `combos` (`id`, `name`, `barcode`, `price`, `is_active`, `start_date`, `end_date`, `createdAt`, `updatedAt`) VALUES
	(1, "FernetCola", "2020000000013", 15000, 0, "2025-08-23", "2025-09-11", "2025-08-23 17:45:47", "2025-09-10 21:39:11");

/*!40000 ALTER TABLE `combos` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table customer_payments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `customer_payments`;

CREATE TABLE `customer_payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `customer_id` bigint NOT NULL,
  `cash_session_id` bigint DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(50) COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'efectivo',
  `notes` text COLLATE utf8mb4_spanish2_ci,
  `created_by` varchar(100) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `fk_customer_payments_cash_session` (`cash_session_id`),
  CONSTRAINT `customer_payments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_customer_payments_cash_session` FOREIGN KEY (`cash_session_id`) REFERENCES `cash_sessions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `customer_payments` WRITE;
/*!40000 ALTER TABLE `customer_payments` DISABLE KEYS */;

INSERT INTO `customer_payments` (`id`, `customer_id`, `cash_session_id`, `amount`, `payment_date`, `payment_method`, `notes`, `created_by`) VALUES
	(1, 4, NULL, 500, "2025-07-21 23:50:25", "efectivo", "", "Hugo"),
	(2, 4, NULL, 100, "2025-07-21 23:53:42", "efectivo", "", "Hugo"),
	(3, 4, NULL, 100, "2025-07-21 23:58:21", "efectivo", "", "Hugo"),
	(4, 4, NULL, 10, "2025-07-22 00:03:00", "efectivo", "", "Hugo"),
	(5, 4, NULL, 10, "2025-07-22 00:08:10", "efectivo", "", "Hugo"),
	(6, 4, NULL, 10, "2025-07-22 00:10:56", "efectivo", "", "Hugo"),
	(7, 4, NULL, 10, "2025-07-22 00:17:15", "efectivo", "", "Hugo"),
	(8, 4, NULL, 10, "2025-07-22 00:17:57", "efectivo", "", "Hugo"),
	(9, 4, NULL, 10, "2025-07-22 00:18:18", "efectivo", "", "Hugo"),
	(10, 4, NULL, 10, "2025-07-22 00:21:15", "efectivo", "", "Hugo"),
	(11, 4, NULL, 10, "2025-07-22 00:32:46", "efectivo", "", "Hugo"),
	(12, 4, NULL, 1, "2025-07-22 00:38:11", "efectivo", "", "Hugo"),
	(13, 4, NULL, 1, "2025-07-22 00:47:52", "efectivo", "", "Hugo"),
	(14, 4, NULL, 1, "2025-07-22 10:07:20", "efectivo", "", "Hugo"),
	(15, 4, NULL, 1, "2025-07-22 10:33:46", "efectivo", "", "Hugo"),
	(16, 4, NULL, 1, "2025-07-22 10:37:44", "efectivo", "", "Hugo"),
	(17, 4, NULL, 1, "2025-07-22 10:44:03", "efectivo", "", "Hugo"),
	(18, 4, NULL, 10, "2025-07-22 14:12:37", "efectivo", "", "Hugo"),
	(19, 4, NULL, 1, "2025-07-24 13:11:44", "efectivo", "", "Hugo"),
	(20, 4, NULL, 1353.75, "2025-07-25 14:16:33", "efectivo", "Pago Total.", "Hugo"),
	(21, 7, NULL, 5000, "2025-08-16 18:47:17", "efectivo", "", "Hugo"),
	(22, 7, NULL, 3540.75, "2025-08-25 22:55:57", "efectivo", "pago total", "Hugo"),
	(23, 2, NULL, 50, "2025-08-26 10:52:05", "efectivo", "", "Hugo"),
	(24, 2, NULL, 50, "2025-08-26 10:57:18", "efectivo", "", "Hugo"),
	(25, 2, NULL, 10, "2025-09-02 00:03:51", "efectivo", "", "Hugo"),
	(26, 2, NULL, 0.75, "2025-09-02 11:56:25", "efectivo", "pago centavos ", "Maxi"),
	(27, 2, NULL, 1, "2025-09-10 19:08:25", "efectivo", "", "Cajero 3"),
	(28, 2, NULL, 10, "2025-09-11 13:37:45", "efectivo", "", "Hugo");

/*!40000 ALTER TABLE `customer_payments` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table customers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `dni` varchar(15) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
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

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `address`, `dni`, `discount_percentage`, `credit_limit`, `debt`, `createdAt`, `updatedAt`) VALUES
	(1, "Consumidor Final", "consumidor.final@example.com", "000000000", "N/A", "00000000", 0, 0, 0, "2025-07-11 11:19:32", "2025-07-11 11:19:32"),
	(2, "Juan Perez", "juan.perez@example.com", "1122334455", "Calle Falsa 123, Ciudad", "20123456", 5, 30000, 22809, "2025-07-21 12:24:46", "2025-09-11 13:37:45"),
	(3, "Maria Garcia", "maria.garcia@example.com", "1133445566", "Av. Siempre Viva 742, Pueblo", "25678901", 0, 0, 0, "2025-07-21 12:24:46", "2025-07-21 12:24:46"),
	(4, "Carlos Lopez", "carlos.lopez@example.com", "1144556677", "Ruta 66 Km 10, Campo", "30987654", 10, 1500, 0, "2025-07-21 12:24:46", "2025-07-25 14:16:33"),
	(5, "Ana Rodriguez", "ana.rodriguez@example.com", "1155667788", "Plaza Central 5, Villa", "35432109", 0, 3, 0, "2025-07-21 12:24:46", "2025-09-02 13:17:17"),
	(6, "Pedro Martinez", "pedro.martinez@example.com", "1166778899", "Diagonal Norte 1, Capital", "40010203", 0, 300, 350, "2025-07-21 12:24:46", "2025-07-21 12:24:46"),
	(7, "Hugo Goncalvez", "hugogoncalvez@gmail.com", "3764941490", "BARRIO 140 VIV MZ R CASA", "22665937", 0, 6000, 0, "2025-07-23 20:28:34", "2025-09-10 19:14:12"),
	(8, "Ciara Goncalvez", "ciara@gmail.com", "3764557744", "barrio 140", "55896658", 0, 5000, 0, "2025-07-23 20:41:32", "2025-07-23 20:41:32");

/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table landing_elementos
# ------------------------------------------------------------

DROP TABLE IF EXISTS `landing_elementos`;

CREATE TABLE `landing_elementos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `orden` int DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `imagen` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `navegar` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla pivote para asociar múltiples permisos a una tarjeta del landing.';

LOCK TABLES `landing_permisos` WRITE;
/*!40000 ALTER TABLE `landing_permisos` DISABLE KEYS */;

INSERT INTO `landing_permisos` (`id`, `landing_elemento_id`, `permiso_id`, `createdAt`, `updatedAt`) VALUES
	(14, 1, 40, "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(15, 2, 41, "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(16, 3, 42, "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(17, 4, 43, "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(18, 5, 44, "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(19, 8, 45, "2025-09-12 09:08:36", "2025-09-12 09:08:36");

/*!40000 ALTER TABLE `landing_permisos` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table payments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `payments`;

CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `method` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;

INSERT INTO `payments` (`id`, `method`, `description`, `active`, `createdAt`, `updatedAt`) VALUES
	(1, "Efectivo", "Pago en efectivo", 1, "2025-07-11 11:19:32", "2025-07-11 11:19:32"),
	(2, "Mercado Pago", "Transferencia o QR.", 1, "2025-07-18 00:00:00", "2025-07-18 00:00:00"),
	(3, "Mixto", "Efectivo - Otro medio de Pago", 1, "2025-07-18 00:00:00", "2025-07-18 00:00:00"),
	(4, "Tarjeta", "Pago con tarjeta de débito o crédito", 1, "2025-07-11 11:19:32", "2025-07-11 11:19:32"),
	(6, "Credito", "Ventas a Credito", 1, "2025-07-22 00:00:00", "2025-07-22 00:00:00");

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Almacena tickets de venta que se guardan para ser completados más tarde.';





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
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;

INSERT INTO `permisos` (`id`, `nombre`, `descripcion`, `modulo`, `createdAt`, `updatedAt`) VALUES
	(1, "crear_venta", "Permite procesar nuevas ventas.", "Ventas", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(2, "cancelar_venta", "Permite cancelar ventas existentes.", "Ventas", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(3, "aplicar_descuento", "Permite aplicar descuentos a las ventas.", "Ventas", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(4, "ver_historial_ventas", "Permite ver el historial de todas las ventas.", "Ventas", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(5, "abrir_caja", "Permite iniciar una nueva sesión de caja.", "Caja", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(6, "cerrar_caja", "Permite cerrar la sesión de caja actual.", "Caja", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(7, "ver_movimientos_caja", "Permite ver los movimientos de la caja actual.", "Caja", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(8, "ver_cajas_admin", "Permite ver y administrar todas las cajas.", "Caja", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(9, "crear_producto", "Permite agregar nuevos productos al inventario.", "Productos", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(10, "editar_producto", "Permite modificar productos existentes.", "Productos", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(11, "eliminar_producto", "Permite eliminar productos del inventario.", "Productos", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(12, "ver_productos", "Permite visualizar la lista de productos.", "Productos", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(13, "ver_stock", "Permite ver los niveles de stock actuales.", "Stock", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(14, "ajustar_stock", "Permite realizar ajustes manuales de stock.", "Stock", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(15, "crear_cliente", "Permite registrar nuevos clientes.", "Clientes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(16, "editar_cliente", "Permite modificar la información de clientes existentes.", "Clientes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(17, "ver_clientes", "Permite visualizar la lista de clientes.", "Clientes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(18, "crear_proveedor", "Permite registrar nuevos proveedores.", "Proveedores", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(19, "editar_proveedor", "Permite modificar la información de proveedores existentes.", "Proveedores", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(20, "ver_proveedores", "Permite visualizar la lista de proveedores.", "Proveedores", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(21, "ver_reportes_ventas", "Permite acceder a los reportes de ventas.", "Reportes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(22, "ver_reportes_stock", "Permite acceder a los reportes de stock.", "Reportes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(23, "exportar_reportes", "Permite exportar los reportes a diferentes formatos.", "Reportes", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(24, "crear_usuario", "Permite crear nuevos usuarios en el sistema.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(25, "editar_usuario", "Permite modificar usuarios existentes.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(26, "eliminar_usuario", "Permite eliminar usuarios del sistema.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(27, "ver_usuarios", "Permite visualizar la lista de usuarios.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(28, "gestionar_roles", "Permite asignar y modificar los permisos de los roles.", "Usuarios", "2025-07-12 15:11:16", "2025-07-16 11:45:33"),
	(29, "ver_landing", "Permite ver y modificar los elementos de la página de inicio", "General", "2025-07-21 08:59:44", "2025-07-21 08:59:44"),
	(30, "ver_medios_pago", "Permite ver la lista de métodos de pago disponibles", "Configuración", "2025-07-21 08:59:44", "2025-07-21 08:59:44"),
	(31, "importar_stock", "Permite realizar la importación masiva de productos desde un archivo", "Stock", "2025-07-21 09:17:17", "2025-07-21 09:17:17"),
	(32, "editar_tema", "Permite al usuario editar la paleta \n      de colores del sistema.", "Configuración", "2025-08-11 18:39:27", "2025-08-11 18:39:27"),
	(34, "gestionar_promociones", "Permite crear, editar y eliminar promociones", "Promociones", "2025-08-22 09:43:36", "2025-08-22 09:43:36"),
	(35, "gestionar_combos", "Permite crear, editar y eliminar combos", "Combos", "2025-08-22 12:44:01", "2025-08-22 12:44:01"),
	(36, "imprimir_codigos_barras", NULL, "", "2025-08-24 17:49:57", "2025-08-24 17:49:57"),
	(40, "ver_tarjeta_ventas", "Permite ver la tarjeta de Ventas en el landing page", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(41, "ver_tarjeta_stock", "Permite ver la tarjeta de Stock en el landing page", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(42, "ver_tarjeta_clientes", "Permite ver la tarjeta de Clientes en el landing page", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(43, "ver_tarjeta_caja", "Permite ver la tarjeta de Caja en el landing page", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(44, "ver_tarjeta_compras", "Permite ver la tarjeta de Compras en el landing page", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36"),
	(45, "ver_tarjeta_dashboard", "Permite ver la tarjeta de Dashboard en el landing page", "Landing", "2025-09-12 09:08:36", "2025-09-12 09:08:36");

/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table product_presentations
# ------------------------------------------------------------

DROP TABLE IF EXISTS `product_presentations`;

CREATE TABLE `product_presentations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `stock_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL COMMENT 'Nombre de la presentación, ej: "Docena", "Media Horma", "Pack de 6"',
  `quantity_in_base_units` decimal(10,3) NOT NULL COMMENT 'Cuántas unidades base contiene esta presentación. Ej: 12 para una docena.',
  `price` decimal(10,2) NOT NULL COMMENT 'El precio de venta de esta presentación específica.',
  `barcode` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL COMMENT 'Código de barras opcional para esta presentación específica.',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode_UNIQUE` (`barcode`),
  KEY `fk_presentations_stock_idx` (`stock_id`),
  CONSTRAINT `fk_presentations_stock` FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla para almacenar las diferentes formas en que se vende un producto.';

LOCK TABLES `product_presentations` WRITE;
/*!40000 ALTER TABLE `product_presentations` DISABLE KEYS */;

INSERT INTO `product_presentations` (`id`, `stock_id`, `name`, `quantity_in_base_units`, `price`, `barcode`, `createdAt`, `updatedAt`) VALUES
	(6, 12, "Maple", 30, 6000, "2010000000014", "2025-09-10 20:42:55", "2025-09-10 20:42:55"),
	(7, 12, "1 Docena", 12, 3000, "2010000000021", "2025-09-10 20:42:55", "2025-09-10 20:42:55"),
	(9, 12, "1/2 Docena", 6, 1680, "2010000000038", "2025-09-10 20:42:55", "2025-09-10 20:42:55"),
	(10, 6, "Horma", 1, 6700, "2010000000045", "2025-08-28 22:58:16", "2025-08-28 22:58:16"),
	(11, 6, "1/2 Horma", 1, 7200, "2010000000052", "2025-08-28 22:58:16", "2025-08-28 22:58:16"),
	(13, 12, "por 20", 20, 8000, "2010000000069", "2025-09-10 20:42:55", "2025-09-10 20:42:55");

/*!40000 ALTER TABLE `product_presentations` ENABLE KEYS */;
UNLOCK TABLES;



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

LOCK TABLES `product_promotions` WRITE;
/*!40000 ALTER TABLE `product_promotions` DISABLE KEYS */;

INSERT INTO `product_promotions` (`id`, `promotion_id`, `stock_id`, `presentation_id`, `createdAt`, `updatedAt`) VALUES
	(4, 3, 12, NULL, "2025-09-10 17:44:53", "2025-09-10 17:44:53");

/*!40000 ALTER TABLE `product_promotions` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table promotions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `promotions`;

CREATE TABLE `promotions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `type` enum('BOGO','PERCENT_DISCOUNT_ON_NTH','FIXED_PRICE_ON_NTH') COLLATE utf8mb4_spanish2_ci NOT NULL,
  `discount_value` decimal(10,2) DEFAULT NULL,
  `required_quantity` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;

INSERT INTO `promotions` (`id`, `name`, `type`, `discount_value`, `required_quantity`, `start_date`, `end_date`, `is_active`, `createdAt`, `updatedAt`) VALUES
	(1, "2x1 Coca-Cola 500cc", "BOGO", 0, 2, "2025-08-24", "2025-09-07", 1, "2025-08-24 22:54:18", "2025-09-02 23:13:55"),
	(2, "50% en la 2da Unidad ", "PERCENT_DISCOUNT_ON_NTH", 50, 2, "2025-08-25", "2025-09-07", 1, "2025-08-25 10:28:34", "2025-09-02 23:13:45"),
	(3, "Precio Fijo en 2 unidad", "FIXED_PRICE_ON_NTH", 100, 2, "2025-09-10", "2025-09-11", 1, "2025-09-10 17:44:53", "2025-09-10 17:44:53");

/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table purchases
# ------------------------------------------------------------

DROP TABLE IF EXISTS `purchases`;

CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `factura` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `supplier` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;

INSERT INTO `purchases` (`id`, `factura`, `supplier`, `cost`, `createdAt`, `updatedAt`) VALUES
	(1, "0001-00000089", "Makro", 25500, "2025-07-15 00:00:00", "2025-07-15 22:15:46"),
	(2, "0001-00008899", "Makro", 5400, "2025-07-17 00:00:00", "2025-07-17 10:45:15"),
	(3, "0001-00889966", "Makro", 30000, "2025-07-17 00:00:00", "2025-07-17 11:02:46"),
	(4, "0001-00008899", "Makro", 228000, "2025-07-29 00:00:00", "2025-07-29 14:15:27"),
	(5, "0001-12345678", "Yaguar", 81355, "2025-08-24 00:00:00", "2025-08-24 16:43:28"),
	(6, "0001-12345678", "Yaguar", 81355, "2025-08-24 00:00:00", "2025-08-24 16:48:57"),
	(7, "0001-12364578", "Yaguar", 50000, "2025-08-24 00:00:00", "2025-08-24 16:50:39"),
	(8, "0001-11111111", "Makro", 60000, "2025-08-24 00:00:00", "2025-08-24 16:58:57"),
	(9, "0001-11111111", "Makro", 60000, "2025-08-24 00:00:00", "2025-08-24 17:57:04"),
	(12, "0001-11111111", "Makro", 60000, "2025-08-24 00:00:00", "2025-08-24 18:25:09"),
	(13, "0001-55555555", "Makro", 30000, "2025-08-24 00:00:00", "2025-08-24 19:25:28"),
	(14, "0001-000043769", "Yaguar", 6000, "2025-09-01 00:00:00", "2025-09-02 11:36:09"),
	(15, "0001-000043700", "Makro", 6000, "2025-09-01 00:00:00", "2025-09-02 11:37:04"),
	(16, "0001-000043752", "Makro", 6000, "2025-09-01 00:00:00", "2025-09-02 11:38:44"),
	(17, "0001-33333333", "Yaguar", 6000, "2025-09-01 00:00:00", "2025-09-02 12:05:51"),
	(18, "0001-11111111", "sin Proveedor", 86000, "2025-09-10 00:00:00", "2025-09-10 20:36:19");

/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;



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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `purchases_details` WRITE;
/*!40000 ALTER TABLE `purchases_details` DISABLE KEYS */;

INSERT INTO `purchases_details` (`id`, `purchasesId`, `stock_id`, `quantity`, `cost`, `createdAt`, `updatedAt`) VALUES
	(1, 1, 3, 30, 850, "2025-07-15 22:15:46", "2025-07-15 22:15:46"),
	(2, 2, 3, 6, 900, "2025-07-17 10:45:15", "2025-07-17 10:45:15"),
	(3, 3, 1, 6, 5000, "2025-07-17 11:02:46", "2025-07-17 11:02:46"),
	(4, 4, 8, 60, 3800, "2025-07-29 14:15:27", "2025-07-29 14:15:27"),
	(5, 5, 6, 15, 5300, "2025-08-24 16:43:28", "2025-08-24 16:43:28"),
	(6, 6, 6, 15, 5300, "2025-08-24 16:48:57", "2025-08-24 16:48:57"),
	(7, 7, 2, 50, 1000, "2025-08-24 16:50:39", "2025-08-24 16:50:39"),
	(8, 8, 1, 10, 6000, "2025-08-24 16:58:57", "2025-08-24 16:58:57"),
	(9, 9, 1, 10, 6000, "2025-08-24 17:57:04", "2025-08-24 17:57:04"),
	(12, 12, 1, 10, 6000, "2025-08-24 18:25:09", "2025-08-24 18:25:09"),
	(16, 13, 6, 5.5, 5454.545, "2025-08-24 19:25:28", "2025-08-24 19:25:28"),
	(17, 14, 13, 6, 1000, "2025-09-01 11:36:09", "2025-09-02 11:36:09"),
	(18, 15, 13, 6, 1000, "2025-09-01 11:37:04", "2025-09-02 11:37:04"),
	(19, 16, 13, 6, 1000, "2025-09-01 11:38:44", "2025-09-02 11:38:44"),
	(20, 17, 3, 6, 1000, "2025-09-01 00:00:00", "2025-09-02 12:05:51"),
	(21, 18, 12, 360, 180.556, "2025-09-10 00:00:00", "2025-09-10 20:36:19"),
	(22, 18, 13, 6, 3500, "2025-09-10 00:00:00", "2025-09-10 20:36:19");

/*!40000 ALTER TABLE `purchases_details` ENABLE KEYS */;
UNLOCK TABLES;



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
	(1, 29),
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
	(2, 1),
	(2, 2),
	(2, 3),
	(2, 4),
	(2, 5),
	(2, 6),
	(2, 7),
	(2, 8),
	(2, 9),
	(2, 10),
	(2, 11),
	(2, 12),
	(2, 13),
	(2, 14),
	(2, 15),
	(2, 16),
	(2, 17),
	(2, 18),
	(2, 19),
	(2, 20),
	(2, 21),
	(2, 22),
	(2, 23),
	(2, 29),
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
	(3, 1),
	(3, 4),
	(3, 5),
	(3, 6),
	(3, 7),
	(3, 12),
	(3, 13),
	(3, 17),
	(3, 29),
	(3, 30),
	(3, 40);

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
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `sale_payments` WRITE;
/*!40000 ALTER TABLE `sale_payments` DISABLE KEYS */;

INSERT INTO `sale_payments` (`id`, `sale_id`, `payment_method_id`, `amount`, `createdAt`, `updatedAt`) VALUES
	(1, 20, 1, 1000, "2025-07-18 14:37:53", "2025-07-18 14:37:53"),
	(2, 20, 2, 200, "2025-07-18 14:37:53", "2025-07-18 14:37:53"),
	(3, 21, 1, 400, "2025-07-18 14:46:12", "2025-07-18 14:46:12"),
	(4, 21, 2, 800, "2025-07-18 14:46:12", "2025-07-18 14:46:12"),
	(9, 26, 6, 150, "2025-07-22 11:01:44", "2025-07-22 11:01:44"),
	(10, 27, 6, 1200, "2025-07-22 11:17:13", "2025-07-22 11:17:13"),
	(11, 28, 6, 150.75, "2025-07-22 11:21:25", "2025-07-22 11:21:25"),
	(12, 29, 1, 150, "2025-07-24 15:53:54", "2025-07-24 15:53:54"),
	(13, 30, 1, 150, "2025-07-24 15:56:25", "2025-07-24 15:56:25"),
	(14, 31, 1, 150, "2025-07-24 20:00:30", "2025-07-24 20:00:30"),
	(15, 32, 1, 10020, "2025-07-26 20:16:44", "2025-07-26 20:16:44"),
	(16, 33, 1, 2500, "2025-07-26 20:37:37", "2025-07-26 20:37:37"),
	(17, 34, 1, 2400, "2025-07-26 20:45:50", "2025-07-26 20:45:50"),
	(18, 35, 1, 200, "2025-07-26 20:54:32", "2025-07-26 20:54:32"),
	(19, 36, 1, 150.75, "2025-07-26 23:09:50", "2025-07-26 23:09:50"),
	(20, 37, 1, 150.75, "2025-07-28 12:08:04", "2025-07-28 12:08:04"),
	(21, 38, 1, 1815, "2025-07-28 12:43:05", "2025-07-28 12:43:05"),
	(34, 51, 1, 10000, "2025-07-28 15:39:32", "2025-07-28 15:39:32"),
	(35, 52, 1, 7601.25, "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(36, 53, 1, 150, "2025-07-28 20:38:11", "2025-07-28 20:38:11"),
	(37, 54, 1, 3000, "2025-07-29 10:49:11", "2025-07-29 10:49:11"),
	(38, 54, 6, 2000, "2025-07-29 10:49:11", "2025-07-29 10:49:11"),
	(39, 55, 1, 20000, "2025-07-29 13:46:42", "2025-07-29 13:46:42"),
	(40, 56, 1, 150, "2025-07-30 10:52:02", "2025-07-30 10:52:02"),
	(41, 57, 1, 150, "2025-07-30 11:40:31", "2025-07-30 11:40:31"),
	(42, 58, 1, 171.5, "2025-07-30 20:31:04", "2025-07-30 20:31:04"),
	(43, 59, 1, 1000, "2025-07-30 21:15:33", "2025-07-30 21:15:33"),
	(44, 60, 1, 150, "2025-07-31 13:04:25", "2025-07-31 13:04:25"),
	(45, 61, 2, 5000, "2025-07-31 13:04:57", "2025-07-31 13:04:57"),
	(46, 62, 1, 100.75, "2025-07-31 13:08:44", "2025-07-31 13:08:44"),
	(47, 62, 6, 50, "2025-07-31 13:08:44", "2025-07-31 13:08:44"),
	(48, 63, 4, 150, "2025-07-31 13:09:06", "2025-07-31 13:09:06"),
	(49, 64, 6, 1000, "2025-07-31 15:14:16", "2025-07-31 15:14:16"),
	(50, 65, 6, 150, "2025-07-31 15:24:04", "2025-07-31 15:24:04"),
	(51, 66, 1, 150, "2025-07-31 15:32:40", "2025-07-31 15:32:40"),
	(52, 67, 1, 150, "2025-07-31 15:36:02", "2025-07-31 15:36:02"),
	(53, 68, 1, 1000, "2025-07-31 20:34:01", "2025-07-31 20:34:01"),
	(54, 69, 1, 150, "2025-07-31 20:34:23", "2025-07-31 20:34:23"),
	(55, 70, 1, 150, "2025-07-31 20:35:26", "2025-07-31 20:35:26"),
	(56, 71, 6, 150, "2025-07-31 20:37:33", "2025-07-31 20:37:33"),
	(57, 72, 4, 1000, "2025-07-31 20:39:53", "2025-07-31 20:39:53"),
	(58, 73, 1, 150, "2025-07-31 20:40:31", "2025-07-31 20:40:31"),
	(59, 74, 1, 150, "2025-07-31 20:48:29", "2025-07-31 20:48:29"),
	(60, 75, 1, 150, "2025-07-31 20:51:51", "2025-07-31 20:51:51"),
	(61, 76, 1, 150, "2025-07-31 20:53:52", "2025-07-31 20:53:52"),
	(62, 77, 1, 150, "2025-07-31 21:01:41", "2025-07-31 21:01:41"),
	(63, 78, 1, 1000, "2025-08-04 19:52:13", "2025-08-04 19:52:13"),
	(64, 79, 1, 150.75, "2025-08-04 19:55:10", "2025-08-04 19:55:10"),
	(65, 80, 1, 1000, "2025-08-05 12:02:06", "2025-08-05 12:02:06"),
	(66, 80, 6, 658.25, "2025-08-05 12:02:06", "2025-08-05 12:02:06"),
	(67, 81, 6, 1507.5, "2025-08-05 12:03:53", "2025-08-05 12:03:53"),
	(68, 82, 6, 1507.5, "2025-08-05 12:05:41", "2025-08-05 12:05:41"),
	(69, 83, 6, 1517.5, "2025-08-05 13:26:10", "2025-08-05 13:26:10"),
	(70, 84, 1, 151.75, "2025-08-05 13:27:59", "2025-08-05 13:27:59"),
	(71, 85, 1, 5000, "2025-08-17 19:00:40", "2025-08-17 19:00:40"),
	(72, 86, 1, 250.5, "2025-08-18 15:50:46", "2025-08-18 15:50:46"),
	(73, 87, 1, 250.5, "2025-08-18 15:51:01", "2025-08-18 15:51:01"),
	(74, 88, 1, 250.5, "2025-08-18 21:02:22", "2025-08-18 21:02:22"),
	(75, 89, 1, 250.5, "2025-08-18 21:11:09", "2025-08-18 21:11:09"),
	(76, 90, 1, 250.5, "2025-08-18 21:13:03", "2025-08-18 21:13:03"),
	(77, 91, 1, 5400, "2025-08-21 23:34:43", "2025-08-21 23:34:43"),
	(78, 92, 1, 1800, "2025-08-21 23:38:34", "2025-08-21 23:38:34"),
	(87, 101, 1, 15000, "2025-08-23 18:19:41", "2025-08-23 18:19:41"),
	(88, 102, 1, 2400, "2025-08-25 10:42:23", "2025-08-25 10:42:23"),
	(89, 103, 1, 1500, "2025-08-25 12:19:44", "2025-08-25 12:19:44"),
	(90, 104, 1, 1200, "2025-08-25 12:55:13", "2025-08-25 12:55:13"),
	(103, 117, 1, 21000, "2025-08-26 23:30:06", "2025-08-26 23:30:06"),
	(104, 118, 1, 11400, "2025-08-27 13:12:32", "2025-08-27 13:12:32"),
	(105, 119, 1, 12700, "2025-08-27 13:15:06", "2025-08-27 13:15:06"),
	(106, 120, 1, 17500, "2025-08-29 13:28:17", "2025-08-29 13:28:17"),
	(107, 121, 1, 150, "2025-09-01 23:52:45", "2025-09-01 23:52:45"),
	(108, 122, 1, 200, "2025-09-02 11:31:52", "2025-09-02 11:31:52"),
	(109, 123, 2, 7200, "2025-09-02 11:58:38", "2025-09-02 11:58:38"),
	(110, 124, 6, 22780, "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(111, 125, 1, 3600, "2025-09-02 15:37:59", "2025-09-02 15:37:59"),
	(112, 126, 1, 160, "2025-09-02 18:35:24", "2025-09-02 18:35:24"),
	(113, 127, 1, 1650, "2025-09-02 19:11:33", "2025-09-02 19:11:33"),
	(114, 128, 1, 27514.25, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(115, 129, 4, 39854.05, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(116, 130, 1, 800, "2025-09-09 10:44:45", "2025-09-09 10:44:45"),
	(117, 131, 1, 3000, "2025-09-10 21:05:43", "2025-09-10 21:05:43"),
	(118, 131, 2, 1100, "2025-09-10 21:05:43", "2025-09-10 21:05:43"),
	(119, 132, 1, 1000, "2025-09-10 21:16:25", "2025-09-10 21:16:25"),
	(120, 132, 2, 200, "2025-09-10 21:16:25", "2025-09-10 21:16:25"),
	(121, 133, 1, 250.5, "2025-09-12 13:08:09", "2025-09-12 13:08:09");

/*!40000 ALTER TABLE `sale_payments` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table sales
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sales`;

CREATE TABLE `sales` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `total_amount` decimal(10,2) NOT NULL COMMENT 'Total bruto de la venta (suma de subtotales de detalles)',
  `promotion_discount` decimal(10,2) DEFAULT '0.00' COMMENT 'Descuento total aplicado por promociones',
  `total_neto` decimal(10,2) NOT NULL COMMENT 'Total final a pagar (total_amount - promotion_discount)',
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
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla para registrar las cabeceras de las ventas';

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;

INSERT INTO `sales` (`id`, `total_amount`, `promotion_discount`, `total_neto`, `customer_id`, `user_id`, `cash_session_id`, `createdAt`, `updatedAt`) VALUES
	(4, 150, 0, 150, 1, 2, NULL, "2025-07-15 13:30:46", "2025-07-15 13:30:46"),
	(5, 150, 100, 50, 1, 2, NULL, "2025-07-15 14:07:39", "2025-07-15 14:07:39"),
	(6, 150, 0, 150, 1, 2, NULL, "2025-07-17 10:38:48", "2025-07-17 10:38:48"),
	(7, 750, 0, 750, 1, 2, NULL, "2025-07-17 12:09:59", "2025-07-17 12:09:59"),
	(8, 150, 0, 150, 1, 2, NULL, "2025-07-18 10:44:09", "2025-07-18 10:44:09"),
	(9, 1200, 0, 1200, 1, 2, NULL, "2025-07-18 10:56:19", "2025-07-18 10:56:19"),
	(10, 1200, 0, 1200, 1, 1, 12, "2025-07-18 11:52:01", "2025-07-18 11:52:01"),
	(11, 6000, 0, 6000, 1, 1, 12, "2025-07-18 12:18:10", "2025-07-18 12:18:10"),
	(20, 1200, 0, 1200, 1, 1, 12, "2025-07-18 14:37:53", "2025-07-18 14:37:53"),
	(21, 1200, 0, 1200, 1, 1, 12, "2025-07-18 14:46:12", "2025-07-18 14:46:12"),
	(26, 150, 0, 150, 1, 1, 13, "2025-07-22 11:01:44", "2025-07-22 11:01:44"),
	(27, 1200, 0, 1200, 4, 1, 13, "2025-07-22 11:17:13", "2025-07-22 11:17:13"),
	(28, 150.75, 0, 150.75, 4, 1, 13, "2025-07-22 11:21:25", "2025-07-22 11:21:25"),
	(29, 150, 0, 150, 1, 1, 14, "2025-07-24 15:53:54", "2025-07-24 15:53:54"),
	(30, 150, 0, 150, 1, 1, 14, "2025-07-24 15:56:25", "2025-07-24 15:56:25"),
	(31, 150, 0, 150, 1, 1, 14, "2025-07-24 20:00:30", "2025-07-24 20:00:30"),
	(32, 10020, 0, 10020, 1, 1, 14, "2025-07-26 20:16:44", "2025-07-26 20:16:44"),
	(33, 2500, 0, 2500, 1, 1, 14, "2025-07-26 20:37:37", "2025-07-26 20:37:37"),
	(34, 2400, 0, 2400, 1, 1, 14, "2025-07-26 20:45:50", "2025-07-26 20:45:50"),
	(35, 150, 0, 150, 1, 1, 14, "2025-07-26 20:54:32", "2025-07-26 20:54:32"),
	(36, 150.75, 0, 150.75, 1, 1, 14, "2025-07-26 23:09:50", "2025-07-26 23:09:50"),
	(37, 150.75, 0, 150.75, 1, 1, 14, "2025-07-28 12:08:04", "2025-07-28 12:08:04"),
	(38, 1500, 0, 1815, 1, 1, 14, "2025-07-28 12:43:05", "2025-07-28 12:43:05"),
	(51, 10000, 0, 10000, 1, 1, 14, "2025-07-28 15:39:32", "2025-07-28 15:39:32"),
	(52, 7601.25, 0, 7601.25, 1, 1, 14, "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(53, 150, 0, 150, 1, 3, 15, "2025-07-28 20:38:11", "2025-07-28 20:38:11"),
	(54, 5000, 0, 5000, 7, 1, 14, "2025-07-29 10:49:11", "2025-07-29 10:49:11"),
	(55, 18000, 0, 18000, 1, 1, 14, "2025-07-29 13:46:42", "2025-07-29 13:46:42"),
	(56, 150, 0, 150, 1, 3, 17, "2025-07-30 10:52:02", "2025-07-30 10:52:02"),
	(57, 150, 0, 150, 1, 3, 17, "2025-07-30 11:40:31", "2025-07-30 11:40:31"),
	(58, 150, 10, 171.5, 1, 1, 16, "2025-07-30 20:31:04", "2025-07-30 20:31:04"),
	(59, 1000, 0, 1000, 1, 1, 16, "2025-07-30 21:15:33", "2025-07-30 21:15:33"),
	(60, 150, 0, 150, 1, 3, 18, "2025-07-31 13:04:25", "2025-07-31 13:04:25"),
	(61, 5000, 0, 5000, 1, 3, 18, "2025-07-31 13:04:57", "2025-07-31 13:04:57"),
	(62, 150.75, 0, 150.75, 7, 3, 18, "2025-07-31 13:08:44", "2025-07-31 13:08:44"),
	(63, 150, 0, 150, 1, 3, 18, "2025-07-31 13:09:06", "2025-07-31 13:09:06"),
	(64, 1000, 0, 1000, 7, 3, 19, "2025-07-31 15:14:16", "2025-07-31 15:14:16"),
	(65, 150, 0, 150, 7, 3, 19, "2025-07-31 15:24:04", "2025-07-31 15:24:04"),
	(66, 150, 0, 150, 1, 3, 19, "2025-07-31 15:32:40", "2025-07-31 15:32:40"),
	(67, 150, 0, 150, 1, 3, 19, "2025-07-31 15:36:02", "2025-07-31 15:36:02"),
	(68, 1000, 0, 1000, 1, 3, 19, "2025-07-31 20:34:01", "2025-07-31 20:34:01"),
	(69, 150, 0, 150, 1, 3, 19, "2025-07-31 20:34:23", "2025-07-31 20:34:23"),
	(70, 150, 0, 150, 1, 3, 19, "2025-07-31 20:35:26", "2025-07-31 20:35:26"),
	(71, 150, 0, 150, 7, 3, 19, "2025-07-31 20:37:33", "2025-07-31 20:37:33"),
	(72, 1000, 0, 1000, 1, 3, 19, "2025-07-31 20:39:53", "2025-07-31 20:39:53"),
	(73, 150, 0, 150, 1, 3, 19, "2025-07-31 20:40:31", "2025-07-31 20:40:31"),
	(74, 150, 0, 150, 1, 3, 19, "2025-07-31 20:48:29", "2025-07-31 20:48:29"),
	(75, 150, 0, 150, 1, 3, 19, "2025-07-31 20:51:51", "2025-07-31 20:51:51"),
	(76, 150, 0, 150, 1, 3, 19, "2025-07-31 20:53:52", "2025-07-31 20:53:52"),
	(77, 150, 0, 150, 1, 3, 19, "2025-07-31 21:01:41", "2025-07-31 21:01:41"),
	(78, 1000, 0, 1000, 1, 1, 21, "2025-08-04 19:52:13", "2025-08-04 19:52:13"),
	(79, 150.75, 0, 150.75, 1, 1, 21, "2025-08-04 19:55:10", "2025-08-04 19:55:10"),
	(80, 1658.25, 0, 1658.25, 7, 1, 22, "2025-08-05 12:02:06", "2025-08-05 12:02:06"),
	(81, 1507.5, 0, 1507.5, 7, 1, 22, "2025-08-05 12:03:53", "2025-08-05 12:03:53"),
	(82, 1507.5, 0, 1507.5, 7, 1, 22, "2025-08-05 12:05:41", "2025-08-05 12:05:41"),
	(83, 1517.5, 0, 1517.5, 7, 1, 22, "2025-08-05 13:26:10", "2025-08-05 13:26:10"),
	(84, 151.75, 0, 151.75, 1, 1, 22, "2025-08-05 13:27:59", "2025-08-05 13:27:59"),
	(85, 5000, 0, 5000, 1, 1, 28, "2025-08-17 19:00:40", "2025-08-17 19:00:40"),
	(86, 250.5, 0, 250.5, 1, 1, 28, "2025-08-18 15:50:46", "2025-08-18 15:50:46"),
	(87, 250.5, 0, 250.5, 1, 1, 28, "2025-08-18 15:51:01", "2025-08-18 15:51:01"),
	(88, 250.5, 0, 250.5, 1, 1, 28, "2025-08-18 21:02:22", "2025-08-18 21:02:22"),
	(89, 250.5, 0, 250.5, 1, 1, 28, "2025-08-18 21:11:09", "2025-08-18 21:11:09"),
	(90, 250.5, 0, 250.5, 1, 1, 28, "2025-08-18 21:13:03", "2025-08-18 21:13:03"),
	(91, 5400, 0, 5400, 1, 1, 29, "2025-08-21 23:34:43", "2025-08-21 23:34:43"),
	(92, 1800, 0, 1800, 1, 1, 29, "2025-08-21 23:38:34", "2025-08-21 23:38:34"),
	(101, 15000, 0, 15000, 1, 1, 29, "2025-08-23 18:19:41", "2025-08-23 18:19:41"),
	(102, 2400, 0, 2400, 1, 1, 29, "2025-08-25 10:42:23", "2025-08-25 10:42:23"),
	(103, 1200, 0, 1200, 1, 1, 29, "2025-08-25 12:19:44", "2025-08-25 12:19:44"),
	(104, 1200, 0, 1200, 1, 1, 29, "2025-08-25 12:55:13", "2025-08-25 12:55:13"),
	(117, 21000, 0, 21000, 1, 1, 30, "2025-08-26 23:30:06", "2025-08-26 23:30:06"),
	(118, 11350.75, 0, 11350.75, 1, 1, 30, "2025-08-27 13:12:32", "2025-08-27 13:12:32"),
	(119, 12700, 0, 12700, 1, 1, 30, "2025-08-27 13:15:06", "2025-08-27 13:15:06"),
	(120, 17400, 0, 17400, 1, 1, 30, "2025-08-29 13:28:17", "2025-08-29 13:28:17"),
	(121, 150, 0, 150, 1, 1, 30, "2025-09-01 23:52:45", "2025-09-01 23:52:45"),
	(122, 150, 0, 150, 1, 5, 31, "2025-09-02 11:31:52", "2025-09-02 11:31:52"),
	(123, 7200, 0, 7200, 1, 5, 31, "2025-09-02 11:58:38", "2025-09-02 11:58:38"),
	(124, 22780, 0, 22780, 2, 5, 31, "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(125, 3600, 0, 3600, 1, 1, 32, "2025-09-02 15:37:59", "2025-09-02 15:37:59"),
	(126, 160, 0, 160, 1, 1, 32, "2025-09-02 18:35:24", "2025-09-02 18:35:24"),
	(127, 1650, 0, 1650, 1, 1, 32, "2025-09-02 19:11:33", "2025-09-02 19:11:33"),
	(128, 27514.25, 0, 27514.25, 1, 1, 32, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(129, 39854.05, 0, 39854.05, 1, 1, 33, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(130, 800, 0, 800, 1, 1, 33, "2025-09-09 10:44:45", "2025-09-09 10:44:45"),
	(131, 4100, 0, 4100, 1, 1, 33, "2025-09-10 21:05:43", "2025-09-10 21:05:43"),
	(132, 1200, 0, 1200, 1, 6, 34, "2025-09-10 21:16:25", "2025-09-10 21:16:25"),
	(133, 250.5, 0, 250.5, 1, 3, 36, "2025-09-12 13:08:09", "2025-09-12 13:08:09");

/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;



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
) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla para registrar los detalles (productos) de cada venta';

LOCK TABLES `sales_details` WRITE;
/*!40000 ALTER TABLE `sales_details` DISABLE KEYS */;

INSERT INTO `sales_details` (`id`, `sales_Id`, `stock_id`, `combo_id`, `promotion_id`, `quantity`, `price`, `cost`, `createdAt`, `updatedAt`) VALUES
	(13, 4, 1, NULL, NULL, 1, 150, 5000, "2025-07-15 13:30:46", "2025-07-15 13:30:46"),
	(14, 5, 1, NULL, NULL, 1, 150, 5000, "2025-07-15 14:07:39", "2025-07-15 14:07:39"),
	(15, 6, 1, NULL, NULL, 1, 150, 5000, "2025-07-17 10:38:48", "2025-07-17 10:38:48"),
	(16, 7, 1, NULL, NULL, 5, 150, 5000, "2025-07-17 12:09:59", "2025-07-17 12:09:59"),
	(17, 8, 1, NULL, NULL, 1, 150, 5000, "2025-07-18 10:44:09", "2025-07-18 10:44:09"),
	(18, 9, 3, NULL, NULL, 1, 1200, 900, "2025-07-18 10:56:19", "2025-07-18 10:56:19"),
	(19, 10, 3, NULL, NULL, 1, 1200, 900, "2025-07-18 11:52:01", "2025-07-18 11:52:01"),
	(20, 11, 3, NULL, NULL, 5, 1200, 900, "2025-07-18 12:18:10", "2025-07-18 12:18:10"),
	(21, 20, 3, NULL, NULL, 1, 1200, 900, "2025-07-18 14:37:53", "2025-07-18 14:37:53"),
	(22, 21, 3, NULL, NULL, 1, 1200, 900, "2025-07-18 14:46:12", "2025-07-18 14:46:12"),
	(39, 26, 1, NULL, NULL, 1, 150, 5000, "2025-07-22 11:01:44", "2025-07-22 11:01:44"),
	(40, 27, 3, NULL, NULL, 1, 1200, 900, "2025-07-22 11:17:13", "2025-07-22 11:17:13"),
	(41, 28, 4, NULL, NULL, 1, 150.75, 100.5, "2025-07-22 11:21:25", "2025-07-22 11:21:25"),
	(42, 29, 1, NULL, NULL, 1, 150, 5000, "2025-07-24 15:53:54", "2025-07-24 15:53:54"),
	(43, 30, 1, NULL, NULL, 1, 150, 5000, "2025-07-24 15:56:25", "2025-07-24 15:56:25"),
	(44, 31, 1, NULL, NULL, 1, 150, 5000, "2025-07-24 20:00:30", "2025-07-24 20:00:30"),
	(45, 32, 2, NULL, NULL, 40, 250.5, 180, "2025-07-26 20:16:44", "2025-07-26 20:16:44"),
	(46, 33, 1, NULL, NULL, 10, 150, 5000, "2025-07-26 20:37:37", "2025-07-26 20:37:37"),
	(47, 33, 5, NULL, NULL, 0, 10000, 42800, "2025-07-26 20:37:37", "2025-07-26 20:37:37"),
	(48, 34, 3, NULL, NULL, 2, 1200, 900, "2025-07-26 20:45:50", "2025-07-26 20:45:50"),
	(49, 35, 1, NULL, NULL, 1, 150, 5000, "2025-07-26 20:54:32", "2025-07-26 20:54:32"),
	(50, 36, 4, NULL, NULL, 1, 150.75, 100.5, "2025-07-26 23:09:50", "2025-07-26 23:09:50"),
	(51, 37, 4, NULL, NULL, 1, 150.75, 100.5, "2025-07-28 12:08:04", "2025-07-28 12:08:04"),
	(52, 38, 1, NULL, NULL, 10, 150, 5000, "2025-07-28 12:43:05", "2025-07-28 12:43:05"),
	(53, 51, 0, NULL, NULL, 10, 1000, 1000, "2025-07-28 15:39:32", "2025-07-28 15:39:32"),
	(54, 52, 0, NULL, NULL, 1, 1000, 1000, "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(55, 52, 5, NULL, NULL, 0, 10000, 42800, "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(56, 52, 3, NULL, NULL, 1, 1200, 900, "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(57, 52, 4, NULL, NULL, 1, 150.75, 100.5, "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(58, 52, 2, NULL, NULL, 1, 250.5, 180, "2025-07-28 15:57:19", "2025-07-28 15:57:19"),
	(59, 53, 1, NULL, NULL, 1, 150, 5000, "2025-07-28 20:38:11", "2025-07-28 20:38:11"),
	(60, 54, 5, NULL, NULL, 0.5, 10000, 42800, "2025-07-29 10:49:11", "2025-07-29 10:49:11"),
	(61, 55, 8, NULL, NULL, 3, 6000, 3500, "2025-07-29 13:46:42", "2025-07-29 13:46:42"),
	(62, 56, 1, NULL, NULL, 1, 150, 5000, "2025-07-30 10:52:02", "2025-07-30 10:52:02"),
	(63, 57, 1, NULL, NULL, 1, 150, 5000, "2025-07-30 11:40:31", "2025-07-30 11:40:31"),
	(64, 58, 1, NULL, NULL, 1, 150, 5000, "2025-07-30 20:31:04", "2025-07-30 20:31:04"),
	(65, 59, 0, NULL, NULL, 1, 1000, 1000, "2025-07-30 21:15:33", "2025-07-30 21:15:33"),
	(66, 60, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 13:04:25", "2025-07-31 13:04:25"),
	(67, 61, 5, NULL, NULL, 0.5, 10000, 42800, "2025-07-31 13:04:57", "2025-07-31 13:04:57"),
	(68, 62, 4, NULL, NULL, 1, 150.75, 100.5, "2025-07-31 13:08:44", "2025-07-31 13:08:44"),
	(69, 63, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 13:09:06", "2025-07-31 13:09:06"),
	(70, 64, 0, NULL, NULL, 1, 1000, 1000, "2025-07-31 15:14:16", "2025-07-31 15:14:16"),
	(71, 65, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 15:24:04", "2025-07-31 15:24:04"),
	(72, 66, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 15:32:40", "2025-07-31 15:32:40"),
	(73, 67, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 15:36:02", "2025-07-31 15:36:02"),
	(74, 68, 0, NULL, NULL, 1, 1000, 1000, "2025-07-31 20:34:01", "2025-07-31 20:34:01"),
	(75, 69, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 20:34:23", "2025-07-31 20:34:23"),
	(76, 70, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 20:35:26", "2025-07-31 20:35:26"),
	(77, 71, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 20:37:33", "2025-07-31 20:37:33"),
	(78, 72, 0, NULL, NULL, 1, 1000, 1000, "2025-07-31 20:39:53", "2025-07-31 20:39:53"),
	(79, 73, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 20:40:31", "2025-07-31 20:40:31"),
	(80, 74, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 20:48:29", "2025-07-31 20:48:29"),
	(81, 75, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 20:51:51", "2025-07-31 20:51:51"),
	(82, 76, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 20:53:52", "2025-07-31 20:53:52"),
	(83, 77, 1, NULL, NULL, 1, 150, 5000, "2025-07-31 21:01:41", "2025-07-31 21:01:41"),
	(84, 78, 0, NULL, NULL, 1, 1000, 1000, "2025-08-04 19:52:13", "2025-08-04 19:52:13"),
	(85, 79, 4, NULL, NULL, 1, 150.75, 100.5, "2025-08-04 19:55:10", "2025-08-04 19:55:10"),
	(86, 80, 0, NULL, NULL, 11, 150.75, 100.5, "2025-08-05 12:02:06", "2025-08-05 12:02:06"),
	(87, 81, 0, NULL, NULL, 10, 150.75, 100.5, "2025-08-05 12:03:53", "2025-08-05 12:03:53"),
	(88, 82, 0, NULL, NULL, 10, 150.75, 100.5, "2025-08-05 12:05:41", "2025-08-05 12:05:41"),
	(89, 83, 4, NULL, NULL, 10, 151.75, 100.5, "2025-08-05 13:26:10", "2025-08-05 13:26:10"),
	(90, 84, 4, NULL, NULL, 1, 151.75, 100.5, "2025-08-05 13:27:59", "2025-08-05 13:27:59"),
	(91, 85, 5, NULL, NULL, 0.5, 10000, 42800, "2025-08-17 19:00:40", "2025-08-17 19:00:40"),
	(92, 86, 2, NULL, NULL, 1, 250.5, 180, "2025-08-18 15:50:46", "2025-08-18 15:50:46"),
	(93, 87, 2, NULL, NULL, 1, 250.5, 180, "2025-08-18 15:51:01", "2025-08-18 15:51:01"),
	(94, 88, 2, NULL, NULL, 1, 250.5, 180, "2025-08-18 21:02:22", "2025-08-18 21:02:22"),
	(95, 89, 2, NULL, NULL, 1, 250.5, 180, "2025-08-18 21:11:09", "2025-08-18 21:11:09"),
	(96, 90, 2, NULL, NULL, 1, 250.5, 180, "2025-08-18 21:13:03", "2025-08-18 21:13:03"),
	(97, 91, 12, NULL, NULL, 3, 1800, 150, "2025-08-21 23:34:43", "2025-08-21 23:34:43"),
	(98, 92, 12, NULL, NULL, 6, 1800, 150, "2025-08-21 23:38:34", "2025-08-21 23:38:34"),
	(99, 101, NULL, 1, NULL, 1, 15000, 0, "2025-08-23 18:19:41", "2025-08-23 18:19:41"),
	(100, 102, 3, NULL, NULL, 3, 1200, 900, "2025-08-25 10:42:23", "2025-08-25 10:42:23"),
	(101, 103, 3, NULL, 1, 2, 600, 900, "2025-08-25 12:19:44", "2025-08-25 12:19:44"),
	(102, 104, 3, NULL, 1, 2, 600, 900, "2025-08-25 12:55:13", "2025-08-25 12:55:13"),
	(103, 117, 6, NULL, NULL, 1, 7500, 5454.55, "2025-08-26 23:30:06", "2025-08-26 23:30:06"),
	(104, 117, 6, NULL, NULL, 1, 7000, 5454.55, "2025-08-26 23:30:06", "2025-08-26 23:30:06"),
	(105, 117, 6, NULL, NULL, 1, 6500, 5454.55, "2025-08-26 23:30:06", "2025-08-26 23:30:06"),
	(106, 118, 3, NULL, NULL, 1, 1200, 900, "2025-08-27 13:12:32", "2025-08-27 13:12:32"),
	(107, 118, 4, NULL, NULL, 1, 150.75, 100.5, "2025-08-27 13:12:32", "2025-08-27 13:12:32"),
	(108, 118, 5, NULL, NULL, 1, 10000, 42800, "2025-08-27 13:12:32", "2025-08-27 13:12:32"),
	(109, 119, 13, NULL, NULL, 1, 2500, 2111.11, "2025-08-27 13:15:06", "2025-08-27 13:15:06"),
	(110, 119, 14, NULL, NULL, 1, 9000, 4500, "2025-08-27 13:15:06", "2025-08-27 13:15:06"),
	(111, 119, 3, NULL, 1, 2, 600, 900, "2025-08-27 13:15:06", "2025-08-27 13:15:06"),
	(112, 120, NULL, 1, NULL, 1, 15000, 0, "2025-08-29 13:28:17", "2025-08-29 13:28:17"),
	(113, 120, 3, NULL, 1, 4, 600, 900, "2025-08-29 13:28:17", "2025-08-29 13:28:17"),
	(114, 121, 1, NULL, NULL, 1, 150, 6000, "2025-09-01 23:52:45", "2025-09-01 23:52:45"),
	(115, 122, 1, NULL, NULL, 1, 150, 6000, "2025-09-02 11:31:52", "2025-09-02 11:31:52"),
	(116, 123, 3, NULL, NULL, 6, 1200, 900, "2025-09-02 11:58:38", "2025-09-02 11:58:38"),
	(117, 124, 12, NULL, NULL, 6, 280, 200, "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(118, 124, 6, NULL, NULL, 0.5, 7200, 5454.55, "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(119, 124, NULL, 1, NULL, 1, 15000, 0, "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(120, 124, 13, NULL, NULL, 1, 2500, 1000, "2025-09-02 12:01:18", "2025-09-02 12:01:18"),
	(121, 125, 6, NULL, NULL, 0.5, 7200, 5454.55, "2025-09-02 15:37:59", "2025-09-02 15:37:59"),
	(122, 126, 1, NULL, NULL, 1, 150, 6000, "2025-09-02 18:35:24", "2025-09-02 18:35:24"),
	(123, 126, NULL, NULL, NULL, 10, 1, 0, "2025-09-02 18:35:24", "2025-09-02 18:35:24"),
	(124, 127, 1, NULL, NULL, 1, 150, 6000, "2025-09-02 19:11:33", "2025-09-02 19:11:33"),
	(125, 127, 12, NULL, NULL, 5, 300, 200, "2025-09-02 19:11:33", "2025-09-02 19:11:33"),
	(126, 128, 1, NULL, NULL, 1, 150, 6000, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(127, 128, 6, NULL, NULL, 0.535, 7500, 5454.55, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(128, 128, NULL, 1, NULL, 1, 15000, 0, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(129, 128, 8, NULL, NULL, 1, 6500, 3800, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(130, 128, 4, NULL, NULL, 1, 150.75, 100.5, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(131, 128, 3, NULL, NULL, 1, 1200, 1000, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(132, 128, 2, NULL, NULL, 2, 250.5, 1000, "2025-09-03 13:56:34", "2025-09-03 13:56:34"),
	(133, 129, 15, NULL, NULL, 0.5, 2500, 2000, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(134, 129, 8, NULL, NULL, 1, 6500, 3800, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(135, 129, 12, NULL, NULL, 6, 280, 200, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(136, 129, 3, NULL, NULL, 1, 1200, 1000, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(137, 129, NULL, 1, NULL, 1, 15000, 0, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(138, 129, 4, NULL, NULL, 1, 150.75, 100.5, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(139, 129, 2, NULL, NULL, 1, 250.5, 1000, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(140, 129, 1, NULL, NULL, 1, 150, 6000, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(141, 129, 6, NULL, NULL, 1.899, 7200, 5454.55, "2025-09-07 16:10:21", "2025-09-07 16:10:21"),
	(142, 130, NULL, NULL, NULL, 0.5, 1000, 0, "2025-09-09 10:44:45", "2025-09-09 10:44:45"),
	(143, 130, 12, NULL, NULL, 1, 300, 200, "2025-09-09 10:44:45", "2025-09-09 10:44:45"),
	(144, 131, NULL, NULL, NULL, 1, 1000, 0, "2025-09-10 21:05:43", "2025-09-10 21:05:43"),
	(145, 131, 3, NULL, NULL, 2, 1200, 1000, "2025-09-10 21:05:43", "2025-09-10 21:05:43"),
	(146, 131, 12, NULL, 3, 3, 233.333, 180.56, "2025-09-10 21:05:43", "2025-09-10 21:05:43"),
	(147, 132, 3, NULL, NULL, 1, 1200, 1000, "2025-09-10 21:16:25", "2025-09-10 21:16:25"),
	(148, 133, 2, NULL, NULL, 1, 250.5, 1000, "2025-09-12 13:08:09", "2025-09-12 13:08:09");

/*!40000 ALTER TABLE `sales_details` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table sessions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `sessions`;

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
	("lwJfvRMvfiGZ-Z6Zl3MnRkQqop98M3BP", 1757720943, "{\"cookie\":{\"originalMaxAge\":28800000,\"expires\":\"2025-09-12T21:10:10.131Z\",\"secure\":false,\"httpOnly\":true,\"path\":\"/\"},\"usuario\":{\"id\":1,\"nombre\":\"Hugo\",\"username\":\"Hugo\",\"rol_id\":1,\"rol_nombre\":\"Administrador\",\"theme_preference\":\"dark\",\"permisos\":[\"abrir_caja\",\"ajustar_stock\",\"aplicar_descuento\",\"cancelar_venta\",\"cerrar_caja\",\"crear_cliente\",\"crear_producto\",\"crear_proveedor\",\"crear_usuario\",\"crear_venta\",\"editar_cliente\",\"editar_producto\",\"editar_proveedor\",\"editar_tema\",\"editar_usuario\",\"eliminar_producto\",\"eliminar_usuario\",\"exportar_reportes\",\"gestionar_combos\",\"gestionar_promociones\",\"gestionar_roles\",\"importar_stock\",\"imprimir_codigos_barras\",\"ver_cajas_admin\",\"ver_clientes\",\"ver_historial_ventas\",\"ver_landing\",\"ver_medios_pago\",\"ver_movimientos_caja\",\"ver_productos\",\"ver_proveedores\",\"ver_reportes_stock\",\"ver_reportes_ventas\",\"ver_stock\",\"ver_tarjeta_caja\",\"ver_tarjeta_clientes\",\"ver_tarjeta_compras\",\"ver_tarjeta_dashboard\",\"ver_tarjeta_stock\",\"ver_tarjeta_ventas\",\"ver_usuarios\"]}}");

/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table stockCategories
# ------------------------------------------------------------

DROP TABLE IF EXISTS `stockCategories`;

CREATE TABLE `stockCategories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `stockCategories` WRITE;
/*!40000 ALTER TABLE `stockCategories` DISABLE KEYS */;

INSERT INTO `stockCategories` (`id`, `name`, `description`, `createdAt`, `updatedAt`) VALUES
	(1, "General", "Artículos varios que no encajan en otras categorías \n      específicas.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(2, "Lácteos", "Productos derivados de la leche, como quesos, yogures y \n      mantequillas.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(3, "Panadería", "Artículos frescos de pan y bollería, ideales para el \n      desayuno o merienda.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(4, "Bebidas", "Variedad de líquidos para hidratarse: aguas, refrescos, \n      jugos y más.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(5, "Snacks", "Aperitivos y golosinas para disfrutar entre comidas o en \n      cualquier momento.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(6, "Carnes", "Cortes frescos de res, cerdo, pollo y otras aves para tus \n      comidas principales.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(7, "Frutas y Verduras", "Productos frescos de la huerta, esenciales para \n      una dieta equilibrada.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(8, "Limpieza", "Artículos para mantener tu hogar impecable y \n      desinfectado.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(9, "Perfumería", "Productos de cuidado personal y fragancias para el día a\n      día.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(10, "Congelados", "Alimentos que requieren refrigeración extrema para su \n      conservación.", "2025-07-26 14:50:49", "2025-07-26 14:50:49"),
	(21, "Embutidos", "Fiembres en general", "2025-09-02 00:00:00", "2025-09-02 00:00:00"),
	(22, "Art. de Libreria", "Artículos de libreria, útiles escolares", "2025-09-02 00:00:00", "2025-09-02 00:00:00"),
	(23, "Art. de Bazar", "Utencillos de cocina, reposteria, etc.", "2025-09-02 00:00:00", "2025-09-02 00:00:00");

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;

INSERT INTO `stocks` (`id`, `barcode`, `name`, `description`, `price`, `tipo_venta`, `cost`, `stock`, `min_stock`, `units_id`, `category_id`, `supplier_id`, `visible`, `createdAt`, `updatedAt`) VALUES
	(0, "MANUAL", "Producto Manual", "Producto genérico para ventas manuales sin stock físico.", 0, "unitario", 0, 0, 0, 1, 1, NULL, 0, "2025-07-28 12:31:54", "2025-07-28 12:31:54"),
	(1, "1234567890123", "Producto de Ejemplo 1", "Descripción del producto de ejemplo 1", 150, "unitario", 6000, 29, 15, 1, 1, 1, 1, "2025-07-11 11:19:32", "2025-09-07 16:10:21"),
	(2, "9876543210987", "Producto de Ejemplo 2", "Descripción del producto de ejemplo 2", 250.5, "unitario", 1000, 71, 5, 1, 1, 1, 1, "2025-07-11 11:19:32", "2025-09-12 13:08:09"),
	(3, "9876543210988", "Coca-Cola 500", "Coca-Colar de 500ml", 1200, "unitario", 1000, 86, 24, 1, 4, 1, 1, "2025-07-15 15:40:05", "2025-09-10 21:16:25"),
	(4, "7790010001234", "Producto Ejemplo", "Breve descripción del producto", 150.75, "unitario", 100.5, -1, 10, 1, 1, 2, 1, "2025-07-21 13:57:28", "2025-09-07 16:10:21"),
	(5, "1234567891234", "Jamon Cocido Paladini", "Jamon Cocido Paladini", 10000, "pesable", 42800, 2.25, 5, 2, 1, 2, 1, "2025-07-25 14:30:56", "2025-08-27 13:12:32"),
	(6, "1234567899999", "Queso Cremoso Ilolay", "Cremoso marca Ilolay", 7500, "pesable", 5454.55, 49.266, 15, 2, 2, 2, 1, "2025-07-26 17:53:40", "2025-09-07 16:10:21"),
	(8, "7790613071797", "Lustra Muebles Suiza 360cm", "Aerosol naranja  pimienta", 6500, "unitario", 3800, 105, 20, 1, 8, 1, 1, "2025-07-29 13:40:40", "2025-09-07 16:10:21"),
	(12, "1111111111111", "Huevo", "Huevo", 300, "unitario", 180.56, 420, 120, 1, 1, 3, 1, "2025-08-21 12:27:37", "2025-09-10 21:05:43"),
	(13, NULL, "Coca-Cola 1.5", "Coca-Cola de 1.5 Litros", 2500, "unitario", 3500, 65, 20, 1, 4, 1, 1, "2025-08-23 16:08:58", "2025-09-10 20:36:19"),
	(14, NULL, "Fernet 750cc", "Botella de Fernet de 750cc", 9000, "unitario", 4500, 14, 12, 1, 4, 1, 1, "2025-08-23 16:09:59", "2025-09-07 16:10:21"),
	(15, "0000000014253", "Mortadela", "bocha", 2500, "pesable", 2000, 1.5, 0.5, 2, 1, 5, 1, "2025-09-02 12:15:17", "2025-09-07 16:10:21");

/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table suppliers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `suppliers`;

CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `cuit` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `telefono` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;

INSERT INTO `suppliers` (`id`, `nombre`, `cuit`, `telefono`, `createdAt`, `updatedAt`) VALUES
	(1, "Makro", NULL, NULL, "2025-07-15 22:15:41", "2025-07-15 22:15:41"),
	(2, "Proveedor Ejemplo", NULL, NULL, "2025-07-21 13:57:28", "2025-07-21 13:57:28"),
	(3, "Huevo Campo", NULL, NULL, "2025-08-21 11:02:50", "2025-08-21 11:02:50"),
	(4, "Yaguar", NULL, NULL, "2025-08-24 16:41:49", "2025-08-24 16:41:49"),
	(5, "pirulito", NULL, NULL, "2025-09-02 12:11:05", "2025-09-02 12:11:05"),
	(6, "coca", NULL, NULL, "2025-09-10 20:20:37", "2025-09-10 20:20:37"),
	(7, "sin Proveedor", NULL, NULL, "2025-09-10 20:23:19", "2025-09-10 20:23:19");

/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table units
# ------------------------------------------------------------

DROP TABLE IF EXISTS `units`;

CREATE TABLE `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `abreviatura` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
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
  `type` enum('grant','revoke') COLLATE utf8mb4_spanish2_ci NOT NULL COMMENT 'Indica si el permiso se concede (grant) o se revoca (revoke)',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_permission` (`user_id`,`permission_id`),
  KEY `fk_user_permissions_permission` (`permission_id`),
  CONSTRAINT `fk_user_permissions_permission` FOREIGN KEY (`permission_id`) REFERENCES `permisos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_permissions_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci COMMENT='Tabla de overrides de permisos para usuarios específicos.';

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;

INSERT INTO `user_permissions` (`id`, `user_id`, `permission_id`, `type`, `createdAt`, `updatedAt`) VALUES
	(1, 3, 27, "revoke", "2025-08-30 15:01:05", "2025-08-30 16:13:33"),
	(3, 3, 36, "grant", "2025-08-30 16:14:03", "2025-08-30 16:14:03"),
	(16, 2, 3, "grant", "2025-09-12 15:46:27", "2025-09-12 15:48:34"),
	(18, 2, 2, "grant", "2025-09-12 15:48:34", "2025-09-12 15:48:34"),
	(19, 2, 1, "grant", "2025-09-12 15:48:34", "2025-09-12 15:48:34"),
	(20, 2, 4, "grant", "2025-09-12 15:48:34", "2025-09-12 15:48:34"),
	(21, 2, 30, "grant", "2025-09-12 15:48:34", "2025-09-12 15:48:34"),
	(22, 2, 40, "grant", "2025-09-12 15:48:34", "2025-09-12 15:48:34");

/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;



# Dump of table usuarios
# ------------------------------------------------------------

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_spanish2_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `rol_id` int DEFAULT NULL,
  `theme_preference` varchar(255) COLLATE utf8mb4_spanish2_ci NOT NULL DEFAULT 'dark',
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
	(5, "Maxi", "maxi", "$2b$10$N0mrBA.W7/I5UDNVQXS5euCgZXGYj4W2i.CTGx9vL9nC1UywUpgD.", 1, "2025-09-01 22:19:18", "2025-09-02 12:12:56", 1, "dark"),
	(6, "Cajero 3", "cajero3", "$2b$10$2JG5q7BlHtEgVea5/.ZQHeWF59.0P3dlmpUyjiXbbP62RM3ppZ.UC", 1, "2025-09-10 14:43:56", "2025-09-10 14:43:56", 3, "dark");

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

# Dump completed on 2025-09-12T12:49:59-03:00
