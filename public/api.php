<?php
/**
 * ====================================================================
 * MAURIPESCA S.A. - Passerelle API PHP / MySQL pour XAMPP
 * ====================================================================
 * Système de Gestion de Stock & Traçabilité Halieutique
 * Ports de Nouadhibou et Nouakchott, Mauritanie
 *
 * Emplacement recommandé :
 * C:\xampp\htdocs\mauripesca\api.php
 *
 * Accès URL local :
 * http://localhost/mauripesca/api.php
 */

// 1. Autoriser les requêtes cross-origin (CORS) depuis l'application Web
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Paramètres de connexion MySQL XAMPP
$db_host = 'localhost';
$db_port = 3306;
$db_name = 'mauripesca_db';
$db_user = 'root';
$db_pass = ''; // Par défaut dans XAMPP, l'utilisateur root n'a pas de mot de passe

try {
    $pdo = new PDO("mysql:host=$db_host;port=$db_port;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    // Créer la base de données si elle n'existe pas encore
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$db_name`");

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Impossible de se connecter à MySQL XAMPP : ' . $e->getMessage(),
        'hint' => 'Vérifiez que le service MySQL est bien démarré dans le panneau XAMPP Control Panel.'
    ]);
    exit;
}

$action = isset($_GET['action']) ? $_GET['action'] : 'ping';

// ==========================================
// ACTIONS DE L'API
// ==========================================

switch ($action) {
    // ----------------------------------------------------
    // Test de connexion (Ping)
    // ----------------------------------------------------
    case 'ping':
        initSchema($pdo);
        echo json_encode([
            'status' => 'success',
            'message' => 'Connecté avec succès au serveur MySQL XAMPP !',
            'server_version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
            'database' => $db_name,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        break;

    // ----------------------------------------------------
    // Création des tables
    // ----------------------------------------------------
    case 'init_tables':
        initSchema($pdo);
        echo json_encode([
            'status' => 'success',
            'message' => 'Tables MySQL créées et initialisées avec succès dans ' . $db_name
        ]);
        break;

    // ----------------------------------------------------
    // Récupérer toutes les données de la base (Pull / Get All)
    // ----------------------------------------------------
    case 'get_all':
    case 'pull':
        initSchema($pdo);
        $stock = $pdo->query("SELECT * FROM stock_items ORDER BY created_at DESC")->fetchAll();
        $movements = $pdo->query("SELECT * FROM stock_movements ORDER BY created_at DESC")->fetchAll();
        $coldRooms = $pdo->query("SELECT * FROM cold_rooms")->fetchAll();
        $packingLists = $pdo->query("SELECT * FROM export_packing_lists ORDER BY created_at DESC")->fetchAll();
        $vessels = $pdo->query("SELECT * FROM vessels")->fetchAll();

        // Mapper les champs snake_case vers camelCase pour l'application
        $mappedStock = array_map(function($r) {
            return [
                'id' => $r['id'],
                'sku' => $r['sku'],
                'lotNumber' => $r['lot_number'],
                'speciesName' => $r['species_name'],
                'scientificName' => $r['scientific_name'],
                'category' => $r['category'],
                'caliber' => $r['caliber'],
                'freezingMethod' => $r['freezing_method'],
                'packaging' => $r['packaging'],
                'unitWeightKg' => (float)$r['unit_weight_kg'],
                'cartonCount' => (int)$r['carton_count'],
                'totalWeightKg' => (float)$r['total_weight_kg'],
                'totalWeightTonnes' => (float)$r['total_weight_tonnes'],
                'coldRoomId' => $r['cold_room_id'],
                'coldRoomName' => $r['cold_room_name'],
                'vesselName' => $r['vessel_name'],
                'vesselRegistration' => $r['vessel_registration'],
                'fishingZone' => $r['fishing_zone'],
                'captureDate' => $r['capture_date'],
                'freezingDate' => $r['freezing_date'],
                'expiryDate' => $r['expiry_date'],
                'onispaCertNumber' => $r['onispa_cert_number'],
                'qualityGrade' => $r['quality_grade'],
                'unitPriceMRUPerKg' => (float)$r['unit_price_mru_kg'],
                'unitPriceEURPerKg' => (float)$r['unit_price_eur_kg'],
                'unitPriceUSDPerKg' => (float)$r['unit_price_usd_kg'],
                'status' => $r['status'],
                'notes' => $r['notes'],
                'updatedAt' => $r['updated_at'],
            ];
        }, $stock);

        $mappedMovements = array_map(function($m) {
            return [
                'id' => $m['id'],
                'reference' => $m['reference'],
                'type' => $m['type'],
                'date' => $m['movement_date'],
                'stockItemId' => $m['stock_item_id'],
                'productName' => $m['product_name'],
                'lotNumber' => $m['lot_number'],
                'speciesCategory' => $m['species_category'],
                'cartonCount' => (int)$m['carton_count'],
                'weightKg' => (float)$m['weight_kg'],
                'weightTonnes' => (float)$m['weight_tonnes'],
                'fromLocation' => $m['from_location'],
                'toLocation' => $m['to_location'],
                'vesselOrSupplier' => $m['vessel_or_supplier'],
                'clientOrDestination' => $m['client_or_destination'],
                'containerNumber' => $m['container_number'],
                'sealNumber' => $m['seal_number'],
                'operatorName' => $m['operator_name'],
                'totalValueMRU' => (float)$m['total_value_mru'],
                'notes' => $m['notes']
            ];
        }, $movements);

        $mappedColdRooms = array_map(function($c) {
            return [
                'id' => $c['id'],
                'name' => $c['name'],
                'code' => $c['code'],
                'location' => $c['location'],
                'capacityTonnes' => (float)$c['capacity_tonnes'],
                'currentTonnes' => (float)$c['current_tonnes'],
                'targetTempCelsius' => (float)$c['target_temp_celsius'],
                'currentTempCelsius' => (float)$c['current_temp_celsius'],
                'humidityPercent' => (int)$c['humidity_percent'],
                'status' => $c['status'],
                'activeLotsCount' => (int)$c['active_lots_count'],
                'lastInspectionDate' => $c['last_inspection_date']
            ];
        }, $coldRooms);

        $mappedPacking = array_map(function($p) {
            return [
                'id' => $p['id'],
                'reference' => $p['reference'],
                'exportDate' => $p['export_date'],
                'clientName' => $p['client_name'],
                'clientCountry' => $p['client_country'],
                'destinationPort' => $p['destination_port'],
                'containerNumber' => $p['container_number'],
                'sealNumber' => $p['seal_number'],
                'vesselCarrier' => $p['vessel_carrier'],
                'coldRoomSource' => $p['cold_room_source'],
                'temperatureSet' => $p['temperature_set'],
                'items' => json_decode($p['items_json'], true) ?: [],
                'totalCartons' => (int)$p['total_cartons'],
                'totalNetWeightTonnes' => (float)$p['total_net_weight_tonnes'],
                'totalGrossWeightTonnes' => (float)$p['total_gross_weight_tonnes'],
                'totalValueEUR' => (float)$p['total_value_eur'],
                'totalValueMRU' => (float)$p['total_value_mru'],
                'sanitaryCertRef' => $p['sanitary_cert_ref'],
                'status' => $p['status']
            ];
        }, $packingLists);

        echo json_encode([
            'status' => 'success',
            'data' => [
                'stockItems' => $mappedStock,
                'movements' => $mappedMovements,
                'coldRooms' => $mappedColdRooms,
                'packingLists' => $mappedPacking,
                'vessels' => $vessels
            ],
            'counts' => [
                'stock' => count($mappedStock),
                'movements' => count($mappedMovements),
                'coldRooms' => count($mappedColdRooms),
                'packingLists' => count($mappedPacking)
            ]
        ]);
        break;

    // ----------------------------------------------------
    // Sauvegarder toutes les données vers MySQL (Push / Save)
    // ----------------------------------------------------
    case 'push_all':
    case 'push':
        initSchema($pdo);
        $rawInput = file_get_contents('php://input');
        $payload = json_decode($rawInput, true);

        if (!$payload) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'JSON payload invalide']);
            exit;
        }

        $pdo->beginTransaction();
        try {
            // Lots de stock
            if (isset($payload['stockItems']) && is_array($payload['stockItems'])) {
                $pdo->exec("DELETE FROM stock_items");
                $stmt = $pdo->prepare("INSERT INTO stock_items (
                    id, sku, lot_number, species_name, scientific_name, category, caliber,
                    freezing_method, packaging, unit_weight_kg, carton_count, total_weight_kg,
                    total_weight_tonnes, cold_room_id, cold_room_name, vessel_name,
                    vessel_registration, fishing_zone, capture_date, freezing_date, expiry_date,
                    onispa_cert_number, quality_grade, unit_price_mru_kg, unit_price_eur_kg,
                    unit_price_usd_kg, status, notes, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                foreach ($payload['stockItems'] as $s) {
                    $stmt->execute([
                        $s['id'], $s['sku'], $s['lotNumber'], $s['speciesName'], $s['scientificName'],
                        $s['category'], $s['caliber'], $s['freezingMethod'], $s['packaging'],
                        $s['unitWeightKg'], $s['cartonCount'], $s['totalWeightKg'], $s['totalWeightTonnes'],
                        $s['coldRoomId'], $s['coldRoomName'], $s['vesselName'], $s['vesselRegistration'],
                        $s['fishingZone'], $s['captureDate'], $s['freezingDate'], $s['expiryDate'],
                        $s['onispaCertNumber'], $s['qualityGrade'], $s['unitPriceMRUPerKg'],
                        $s['unitPriceEURPerKg'], $s['unitPriceUSDPerKg'], $s['status'],
                        $s['notes'] ?? '', $s['updatedAt'] ?? ''
                    ]);
                }
            }

            // Mouvements de stock
            if (isset($payload['movements']) && is_array($payload['movements'])) {
                $pdo->exec("DELETE FROM stock_movements");
                $stmtMvt = $pdo->prepare("INSERT INTO stock_movements (
                    id, reference, type, movement_date, stock_item_id, product_name, lot_number,
                    species_category, carton_count, weight_kg, weight_tonnes, from_location,
                    to_location, vessel_or_supplier, client_or_destination, container_number,
                    seal_number, operator_name, total_value_mru, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                foreach ($payload['movements'] as $m) {
                    $stmtMvt->execute([
                        $m['id'], $m['reference'], $m['type'], $m['date'], $m['stockItemId'],
                        $m['productName'], $m['lotNumber'], $m['speciesCategory'] ?? '',
                        $m['cartonCount'], $m['weightKg'], $m['weightTonnes'], $m['fromLocation'],
                        $m['toLocation'], $m['vesselOrSupplier'] ?? '', $m['clientOrDestination'] ?? '',
                        $m['containerNumber'] ?? '', $m['sealNumber'] ?? '', $m['operatorName'],
                        $m['totalValueMRU'] ?? 0, $m['notes'] ?? ''
                    ]);
                }
            }

            // Chambres froides
            if (isset($payload['coldRooms']) && is_array($payload['coldRooms'])) {
                $pdo->exec("DELETE FROM cold_rooms");
                $stmtCr = $pdo->prepare("INSERT INTO cold_rooms (
                    id, name, code, location, capacity_tonnes, current_tonnes, target_temp_celsius,
                    current_temp_celsius, humidity_percent, status, active_lots_count, last_inspection_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                foreach ($payload['coldRooms'] as $c) {
                    $stmtCr->execute([
                        $c['id'], $c['name'], $c['code'], $c['location'], $c['capacityTonnes'],
                        $c['currentTonnes'], $c['targetTempCelsius'], $c['currentTempCelsius'],
                        $c['humidityPercent'], $c['status'], $c['activeLotsCount'],
                        $c['lastInspectionDate'] ?? date('Y-m-d')
                    ]);
                }
            }

            // Listes de colisage Export (Packing Lists)
            if (isset($payload['packingLists']) && is_array($payload['packingLists'])) {
                $pdo->exec("DELETE FROM export_packing_lists");
                $stmtPkl = $pdo->prepare("INSERT INTO export_packing_lists (
                    id, reference, export_date, client_name, client_country, destination_port,
                    container_number, seal_number, vessel_carrier, cold_room_source, temperature_set,
                    items_json, total_cartons, total_net_weight_tonnes, total_gross_weight_tonnes,
                    total_value_eur, total_value_mru, sanitary_cert_ref, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

                foreach ($payload['packingLists'] as $p) {
                    $stmtPkl->execute([
                        $p['id'], $p['reference'], $p['exportDate'], $p['clientName'],
                        $p['clientCountry'], $p['destinationPort'], $p['containerNumber'],
                        $p['sealNumber'], $p['vesselCarrier'], $p['coldRoomSource'],
                        $p['temperatureSet'], json_encode($p['items'] ?? []),
                        $p['totalCartons'], $p['totalNetWeightTonnes'], $p['totalGrossWeightTonnes'],
                        $p['totalValueEUR'], $p['totalValueMRU'], $p['sanitaryCertRef'], $p['status']
                    ]);
                }
            }

            $pdo->commit();
            echo json_encode([
                'status' => 'success',
                'message' => 'Données synchronisées et enregistrées dans MySQL XAMPP avec succès !',
                'timestamp' => date('Y-m-d H:i:s'),
                'saved_counts' => [
                    'stock' => count($payload['stockItems'] ?? []),
                    'movements' => count($payload['movements'] ?? [])
                ]
            ]);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de la sauvegarde : ' . $e->getMessage()]);
        }
        break;

    // ----------------------------------------------------
    // Vider les données
    // ----------------------------------------------------
    case 'clear_all':
        initSchema($pdo);
        $pdo->exec("DELETE FROM stock_items");
        $pdo->exec("DELETE FROM stock_movements");
        $pdo->exec("DELETE FROM export_packing_lists");
        $pdo->exec("UPDATE cold_rooms SET current_tonnes = 0, active_lots_count = 0");
        echo json_encode([
            'status' => 'success',
            'message' => 'Toutes les tables ont été vidées avec succès dans MySQL XAMPP !'
        ]);
        break;

    default:
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Action inconnue : ' . htmlspecialchars($action)]);
        break;
}

/**
 * Création automatique de la structure des tables si inexistantes
 */
function initSchema($pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `cold_rooms` (
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
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `vessels` (
        `id` VARCHAR(64) NOT NULL,
        `name` VARCHAR(255) NOT NULL,
        `matricule` VARCHAR(64) NOT NULL,
        `type` VARCHAR(128) NOT NULL,
        `port_attache` ENUM('Nouadhibou', 'Nouakchott') NOT NULL,
        `captain` VARCHAR(255) NOT NULL,
        `capacity_tonnes` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        `status` ENUM('EN_MER', 'A_QUAI_DEBARQUEMENT', 'EN_RADE', 'EN_CARÉNAGE') NOT NULL DEFAULT 'A_QUAI_DEBARQUEMENT',
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `stock_items` (
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
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `stock_movements` (
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
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $pdo->exec("CREATE TABLE IF NOT EXISTS `export_packing_lists` (
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
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}
