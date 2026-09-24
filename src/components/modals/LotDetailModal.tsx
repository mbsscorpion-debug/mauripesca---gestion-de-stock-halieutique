import React from "react";
import { StockItem } from "../../types";
import { 
  formatEUR, 
  formatMRU, 
  formatUSD, 
  formatTonnes, 
  formatKg, 
  getCategoryBadgeClass, 
  getStatusBadgeClass, 
  getStatusLabel 
} from "../../utils/formatters";
import { 
  X, 
  Ship, 
  ShieldCheck, 
  ThermometerSnowflake, 
  Printer, 
  ArrowUpRight, 
  Trash2, 
  Calendar, 
  MapPin, 
  QrCode,
  Anchor
} from "lucide-react";

interface LotDetailModalProps {
  lot: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintLabel: (lot: StockItem) => void;
  onOpenMovement: (lot: StockItem) => void;
  onDeleteLot: (lotId: string) => void;
  activeCurrency: "MRU" | "EUR" | "USD";
}

export const LotDetailModal: React.FC<LotDetailModalProps> = ({
  lot,
  isOpen,
  onClose,
  onPrintLabel,
  onOpenMovement,
  onDeleteLot,
  activeCurrency,
}) => {
  if (!isOpen || !lot) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 text-slate-800">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-black text-sm bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200">
              {lot.lotNumber}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(lot.status)}`}>
              {getStatusLabel(lot.status)}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(lot.category)}`}>
              {lot.category}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {lot.speciesName}
          </h2>
          <p className="text-xs text-slate-500 italic">
            {lot.scientificName} • Calibre : <strong>{lot.caliber}</strong>
          </p>
        </div>

        {/* 3 Main Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
          <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100">
            <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider block">Volume en Stock</span>
            <span className="text-xl font-black text-cyan-950 mt-1 block">
              {formatTonnes(lot.totalWeightTonnes)}
            </span>
            <span className="text-[11px] text-cyan-700 font-medium">
              {lot.cartonCount.toLocaleString()} cartons ({formatKg(lot.totalWeightKg)})
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chambre Froide</span>
            <span className="text-sm font-extrabold text-slate-900 mt-1 block flex items-center space-x-1">
              <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />
              <span className="truncate">{lot.coldRoomName}</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Stockage à -25°C
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Valeur Marchande</span>
            <span className="text-lg font-black text-emerald-950 mt-1 block">
              {activeCurrency === "EUR"
                ? formatEUR(lot.totalWeightKg * lot.unitPriceEURPerKg)
                : activeCurrency === "USD"
                ? formatUSD(lot.totalWeightKg * lot.unitPriceUSDPerKg)
                : formatMRU(lot.totalWeightKg * lot.unitPriceMRUPerKg)}
            </span>
            <span className="text-[11px] text-emerald-700">
              {activeCurrency === "EUR"
                ? `${formatEUR(lot.unitPriceEURPerKg)}/kg`
                : `${formatMRU(lot.unitPriceMRUPerKg)}/kg`}
            </span>
          </div>
        </div>

        {/* Detailed Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          
          {/* Origin & Capture */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Ship className="w-4 h-4 text-slate-600" />
              <span>Origine & Capture en Mer</span>
            </h3>
            <div className="space-y-1 text-slate-600 text-[11px]">
              <p>Navire : <strong>{lot.vesselName}</strong></p>
              <p>Matricule RIM : {lot.vesselRegistration}</p>
              <p>Zone : {lot.fishingZone}</p>
              <p>Date de capture : {lot.captureDate}</p>
            </div>
          </div>

          {/* Health & Quality */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Contrôle Sanitaire ONISPA</span>
            </h3>
            <div className="space-y-1 text-slate-600 text-[11px]">
              <p>N° Certificat : <strong className="font-mono text-emerald-700">{lot.onispaCertNumber}</strong></p>
              <p>Grade : <strong>{lot.qualityGrade}</strong></p>
              <p>Conditionnement : {lot.packaging}</p>
              <p>Date congélation : {lot.freezingDate}</p>
              <p>Date limite (DDM) : {lot.expiryDate}</p>
            </div>
          </div>

        </div>

        {/* Actions Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirm(`Confirmez-vous la suppression du lot ${lot.lotNumber} ?`)) {
                onDeleteLot(lot.id);
                onClose();
              }
            }}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer le lot</span>
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => {
                onPrintLabel(lot);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimer Étiquette</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenMovement(lot);
              }}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Sortie Export Reefer</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
