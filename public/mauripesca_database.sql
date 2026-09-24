-- ====================================================================
-- MAURIPESCA S.A. - BASE DE DONNÉES MYSQL / MARIADB POUR XAMPP (phpMyAdmin)
-- Système de Gestion de Stock & Traçabilité Halieutique
-- Ports de Nouadhibou et Nouakchott, Mauritanie
-- ====================================================================

-- 1. Création de la Base de Données
CREATE DATABASE IF NOT EXISTS `mauripesca_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `mauripesca_db`;

-- --------------------------------------------------------
-- 2. Structure : Table des Chambres Froides & Entrepôts
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cold_rooms` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `location` ENUM('Port de Pêche Nouadhibou', 'Zone Industrielle Nouadhibou', 'Port Artisanal Nouakchott') NOT NULL,
  `capacity_tonnes` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `current_tonnes` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `target_temp_celsius` DECIMAL(5,1) NOT NULL DEFAULT -25.0,
  `current_temp_celsius` DECIMAL(5,1) NOT NULL DEFAULT -25.0,
  `humidity_percent` INT NOT NULL DEFAULT 85,
  `status` ENUM('OPTIMAL', 'ATTENTION_TEMP', 'DEGIVRAGE', 'MAINTENANCE') NOT NULL DEFAULT 'OPTIMAL',
  `active_lots_count` INT NOT NULL DEFAULT 0,
  `last_inspection_date` DATE NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coldroom_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Structure : Table des Navires de Pêche Partenaires
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `vessels` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `matricule` VARCHAR(64) NOT NULL,
  `type` VARCHAR(128) NOT NULL,
  `port_attache` ENUM('Nouadhibou', 'Nouakchott') NOT NULL,
  `captain` VARCHAR(255) NOT NULL,
  `capacity_tonnes` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('EN_MER', 'A_QUAI_DEBARQUEMENT', 'EN_RADE', 'EN_CARÉNAGE') NOT NULL DEFAULT 'A_QUAI_DEBARQUEMENT',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_vessel_matricule` (`matricule`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Structure : Table des Lots de Produits en Stock
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_items` (
  `id` VARCHAR(64) NOT NULL,
  `sku` VARCHAR(64) NOT NULL,
  `lot_number` VARCHAR(64) NOT NULL,
  `species_name` VARCHAR(255) NOT NULL,
  `scientific_name` VARCHAR(255) NOT NULL,
  `category` ENUM('Céphalopodes', 'Pélagiques', 'Démersaux / Poissons Nobles', 'Farine & Huile de Poisson') NOT NULL,
  `caliber` VARCHAR(128) NOT NULL,
  `freezing_method` VARCHAR(128) NOT NULL,
  `packaging` VARCHAR(128) NOT NULL,
  `unit_weight_kg` DECIMAL(10,2) NOT NULL,
  `carton_count` INT NOT NULL DEFAULT 0,
  `total_weight_kg` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_weight_tonnes` DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  `cold_room_id` VARCHAR(64) NOT NULL,
  `cold_room_name` VARCHAR(255) NOT NULL,
  `vessel_name` VARCHAR(255) NOT NULL,
  `vessel_registration` VARCHAR(64) NOT NULL,
  `fishing_zone` VARCHAR(255) NOT NULL,
  `capture_date` DATE NOT NULL,
  `freezing_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `onispa_cert_number` VARCHAR(128) NOT NULL,
  `quality_grade` VARCHAR(128) NOT NULL,
  `unit_price_mru_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `unit_price_eur_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `unit_price_usd_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('DISPONIBLE', 'RESERVE_EXPORT', 'EN_CONTROLE_ONISPA', 'EN_QUARANTAINE', 'EPUISE') NOT NULL DEFAULT 'DISPONIBLE',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` VARCHAR(64) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_lot_number` (`lot_number`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`status`),
  KEY `idx_cold_room` (`cold_room_id`),
  KEY `idx_capture_date` (`capture_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Structure : Table du Journal des Mouvements de Stock
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` VARCHAR(64) NOT NULL,
  `reference` VARCHAR(64) NOT NULL,
  `type` ENUM('ENTREE_DEBARQUEMENT', 'SORTIE_EXPORT', 'SORTIE_VENTE_LOCALE', 'TRANSFERT_CHAMBRE_FROIDE', 'AJUSTEMENT_INVENTAIRE') NOT NULL,
  `movement_date` VARCHAR(64) NOT NULL,
  `stock_item_id` VARCHAR(64) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `lot_number` VARCHAR(64) NOT NULL,
  `species_category` VARCHAR(128) NULL,
  `carton_count` INT NOT NULL DEFAULT 0,
  `weight_kg` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `weight_tonnes` DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  `from_location` VARCHAR(255) NOT NULL,
  `to_location` VARCHAR(255) NOT NULL,
  `vessel_or_supplier` VARCHAR(255) NULL,
  `client_or_destination` VARCHAR(255) NULL,
  `container_number` VARCHAR(128) NULL,
  `seal_number` VARCHAR(128) NULL,
  `operator_name` VARCHAR(255) NOT NULL,
  `total_value_mru` DECIMAL(14,2) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_movement_ref` (`reference`),
  KEY `idx_mvt_lot` (`lot_number`),
  KEY `idx_mvt_type` (`type`),
  KEY `idx_mvt_date` (`movement_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Structure : Table des Listes de Colisage (Packing Lists Export)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `export_packing_lists` (
  `id` VARCHAR(64) NOT NULL,
  `reference` VARCHAR(64) NOT NULL,
  `export_date` DATE NOT NULL,
  `client_name` VARCHAR(255) NOT NULL,
  `client_country` VARCHAR(128) NOT NULL,
  `destination_port` VARCHAR(255) NOT NULL,
  `container_number` VARCHAR(128) NOT NULL,
  `seal_number` VARCHAR(128) NOT NULL,
  `vessel_carrier` VARCHAR(255) NOT NULL,
  `cold_room_source` VARCHAR(255) NOT NULL,
  `temperature_set` VARCHAR(32) NOT NULL,
  `items_json` LONGTEXT NOT NULL,
  `total_cartons` INT NOT NULL DEFAULT 0,
  `total_net_weight_tonnes` DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  `total_gross_weight_tonnes` DECIMAL(10,3) NOT NULL DEFAULT 0.000,
  `total_value_eur` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_value_mru` DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  `sanitary_cert_ref` VARCHAR(128) NOT NULL,
  `status` ENUM('BROUILLON', 'VALIDE_DOUANE', 'EMBARQUE', 'LIVRE') NOT NULL DEFAULT 'BROUILLON',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_export_ref` (`reference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- DONNÉES INITIALES : Chambres Froides de Mauritanie
-- ========================================================
INSERT INTO `cold_rooms` (`id`, `name`, `code`, `location`, `capacity_tonnes`, `current_tonnes`, `target_temp_celsius`, `current_temp_celsius`, `humidity_percent`, `status`, `active_lots_count`, `last_inspection_date`) VALUES
('cr-1', 'Chambre Froide A1 (Céphalopodes & Nobles)', 'CF-NDB-A1', 'Port de Pêche Nouadhibou', 1200.00, 0.00, -25.0, -25.0, 88, 'OPTIMAL', 0, '2026-03-24'),
('cr-2', 'Chambre Froide A2 (Pélagiques & Blocs)', 'CF-NDB-A2', 'Port de Pêche Nouadhibou', 2500.00, 0.00, -22.0, -22.0, 90, 'OPTIMAL', 0, '2026-03-24'),
('cr-3', 'Chambre Froide B1 (Export Haut de Gamme IQF)', 'CF-NDB-B1', 'Zone Industrielle Nouadhibou', 800.00, 0.00, -28.0, -28.0, 86, 'OPTIMAL', 0, '2026-03-24'),
('cr-4', 'Hangar & Silos B2 (Farine & Huile)', 'ST-NDB-B2', 'Zone Industrielle Nouadhibou', 1500.00, 0.00, 18.0, 18.5, 45, 'OPTIMAL', 0, '2026-03-24'),
('cr-5', 'Entrepôt Frigorifique Nouakchott C1', 'CF-NKC-C1', 'Port Artisanal Nouakchott', 600.00, 0.00, -20.0, -20.0, 89, 'OPTIMAL', 0, '2026-03-24')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- ========================================================
-- DONNÉES INITIALES : Flotte de Navires Partenaires
-- ========================================================
INSERT INTO `vessels` (`id`, `name`, `matricule`, `type`, `port_attache`, `captain`, `capacity_tonnes`, `status`) VALUES
('v-1', 'RIM-PECHE 03', 'RIM-NDB-1082', 'Chalutier Céphalopodier', 'Nouadhibou', 'Cap. Mohamed Ould Cheikh', 140.00, 'A_QUAI_DEBARQUEMENT'),
('v-2', 'MAURI-VOYAGER II', 'RIM-NDB-0941', 'Pélagique Congélateur', 'Nouadhibou', 'Cap. Samba Diop', 450.00, 'EN_MER'),
('v-3', 'AL-BARAKA VII', 'RIM-NDB-1204', 'Chalutier Céphalopodier', 'Nouadhibou', 'Cap. Ahmed Salem', 160.00, 'EN_MER'),
('v-4', 'ATLANTIC PESCA 1', 'RIM-NDB-0811', 'Palangrier Glacier', 'Nouadhibou', 'Cap. Sidi Mahmoud', 85.00, 'EN_RADE'),
('v-5', 'EL-MANAR 05', 'RIM-NKC-0329', 'Artisanal Senneur', 'Nouakchott', 'Cap. Brahim Fall', 40.00, 'A_QUAI_DEBARQUEMENT')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
