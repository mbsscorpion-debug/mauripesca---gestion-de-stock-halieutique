export type SpeciesCategory = 
  | "Céphalopodes"
  | "Pélagiques"
  | "Démersaux / Poissons Nobles"
  | "Farine & Huile de Poisson";

export type FreezingMethod = 
  | "Bloc Surgelé (Plateaux)"
  | "IQF (Surgélation Individuelle)"
  | "Frais sous Glace"
  | "Farine Séchée / Sacs"
  | "Huile Liquide / Fûts";

export type PackagingType = 
  | "Carton 20kg (2 x 10kg)"
  | "Carton 24kg"
  | "Carton 10kg"
  | "Carton 15kg"
  | "Sac tissé 50kg"
  | "Fût métallique 200L"
  | "Caisse plastique 30kg";

export type StockStatus = 
  | "DISPONIBLE"
  | "RESERVE_EXPORT"
  | "EN_CONTROLE_ONISPA"
  | "EN_QUARANTAINE"
  | "EPUISE";

export type Currency = "MRU" | "EUR" | "USD";

export type TabType = 
  | "DASHBOARD"
  | "INVENTORY"
  | "MOVEMENTS"
  | "COLD_ROOMS"
  | "TRACEABILITY"
  | "DOCUMENTS"
  | "AI_ASSISTANT"
  | "MYSQL_SYNC";

export interface MySQLSyncConfig {
  apiUrl: string;
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUser: string;
  autoSync: boolean;
  lastSyncTimestamp: string | null;
  syncStatus: "IDLE" | "SYNCING" | "SUCCESS" | "ERROR";
  lastErrorMessage?: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  type: "PUSH" | "PULL" | "TEST" | "CLEAR" | "IMPORT" | "PURGE_LOCALE" | "CHARGEMENT_DEMO" | string;
  status: "SUCCESS" | "ERROR" | "INFO";
  message: string;
  itemCount?: number;
  details?: string;
}

export interface StockItem {
  id: string;
  sku: string;
  lotNumber: string;
  speciesName: string;
  scientificName: string;
  category: SpeciesCategory;
  caliber: string; // e.g., "T3 (1.2kg - 1.5kg)", "200-300g", "65% Protéines"
  freezingMethod: FreezingMethod;
  packaging: PackagingType;
  unitWeightKg: number;
  cartonCount: number; // units (cartons/sacs/fûts)
  totalWeightKg: number;
  totalWeightTonnes: number;
  coldRoomId: string;
  coldRoomName: string;
  vesselName: string; // Navire pêcheur (ex: RIM-PECHE 07)
  vesselRegistration: string;
  fishingZone: string; // e.g. "ZEE Mauritanienne (FAO 34.1.3)"
  captureDate: string; // YYYY-MM-DD
  freezingDate: string;
  expiryDate: string;
  onispaCertNumber: string; // Ex: "ONISPA-RIM-2026-8891"
  qualityGrade: "Extra Export Japon" | "Catégorie A (UE)" | "Standard Régional" | "Industriel";
  unitPriceMRUPerKg: number; // Prix en Ouguiya Mauritanienne (MRU)
  unitPriceEURPerKg: number;
  unitPriceUSDPerKg: number;
  status: StockStatus;
  notes?: string;
  updatedAt: string;
}

export type MovementType = 
  | "ENTREE_DEBARQUEMENT"
  | "SORTIE_EXPORT"
  | "SORTIE_VENTE_LOCALE"
  | "TRANSFERT_CHAMBRE_FROIDE"
  | "AJUSTEMENT_INVENTAIRE";

export interface StockMovement {
  id: string;
  reference: string;
  type: MovementType;
  date: string;
  stockItemId: string;
  productName: string;
  lotNumber: string;
  speciesCategory?: SpeciesCategory;
  cartonCount: number;
  weightKg: number;
  weightTonnes: number;
  fromLocation: string;
  toLocation: string;
  vesselOrSupplier?: string;
  clientOrDestination?: string; // e.g., "Iberconsa (Espagne)", "Nippon Suisan (Japon)", "Grossiste Nouakchott"
  containerNumber?: string; // e.g., "MSKU-749210-9 (Reefer)"
  sealNumber?: string; // Plomb douanier / ONISPA
  operatorName: string;
  totalValueMRU?: number;
  notes?: string;
}

export interface ColdRoom {
  id: string;
  name: string;
  code: string;
  location: "Port de Pêche Nouadhibou" | "Zone Industrielle Nouadhibou" | "Port Artisanal Nouakchott";
  capacityTonnes: number;
  currentTonnes: number;
  targetTempCelsius: number; // e.g. -25
  currentTempCelsius: number; // e.g. -24.3
  humidityPercent: number;
  status: "OPTIMAL" | "ATTENTION_TEMP" | "DEGIVRAGE" | "MAINTENANCE";
  activeLotsCount: number;
  lastInspectionDate: string;
}

export interface Vessel {
  id: string;
  name: string;
  matricule: string;
  type: "Chalutier Céphalopodier" | "Pélagique Congélateur" | "Palangrier Glacier" | "Artisanal Senneur";
  portAttache: "Nouadhibou" | "Nouakchott";
  captain: string;
  capacityTonnes: number;
  status: "EN_MER" | "A_QUAI_DEBARQUEMENT" | "EN_RADE" | "EN_CARÉNAGE";
}

export interface ExportPackingList {
  id: string;
  reference: string;
  exportDate: string;
  clientName: string;
  clientCountry: string;
  destinationPort: string;
  containerNumber: string;
  sealNumber: string;
  vesselCarrier: string; // Navire porte-conteneurs
  coldRoomSource: string;
  temperatureSet: string;
  items: {
    stockItemId: string;
    lotNumber: string;
    species: string;
    caliber: string;
    cartons: number;
    netWeightKg: number;
    grossWeightKg: number;
    pricePerKgEUR: number;
    totalEUR: number;
    onispaRef: string;
  }[];
  totalCartons: number;
  totalNetWeightTonnes: number;
  totalGrossWeightTonnes: number;
  totalValueEUR: number;
  totalValueMRU: number;
  sanitaryCertRef: string;
  status: "BROUILLON" | "VALIDE_DOUANE" | "EMBARQUE" | "LIVRE";
}
