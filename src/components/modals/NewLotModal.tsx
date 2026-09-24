import React, { useState } from "react";
import { 
  StockItem, 
  ColdRoom, 
  Vessel, 
  SpeciesCategory, 
  PackagingType, 
  FreezingMethod 
} from "../../types";
import { generateLotNumber } from "../../utils/formatters";
import { 
  X, 
  Ship, 
  Plus, 
  Boxes, 
  ShieldCheck, 
  ThermometerSnowflake 
} from "lucide-react";

interface NewLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLot: (newLot: StockItem) => void;
  coldRooms: ColdRoom[];
  vessels: Vessel[];
}

export const NewLotModal: React.FC<NewLotModalProps> = ({
  isOpen,
  onClose,
  onAddLot,
  coldRooms,
  vessels,
}) => {
  if (!isOpen) return null;

  const [category, setCategory] = useState<SpeciesCategory>("Céphalopodes");
  const [speciesName, setSpeciesName] = useState<string>("Poulpe Congelé en Bloc (Octopus vulgaris)");
  const [scientificName, setScientificName] = useState<string>("Octopus vulgaris");
  const [caliber, setCaliber] = useState<string>("T3 (1.2kg - 1.5kg)");
  const [packaging, setPackaging] = useState<PackagingType>("Carton 20kg (2 x 10kg)");
  const [freezingMethod, setFreezingMethod] = useState<FreezingMethod>("Bloc Surgelé (Plateaux)");
  const [unitWeightKg, setUnitWeightKg] = useState<number>(20);
  const [cartonCount, setCartonCount] = useState<number>(1000);
  const [coldRoomId, setColdRoomId] = useState<string>(coldRooms[0]?.id || "");
  const [vesselName, setVesselName] = useState<string>(vessels[0]?.name || "RIM-PECHE 03");
  const [fishingZone, setFishingZone] = useState<string>("ZEE Mauritanienne (Cap Blanc)");
  const [captureDate, setCaptureDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [freezingDate, setFreezingDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [onispaCertNumber, setOnispaCertNumber] = useState<string>(
    `ONISPA-RIM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [qualityGrade, setQualityGrade] = useState<"Extra Export Japon" | "Catégorie A (UE)" | "Standard Régional" | "Industriel">("Catégorie A (UE)");
  const [unitPriceMRU, setUnitPriceMRU] = useState<number>(450);
  const [unitPriceEUR, setUnitPriceEUR] = useState<number>(10.2);
  const [unitPriceUSD, setUnitPriceUSD] = useState<number>(11.0);
  const [notes, setNotes] = useState<string>("Débarquement frais, température à cœur -22°C.");

  const totalKg = cartonCount * unitWeightKg;
  const totalTonnes = totalKg / 1000;

  const handleSpeciesPresetChange = (name: string) => {
    setSpeciesName(name);
    if (name.includes("Poulpe")) {
      setCategory("Céphalopodes");
      setScientificName("Octopus vulgaris");
      setCaliber("T3 (1.2kg - 1.5kg)");
      setPackaging("Carton 20kg (2 x 10kg)");
      setUnitWeightKg(20);
      setUnitPriceMRU(450);
      setUnitPriceEUR(10.2);
    } else if (name.includes("Calmar")) {
      setCategory("Céphalopodes");
      setScientificName("Loligo vulgaris");
      setCaliber("20-25 cm");
      setPackaging("Carton 24kg");
      setUnitWeightKg(24);
      setUnitPriceMRU(380);
      setUnitPriceEUR(8.6);
    } else if (name.includes("Sardinelle")) {
      setCategory("Pélagiques");
      setScientificName("Sardinella aurita");
      setCaliber("18-22 cm");
      setPackaging("Carton 20kg (2 x 10kg)");
      setUnitWeightKg(20);
      setUnitPriceMRU(42);
      setUnitPriceEUR(0.95);
    } else if (name.includes("Thiof") || name.includes("Mérou")) {
      setCategory("Démersaux / Poissons Nobles");
      setScientificName("Epinephelus aeneus");
      setCaliber("2 - 4 kg");
      setPackaging("Carton 15kg");
      setUnitWeightKg(15);
      setUnitPriceMRU(520);
      setUnitPriceEUR(11.8);
    } else if (name.includes("Farine")) {
      setCategory("Farine & Huile de Poisson");
      setScientificName("Fishmeal 68% Protein");
      setCaliber("68% Protéines Brutes");
      setPackaging("Sac tissé 50kg");
      setUnitWeightKg(50);
      setUnitPriceMRU(65);
      setUnitPriceEUR(1.48);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedColdRoomObj = coldRooms.find((r) => r.id === coldRoomId) || coldRooms[0];
    const selectedVesselObj = vessels.find((v) => v.name === vesselName);

    const expiryDateObj = new Date(freezingDate);
    expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 2); // 24 mois DDM

    const newStockItem: StockItem = {
      id: `stk-${Date.now()}`,
      sku: `MP-${speciesName.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      lotNumber: generateLotNumber(category, speciesName),
      speciesName,
      scientificName,
      category,
      caliber,
      freezingMethod,
      packaging,
      unitWeightKg,
      cartonCount,
      totalWeightKg: totalKg,
      totalWeightTonnes: totalTonnes,
      coldRoomId: selectedColdRoomObj.id,
      coldRoomName: selectedColdRoomObj.name,
      vesselName,
      vesselRegistration: selectedVesselObj?.matricule || "RIM-NDB-1000",
      fishingZone,
      captureDate,
      freezingDate,
      expiryDate: expiryDateObj.toISOString().slice(0, 10),
      onispaCertNumber,
      qualityGrade,
      unitPriceMRUPerKg: unitPriceMRU,
      unitPriceEURPerKg: unitPriceEUR,
      unitPriceUSDPerKg: unitPriceUSD,
      status: "DISPONIBLE",
      notes,
      updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    };

    onAddLot(newStockItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Réception Débarquement & Nouveau Lot
            </h2>
            <p className="text-xs text-slate-500">
              Enregistrement d'un lot halieutique pesé au quai de Nouadhibou / Nouakchott
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Quick Species Preset Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Espèce / Produit
            </label>
            <select
              value={speciesName}
              onChange={(e) => handleSpeciesPresetChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Poulpe Congelé en Bloc (Octopus vulgaris)">Poulpe Congelé en Bloc (Octopus vulgaris)</option>
              <option value="Calmar National Entier (Loligo vulgaris)">Calmar National Entier (Loligo vulgaris)</option>
              <option value="Seiche Entière Non Nettoyée (Sepia officinalis)">Seiche Entière Non Nettoyée (Sepia officinalis)</option>
              <option value="Sardinelle Ronde Congelée en Bloc (Sardinella aurita)">Sardinelle Ronde Congelée en Bloc (Sardinella aurita)</option>
              <option value="Chinchard du Cap Blanc (Trachurus trachurus)">Chinchard du Cap Blanc (Trachurus trachurus)</option>
              <option value="Maquereau Espagnol (Scomber colias)">Maquereau Espagnol (Scomber colias)</option>
              <option value="Mérou Blanc / Thiof Entier (Epinephelus aeneus)">Mérou Blanc / Thiof Entier (Epinephelus aeneus)</option>
              <option value="Sole Tigrée Surgelée IQF (Solea senegalensis)">Sole Tigrée Surgelée IQF (Solea senegalensis)</option>
              <option value="Langouste Rose Royale (Palinurus mauritanicus)">Langouste Rose Royale (Palinurus mauritanicus)</option>
              <option value="Farine de Poisson Super Prime 68%">Farine de Poisson Super Prime 68%</option>
              <option value="Huile de Poisson Brute Raffinée Omega-3">Huile de Poisson Brute Raffinée Omega-3</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SpeciesCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              >
                <option value="Céphalopodes">Céphalopodes</option>
                <option value="Pélagiques">Pélagiques</option>
                <option value="Démersaux / Poissons Nobles">Démersaux / Poissons Nobles</option>
                <option value="Farine & Huile de Poisson">Farine & Huile de Poisson</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Calibre / Grade</label>
              <input
                type="text"
                value={caliber}
                onChange={(e) => setCaliber(e.target.value)}
                placeholder="ex: T3 (1.2-1.5kg)"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Conditionnement</label>
              <select
                value={packaging}
                onChange={(e) => setPackaging(e.target.value as PackagingType)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              >
                <option value="Carton 20kg (2 x 10kg)">Carton 20kg (2 x 10kg)</option>
                <option value="Carton 24kg">Carton 24kg</option>
                <option value="Carton 15kg">Carton 15kg</option>
                <option value="Carton 10kg">Carton 10kg</option>
                <option value="Sac tissé 50kg">Sac tissé 50kg</option>
                <option value="Fût métallique 200L">Fût métallique 200L</option>
              </select>
            </div>
          </div>

          {/* Quantities & Calculated Weights */}
          <div className="p-4 bg-cyan-50/60 rounded-2xl border border-cyan-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-cyan-950 mb-1">Nombre d'unités (Cartons / Sacs)</label>
              <input
                type="number"
                min="1"
                value={cartonCount}
                onChange={(e) => setCartonCount(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-cyan-300 rounded-xl font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-cyan-950 mb-1">Poids Unitaire (kg)</label>
              <input
                type="number"
                min="1"
                value={unitWeightKg}
                onChange={(e) => setUnitWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-cyan-300 rounded-xl font-bold text-slate-900"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-cyan-950 mb-1">Tonnage Calculé</label>
              <div className="px-3 py-2 bg-cyan-900 text-white rounded-xl font-extrabold text-sm flex items-center justify-between">
                <span>{totalTonnes.toFixed(2)} Tonnes</span>
                <span className="text-[10px] text-cyan-200 font-normal">({totalKg.toLocaleString()} kg)</span>
              </div>
            </div>
          </div>

          {/* Logistics: Cold Room & Vessel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chambre Froide de Stockage</label>
              <select
                value={coldRoomId}
                onChange={(e) => setColdRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              >
                {coldRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.currentTempCelsius}°C)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Navire de Pêche</label>
              <select
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              >
                {vessels.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.matricule} • {v.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & ONISPA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date Débarquement</label>
              <input
                type="date"
                value={captureDate}
                onChange={(e) => setCaptureDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Certificat ONISPA</label>
              <input
                type="text"
                value={onispaCertNumber}
                onChange={(e) => setOnispaCertNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Prix Estimé (MRU / kg)</label>
              <input
                type="number"
                value={unitPriceMRU}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setUnitPriceMRU(val);
                  setUnitPriceEUR(Math.round((val / 44) * 100) / 100);
                  setUnitPriceUSD(Math.round((val / 40) * 100) / 100);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-sm flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Valider l'Entrée en Stock</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
