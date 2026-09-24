import React from "react";
import { StockItem } from "../../types";
import { 
  X, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Anchor, 
  ThermometerSnowflake 
} from "lucide-react";

interface PrintLabelModalProps {
  lot: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({
  lot,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !lot) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 text-slate-900">
        
        {/* Close Button (Hidden on Print) */}
        <button
          onClick={onClose}
          className="print:hidden absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="print:hidden flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Aperçu Étiquette Carton / Palette Export
            </h2>
            <p className="text-xs text-slate-500">
              Format standard conforme aux normes d'étiquetage FAO & Union Européenne
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer</span>
          </button>
        </div>

        {/* Printable Label Box */}
        <div className="border-4 border-slate-900 rounded-2xl p-6 bg-white space-y-4 font-sans text-xs">
          
          {/* Top Label Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black">
                <Anchor className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-wider text-slate-900">MAURIPESCA S.A.</h1>
                <p className="text-[10px] font-bold text-slate-600 uppercase">NOUADHIBOU • MAURITANIE</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] font-mono text-slate-500 block">AGRÉMENT SANITAIRE :</span>
              <span className="text-xs font-mono font-black text-slate-900">RIM-NDB-USINE-014</span>
            </div>
          </div>

          {/* Product Big Title & Caliber */}
          <div className="text-center py-2 bg-slate-100 rounded-lg border border-slate-300">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
              {lot.speciesName}
            </h2>
            <p className="text-xs font-bold text-slate-600 italic mt-0.5">
              {lot.scientificName}
            </p>
          </div>

          {/* Caliber & Net Weight Big Callout */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2.5 border-2 border-slate-900 rounded-xl bg-slate-50">
              <span className="text-[10px] font-black text-slate-500 uppercase block">CALIBRE / GRADE</span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">{lot.caliber}</span>
            </div>
            <div className="p-2.5 border-2 border-slate-900 rounded-xl bg-slate-50">
              <span className="text-[10px] font-black text-slate-500 uppercase block">POIDS NET / CARTON</span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">{lot.unitWeightKg} KG</span>
            </div>
          </div>

          {/* Traceability Grid */}
          <div className="grid grid-cols-2 gap-2 text-[11px] border border-slate-300 rounded-xl p-3 bg-slate-50/50">
            <div>
              <span className="font-bold text-slate-500 text-[9px] uppercase block">NUMÉRO DE LOT :</span>
              <span className="font-mono font-black text-slate-900 text-xs">{lot.lotNumber}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 text-[9px] uppercase block">NAVIRE DE CAPTURE :</span>
              <span className="font-bold text-slate-900">{lot.vesselName} ({lot.vesselRegistration})</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 text-[9px] uppercase block">ZONE DE PÊCHE :</span>
              <span className="font-medium text-slate-800">{lot.fishingZone}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 text-[9px] uppercase block">DATE CONGÉLATION :</span>
              <span className="font-mono font-bold text-slate-900">{lot.freezingDate}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 text-[9px] uppercase block">DATE LIMITE (DDM) :</span>
              <span className="font-mono font-bold text-slate-900">{lot.expiryDate}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500 text-[9px] uppercase block">CERTIFICAT ONISPA :</span>
              <span className="font-mono font-bold text-emerald-800">{lot.onispaCertNumber}</span>
            </div>
          </div>

          {/* Barcode & Storage Instructions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-300">
            <div>
              {/* Simulated barcode */}
              <div className="font-mono text-[9px] text-slate-500 mb-0.5">EAN-13 / GS1-128 :</div>
              <div className="h-9 w-40 flex items-center space-x-0.5 bg-white p-1 border border-slate-300">
                <div className="w-1 bg-black h-full"></div>
                <div className="w-0.5 bg-black h-full"></div>
                <div className="w-1.5 bg-black h-full"></div>
                <div className="w-0.5 bg-black h-full"></div>
                <div className="w-2 bg-black h-full"></div>
                <div className="w-0.5 bg-black h-full"></div>
                <div className="w-1 bg-black h-full"></div>
                <div className="w-1.5 bg-black h-full"></div>
                <div className="w-0.5 bg-black h-full"></div>
                <div className="w-2 bg-black h-full"></div>
                <div className="w-1 bg-black h-full"></div>
                <div className="w-0.5 bg-black h-full"></div>
                <div className="w-1.5 bg-black h-full"></div>
                <div className="w-2 bg-black h-full"></div>
              </div>
              <span className="text-[9px] font-mono text-slate-600 block mt-0.5">614 1092 84920 3</span>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end space-x-1 text-slate-900 font-black text-xs">
                <ThermometerSnowflake className="w-4 h-4 text-cyan-700" />
                <span>STOCKER À -18°C / -25°C</span>
              </div>
              <span className="text-[9px] text-slate-500 uppercase block mt-0.5">
                NE JAMAIS RECONGELER UN PRODUIT DÉCONGELÉ
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
