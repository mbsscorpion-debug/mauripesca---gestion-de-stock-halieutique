import React, { useState, useEffect } from "react";
import { 
  StockMovement, 
  StockItem, 
  ColdRoom, 
  MovementType 
} from "../../types";
import { 
  formatMRU, 
  formatTonnes, 
  formatKg, 
  generateMovementRef 
} from "../../utils/formatters";
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Truck, 
  Ship, 
  Check, 
  Layers 
} from "lucide-react";

interface NewMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItems: StockItem[];
  coldRooms: ColdRoom[];
  preselectedLot?: StockItem | null;
  onSaveMovement: (movement: StockMovement, updatedStockItem?: StockItem) => void;
}

export const NewMovementModal: React.FC<NewMovementModalProps> = ({
  isOpen,
  onClose,
  stockItems,
  coldRooms,
  preselectedLot,
  onSaveMovement,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<MovementType>("SORTIE_EXPORT");
  const [selectedStockId, setSelectedStockId] = useState<string>(
    preselectedLot?.id || stockItems[0]?.id || ""
  );

  const selectedLot = stockItems.find((s) => s.id === selectedStockId) || stockItems[0];

  const [cartonsToMove, setCartonsToMove] = useState<number>(
    selectedLot ? Math.min(500, selectedLot.cartonCount) : 100
  );
  
  // Export specific fields
  const [clientName, setClientName] = useState<string>("Nippon Suisan Kaisha Ltd (Tokyo, Japon)");
  const [containerNumber, setContainerNumber] = useState<string>("MSCU-748291-3 (Reefer 40ft High-Cube)");
  const [sealNumber, setSealNumber] = useState<string>("RIM-DOUANE-98124");
  const [carrierVessel, setCarrierVessel] = useState<string>("MSC MAURITANIA VOY 204");
  
  // Transfer specific fields
  const [targetColdRoomId, setTargetColdRoomId] = useState<string>(
    coldRooms.find((r) => r.id !== selectedLot?.coldRoomId)?.id || coldRooms[0]?.id || ""
  );
  
  const [operatorName, setOperatorName] = useState<string>("Mohamed Lemine (Chef Quai)");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (preselectedLot) {
      setSelectedStockId(preselectedLot.id);
      setCartonsToMove(Math.min(500, preselectedLot.cartonCount));
    }
  }, [preselectedLot]);

  if (!selectedLot) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
        <div className="bg-white p-6 rounded-2xl max-w-sm text-center">
          <p className="text-sm font-bold text-slate-800">Aucun lot disponible en stock.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs rounded-xl">
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const unitWeight = selectedLot.unitWeightKg;
  const weightKg = cartonsToMove * unitWeight;
  const weightTonnes = weightKg / 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cartonsToMove <= 0) {
      alert("Le nombre de cartons doit être supérieur à zéro.");
      return;
    }

    if (type === "SORTIE_EXPORT" || type === "SORTIE_VENTE_LOCALE") {
      if (cartonsToMove > selectedLot.cartonCount) {
        alert(`Stock insuffisant. Il ne reste que ${selectedLot.cartonCount} cartons dans ce lot.`);
        return;
      }
    }

    let fromLoc = selectedLot.coldRoomName;
    let toLoc = "";

    if (type === "SORTIE_EXPORT") {
      toLoc = `Conteneur Reefer ${containerNumber.split(" ")[0]} (${clientName.split(" ")[0]})`;
    } else if (type === "SORTIE_VENTE_LOCALE") {
      toLoc = "Marché Local / Usine de Transformation";
    } else if (type === "TRANSFERT_CHAMBRE_FROIDE") {
      const targetRoom = coldRooms.find((r) => r.id === targetColdRoomId);
      toLoc = targetRoom ? targetRoom.name : "Chambre Froide Destination";
    } else {
      fromLoc = "Quai de Débarquement";
      toLoc = selectedLot.coldRoomName;
    }

    const newMovement: StockMovement = {
      id: `mvt-${Date.now()}`,
      reference: generateMovementRef(type),
      date: new Date().toISOString().slice(0, 10),
      type,
      stockItemId: selectedLot.id,
      lotNumber: selectedLot.lotNumber,
      productName: selectedLot.speciesName,
      cartonCount: cartonsToMove,
      weightKg,
      weightTonnes,
      fromLocation: fromLoc,
      toLocation: toLoc,
      containerNumber: type === "SORTIE_EXPORT" ? containerNumber : undefined,
      sealNumber: type === "SORTIE_EXPORT" ? sealNumber : undefined,
      clientOrDestination: type === "SORTIE_EXPORT" ? clientName : undefined,
      vesselOrSupplier: type === "SORTIE_EXPORT" ? carrierVessel : selectedLot.vesselName,
      operatorName,
      notes: notes || `Mouvement opéré le ${new Date().toLocaleDateString("fr-FR")}`,
    };

    // Calculate updated stock item
    let updatedItem: StockItem | undefined = undefined;

    if (type === "SORTIE_EXPORT" || type === "SORTIE_VENTE_LOCALE") {
      const remainingCartons = selectedLot.cartonCount - cartonsToMove;
      const remainingKg = remainingCartons * unitWeight;
      const remainingTonnes = remainingKg / 1000;

      updatedItem = {
        ...selectedLot,
        cartonCount: remainingCartons,
        totalWeightKg: remainingKg,
        totalWeightTonnes: remainingTonnes,
        status: remainingCartons === 0 ? "EPUISE" : selectedLot.status,
        updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      };
    } else if (type === "TRANSFERT_CHAMBRE_FROIDE") {
      const targetRoom = coldRooms.find((r) => r.id === targetColdRoomId);
      if (targetRoom) {
        updatedItem = {
          ...selectedLot,
          coldRoomId: targetRoom.id,
          coldRoomName: targetRoom.name,
          updatedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        };
      }
    }

    onSaveMovement(newMovement, updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        
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
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Enregistrer une Opération de Stock
            </h2>
            <p className="text-xs text-slate-500">
              Sortie conteneur Reefer export, transfert inter-frigo ou vente locale
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Movement Type Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Type d'Opération
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType("SORTIE_EXPORT")}
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  type === "SORTIE_EXPORT"
                    ? "bg-blue-900 text-white border-blue-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-blue-400" />
                <span className="font-bold">Sortie Export Reefer</span>
              </button>

              <button
                type="button"
                onClick={() => setType("TRANSFERT_CHAMBRE_FROIDE")}
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  type === "TRANSFERT_CHAMBRE_FROIDE"
                    ? "bg-purple-900 text-white border-purple-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <span className="font-bold">Transfert Frigo</span>
              </button>

              <button
                type="button"
                onClick={() => setType("SORTIE_VENTE_LOCALE")}
                className={`p-3 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  type === "SORTIE_VENTE_LOCALE"
                    ? "bg-amber-900 text-white border-amber-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Truck className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Vente Locale</span>
              </button>
            </div>
          </div>

          {/* Lot Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Lot Source en Stock
            </label>
            <select
              value={selectedStockId}
              onChange={(e) => {
                setSelectedStockId(e.target.value);
                const item = stockItems.find((s) => s.id === e.target.value);
                if (item) setCartonsToMove(Math.min(cartonsToMove, item.cartonCount));
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-cyan-500"
            >
              {stockItems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.lotNumber} — {s.speciesName} ({s.caliber}) — {s.cartonCount} cartons ({formatTonnes(s.totalWeightTonnes)}) dans {s.coldRoomName}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity To Move */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Cartons à Déplacer / Sortir
              </label>
              <input
                type="number"
                min="1"
                max={selectedLot.cartonCount}
                value={cartonsToMove}
                onChange={(e) => setCartonsToMove(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-extrabold text-slate-900 text-sm"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Dispo: {selectedLot.cartonCount.toLocaleString()} cartons
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Poids Unitaire
              </label>
              <div className="px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-slate-700">
                {unitWeight} kg / unité
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tonnage Mouvement
              </label>
              <div className="px-3 py-2 bg-slate-900 text-cyan-400 rounded-xl font-mono font-extrabold text-sm flex items-center justify-between">
                <span>{weightTonnes.toFixed(2)} T</span>
                <span className="text-[10px] text-slate-300 font-normal">({weightKg.toLocaleString()} kg)</span>
              </div>
            </div>
          </div>

          {/* Conditional Fields for SORTIE_EXPORT */}
          {type === "SORTIE_EXPORT" && (
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
              <span className="text-xs font-bold text-blue-950 block">Détails Empotage Reefer Export</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-blue-900 mb-1">Client Acheteur & Pays</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-blue-900 mb-1">N° Conteneur Reefer</label>
                  <input
                    type="text"
                    value={containerNumber}
                    onChange={(e) => setContainerNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-blue-900 mb-1">N° Plomb Douanier / Scellé</label>
                  <input
                    type="text"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-slate-900 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-blue-900 mb-1">Navire Transporteur Maritime</label>
                  <input
                    type="text"
                    value={carrierVessel}
                    onChange={(e) => setCarrierVessel(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conditional Fields for TRANSFERT */}
          {type === "TRANSFERT_CHAMBRE_FROIDE" && (
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
              <label className="block font-bold text-purple-950 mb-1">Chambre Froide de Destination</label>
              <select
                value={targetColdRoomId}
                onChange={(e) => setTargetColdRoomId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 font-bold"
              >
                {coldRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.location} • {r.currentTempCelsius}°C)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Operator Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Opérateur / Pointeur Quai</label>
            <input
              type="text"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900"
              required
            />
          </div>

          {/* Submit */}
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
              <Check className="w-4 h-4" />
              <span>Valider le Mouvement</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
