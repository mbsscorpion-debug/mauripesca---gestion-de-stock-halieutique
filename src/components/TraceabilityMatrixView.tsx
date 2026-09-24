import React, { useState } from "react";
import { 
  StockItem, 
  StockMovement 
} from "../types";
import { 
  formatMRU, 
  formatTonnes, 
  formatKg, 
  getCategoryBadgeClass 
} from "../utils/formatters";
import { 
  SearchCode, 
  Ship, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Boxes, 
  ArrowRight, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  Anchor,
  FileText
} from "lucide-react";

interface TraceabilityMatrixViewProps {
  stockItems?: StockItem[];
  movements?: StockMovement[];
  selectedLot?: StockItem | null;
  onSelectLot?: (lot: StockItem) => void;
  onPrintLabel?: (lot: StockItem) => void;
}

export const TraceabilityMatrixView: React.FC<TraceabilityMatrixViewProps> = ({
  stockItems = [],
  movements = [],
  selectedLot = null,
  onSelectLot,
  onPrintLabel,
}) => {
  const [searchLotInput, setSearchLotInput] = useState<string>("");
  const activeItem = selectedLot || stockItems[0];

  const itemMovements = (movements || []).filter((m) => m.stockItemId === activeItem?.id);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = (stockItems || []).find(
      (item) =>
        item.lotNumber.toLowerCase().includes(searchLotInput.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchLotInput.toLowerCase()) ||
        item.onispaCertNumber.toLowerCase().includes(searchLotInput.toLowerCase())
    );
    if (found && onSelectLot) {
      onSelectLot(found);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <SearchCode className="w-4 h-4 text-cyan-600" />
            <span>Matrice de Traçabilité Halieutique & Sanitaire</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Traçabilité des Lots de Pêche (HACCP & ONISPA)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Généalogie complète : de la capture en mer jusqu'à l'empotage en conteneur frigorifique d'exportation.
          </p>
        </div>

        {/* Quick Search Form */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            value={searchLotInput}
            onChange={(e) => setSearchLotInput(e.target.value)}
            placeholder="Saisir N° Lot (ex: LOT-2026-NDB-PLP-084)..."
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-full sm:w-64"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Lot Quick Carousel Picker */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {stockItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectLot(item)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeItem?.id === item.id
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="font-mono font-bold">{item.lotNumber}</span>
            <span className="ml-2 text-[10px] text-slate-400 font-normal truncate">
              {item.speciesName.split(" ")[0]} ({item.caliber})
            </span>
          </button>
        ))}
      </div>

      {/* Traceability Detailed Visual Timeline Card */}
      {activeItem && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-8">
          
          {/* Lot Identity Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-black text-lg text-cyan-900 bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-200">
                  {activeItem.lotNumber}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getCategoryBadgeClass(activeItem.category)}`}>
                  {activeItem.category}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                {activeItem.speciesName}
              </h2>
              <p className="text-xs text-slate-500 italic">
                {activeItem.scientificName} • Calibre : <strong>{activeItem.caliber}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPrintLabel(activeItem)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Étiquette Traçabilité</span>
              </button>
            </div>
          </div>

          {/* 6-Step Visual Traceability Chain */}
          <div className="relative">
            
            {/* Timeline Vertical Guide Line on mobile, horizontal on large */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Step 1: Capture en Mer */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 relative">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Étape 1</span>
                    <h3 className="font-bold text-xs text-slate-900">Capture en Mer & Navire</h3>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p className="flex items-center space-x-1">
                    <Ship className="w-3.5 h-3.5 text-slate-500" />
                    <span>Navire : <strong>{activeItem.vesselName}</strong></span>
                  </p>
                  <p className="text-[11px] text-slate-500">Matricule : {activeItem.vesselRegistration}</p>
                  <p className="flex items-center space-x-1 text-[11px] text-slate-600">
                    <MapPin className="w-3 h-3 text-cyan-600" />
                    <span>{activeItem.fishingZone}</span>
                  </p>
                  <p className="flex items-center space-x-1 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Date de capture : {activeItem.captureDate}</span>
                  </p>
                </div>
              </div>

              {/* Step 2: Contrôle Sanitaire ONISPA */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Étape 2</span>
                    <h3 className="font-bold text-xs text-emerald-950">Contrôle Sanitaire ONISPA</h3>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-emerald-900">
                  <p className="flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Certificat : <strong>{activeItem.onispaCertNumber}</strong></span>
                  </p>
                  <p className="text-[11px]">Grade Qualité : <strong>{activeItem.qualityGrade}</strong></p>
                  <p className="text-[11px] text-emerald-700">Agrément Usine : RIM-NDB-USINE-014</p>
                  <p className="text-[11px] text-emerald-700">Conformité HACCP & Directive UE validées</p>
                </div>
              </div>

              {/* Step 3: Conditionnement & Calibrage */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Étape 3</span>
                    <h3 className="font-bold text-xs text-slate-900">Congélation & Conditionnement</h3>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p>Procédé : <strong>{activeItem.freezingMethod}</strong></p>
                  <p>Conditionnement : <strong>{activeItem.packaging}</strong></p>
                  <p className="text-[11px] text-slate-500">Date de congélation : {activeItem.freezingDate}</p>
                  <p className="text-[11px] text-slate-500">Date limite d'utilisation (DDM) : {activeItem.expiryDate}</p>
                </div>
              </div>

              {/* Step 4: Stockage Chambre Froide */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Étape 4</span>
                    <h3 className="font-bold text-xs text-slate-900">Entrepôt & Froid Continu</h3>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <p className="flex items-center space-x-1">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{activeItem.coldRoomName}</span>
                  </p>
                  <p>Tonnage en stock : <strong>{formatTonnes(activeItem.totalWeightTonnes)}</strong></p>
                  <p className="text-[11px] text-slate-500">Nombre de cartons : {activeItem.cartonCount.toLocaleString()}</p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Traçabilité thermique sans rupture</p>
                </div>
              </div>

              {/* Step 5: Mouvements & Opérations Associées */}
              <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Étape 5</span>
                    <h3 className="font-bold text-xs text-slate-900">Historique des Mouvements de ce Lot</h3>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {itemMovements.length === 0 ? (
                    <p className="text-slate-400 text-[11px] italic">
                      Aucun mouvement externe pour ce lot (lot en stock initial).
                    </p>
                  ) : (
                    itemMovements.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-slate-900">
                            {m.reference} • {m.type === "ENTREE_DEBARQUEMENT" ? "Débarquement quai" : m.type === "SORTIE_EXPORT" ? "Export conteneur" : "Transfert"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {m.fromLocation} → {m.toLocation} ({m.date})
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900">{formatTonnes(m.weightTonnes)}</span>
                          <span className="text-[10px] text-slate-500 block">{m.cartonCount} cartons</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
