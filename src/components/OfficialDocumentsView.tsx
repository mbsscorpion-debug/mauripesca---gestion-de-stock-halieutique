import React, { useState } from "react";
import { 
  ExportPackingList, 
  StockItem 
} from "../types";
import { 
  formatEUR, 
  formatMRU, 
  formatUSD, 
  formatTonnes, 
  formatKg 
} from "../utils/formatters";
import { 
  Printer, 
  FileText, 
  Download, 
  Ship, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Anchor, 
  Sparkles,
  Building,
  Plus
} from "lucide-react";

interface OfficialDocumentsViewProps {
  packingLists?: ExportPackingList[];
  stockItems?: StockItem[];
  activeCurrency?: "MRU" | "EUR" | "USD";
  onSelectLot?: (lot: StockItem) => void;
}

export const OfficialDocumentsView: React.FC<OfficialDocumentsViewProps> = ({
  packingLists = [],
  stockItems = [],
  activeCurrency = "MRU",
  onSelectLot,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(packingLists[0]?.id || "landing-cert");
  const [docType, setDocType] = useState<"PACKING_LIST" | "BON_DEBARQUEMENT" | "FACTURE_PROFORMA">("PACKING_LIST");

  const currentPackingList = (packingLists || []).find((p) => p.id === selectedDocId) || packingLists[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Bar / Controls (hidden when printing) */}
      <div className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-cyan-600" />
            <span>Édition & Impression des Documents Réglementaires</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bons Officiels & Packing Lists Export
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Documents conformes aux exigences de l'ONISPA, des Douanes Mauritaniennes et des normes internationales d'exportation maritime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Doc Type Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-700">
            <button
              onClick={() => setDocType("PACKING_LIST")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                docType === "PACKING_LIST" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Packing List Reefer
            </button>
            <button
              onClick={() => setDocType("BON_DEBARQUEMENT")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                docType === "BON_DEBARQUEMENT" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Bon Réception Navire
            </button>
            <button
              onClick={() => setDocType("FACTURE_PROFORMA")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                docType === "FACTURE_PROFORMA" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Facture Proforma
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>

      {/* Selector of specific dossier */}
      {docType === "PACKING_LIST" && (
        <div className="print:hidden flex items-center space-x-3 overflow-x-auto pb-1">
          {packingLists.map((pkl) => (
            <button
              key={pkl.id}
              onClick={() => setSelectedDocId(pkl.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedDocId === pkl.id
                  ? "bg-cyan-900 text-white border-cyan-800 shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{pkl.reference}</span>
              <span className="ml-2 text-[10px] text-cyan-400 font-normal">({pkl.clientCountry})</span>
            </button>
          ))}
        </div>
      )}

      {/* The Printable Official Document Paper Container */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 sm:p-12 max-w-4xl mx-auto text-slate-900 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
        
        {/* Document Header (MAURIPESCA Official Letterhead) */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex justify-between items-start">
            
            {/* Logo & Company info */}
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <Anchor className="w-7 h-7 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-wider text-slate-900">
                    MAURIPESCA S.A.
                  </h1>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
                    Société Mauritanienne de Pêche, Congélation & Exportation
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 mt-3 space-y-0.5">
                <p>Port Frigorifique et Zone Industrielle B.P. 248, Nouadhibou, Mauritanie</p>
                <p>NIF : 00892401 • Registre de Commerce RC N° : 4192/NDB</p>
                <p>Agréments Sanitaires ONISPA N° : RIM-NDB-USINE-014 / UE-AGREEMENT-2026</p>
              </div>
            </div>

            {/* Document Title Badge & QR Code */}
            <div className="text-right flex flex-col items-end">
              <div className="w-16 h-16 border border-slate-300 rounded-lg p-1 bg-slate-50 flex flex-col items-center justify-center text-center">
                <QrCode className="w-10 h-10 text-slate-800" />
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">ONISPA-OK</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1">
                Date : {new Date().toLocaleDateString("fr-FR")}
              </span>
            </div>

          </div>
        </div>

        {/* Dynamic Document Content */}
        {docType === "PACKING_LIST" && currentPackingList && (
          <div className="space-y-6">
            
            {/* Document Title */}
            <div className="bg-slate-100 p-3 rounded-lg text-center border border-slate-300">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                PACKING LIST D'EXPÉDITION MARITIME (REEFER CONTAINER)
              </h2>
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                RÉFÉRENCE : {currentPackingList.reference} • DATE : {currentPackingList.exportDate}
              </p>
            </div>

            {/* Logistic & Client Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="space-y-1.5">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">DESTINATAIRE / CLIENT :</span>
                  <span className="font-extrabold text-slate-900 text-sm">{currentPackingList.clientName}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">PAYS & PORT DE DÉCHARGEMENT :</span>
                  <span className="font-semibold text-slate-800">{currentPackingList.clientCountry} • {currentPackingList.destinationPort}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">ORIGINE DES PRODUITS :</span>
                  <span className="font-semibold text-slate-800">Zone Économique Exclusive (ZEE) Mauritanie (FAO 34.1.3)</span>
                </div>
              </div>

              <div className="space-y-1.5 border-l border-slate-200 pl-4">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">N° CONTENEUR FRIGORIFIQUE (REEFER) :</span>
                  <span className="font-mono font-extrabold text-slate-900">{currentPackingList.containerNumber}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">N° DE PLOMB / SCELLÉ DOUANIER :</span>
                  <span className="font-mono font-bold text-slate-800">{currentPackingList.sealNumber}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">NAVIRE TRANSPORTEUR / TEMPÉRATURE :</span>
                  <span className="font-semibold text-slate-800">{currentPackingList.vesselCarrier} • Consigne : {currentPackingList.temperatureSet}</span>
                </div>
              </div>
            </div>

            {/* Table of Lots & Packages */}
            <div>
              <table className="w-full text-xs text-left border border-slate-300">
                <thead className="bg-slate-200 text-slate-900 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2 border border-slate-300">N° Lot</th>
                    <th className="p-2 border border-slate-300">Désignation Espèce & Calibre</th>
                    <th className="p-2 border border-slate-300 text-center">Nbr Cartons</th>
                    <th className="p-2 border border-slate-300 text-right">Poids Net (kg)</th>
                    <th className="p-2 border border-slate-300 text-right">Poids Brut (kg)</th>
                    <th className="p-2 border border-slate-300 text-right">Prix/kg (€)</th>
                    <th className="p-2 border border-slate-300 text-right">Total (€)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 text-slate-800">
                  {currentPackingList.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2 border border-slate-300 font-mono font-bold">{item.lotNumber}</td>
                      <td className="p-2 border border-slate-300 font-medium">
                        <div>{item.species}</div>
                        <div className="text-[10px] text-slate-500 font-bold">Calibre : {item.caliber}</div>
                      </td>
                      <td className="p-2 border border-slate-300 text-center font-bold">{item.cartons.toLocaleString()}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">{item.netWeightKg.toLocaleString()}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">{item.grossWeightKg.toLocaleString()}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono">{formatEUR(item.pricePerKgEUR)}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold">{formatEUR(item.totalEUR)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-900">
                  <tr>
                    <td colSpan={2} className="p-2 border border-slate-300 uppercase text-right">TOTAUX EXPÉDITION :</td>
                    <td className="p-2 border border-slate-300 text-center font-extrabold">{currentPackingList.totalCartons.toLocaleString()} ctn</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-extrabold">{formatTonnes(currentPackingList.totalNetWeightTonnes)}</td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-extrabold">{formatTonnes(currentPackingList.totalGrossWeightTonnes)}</td>
                    <td className="p-2 border border-slate-300 text-right"></td>
                    <td className="p-2 border border-slate-300 text-right font-mono font-black text-cyan-900">
                      {formatEUR(currentPackingList.totalValueEUR)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Certifications & Declarations */}
            <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <p>
                <strong>Attestation de conformité sanitaire :</strong> Nous certifions que les produits halieutiques ci-dessus mentionnés ont été capturés conformément à la réglementation mauritanienne, inspectés par l'Office National d'Inspection Sanitaire des Produits de la Pêche et de l'Aquaculture (ONISPA - Réf : {currentPackingList.sanitaryCertRef}) et congelés selon les règles de l'art sans rupture de la chaîne du froid.
              </p>
            </div>

          </div>
        )}

        {/* BON DE DEBARQUEMENT NAVIRE */}
        {docType === "BON_DEBARQUEMENT" && (
          <div className="space-y-6">
            <div className="bg-slate-100 p-3 rounded-lg text-center border border-slate-300">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                BON DE RÉCEPTION & ATTESTATION DE PESÉE QUAI DÉBARQUEMENT
              </h2>
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                PORT DE PÊCHE DE NOUADHIBOU • POSTE QUAI OUEST N° 2
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">NAVIRE DE PÊCHE :</span>
                <span className="font-extrabold text-slate-900 text-sm">RIM-PECHE 03 (Matricule: RIM-NDB-1082)</span>
                <span className="text-slate-600 block mt-1">Capitaine : Mohamed Ould Cheikh</span>
              </div>
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">CHAMBRE FROIDE DESTINATION :</span>
                <span className="font-extrabold text-slate-900 text-sm">Chambre Froide A1 (-25°C)</span>
                <span className="text-slate-600 block mt-1">Température mesurée à cœur : -22.8°C (Conforme)</span>
              </div>
            </div>

            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-200 text-slate-900 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border border-slate-300">N° Lot Généré</th>
                  <th className="p-2 border border-slate-300">Espèce & Calibre</th>
                  <th className="p-2 border border-slate-300 text-center">Cartons</th>
                  <th className="p-2 border border-slate-300 text-right">Poids Net (kg)</th>
                  <th className="p-2 border border-slate-300 text-right">Tonnage Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-800">
                <tr>
                  <td className="p-2 border border-slate-300 font-mono font-bold">LOT-2026-NDB-PLP-084</td>
                  <td className="p-2 border border-slate-300">Poulpe Congelé en Bloc (Octopus vulgaris) - T3</td>
                  <td className="p-2 border border-slate-300 text-center font-bold">4 200</td>
                  <td className="p-2 border border-slate-300 text-right font-mono">84 000</td>
                  <td className="p-2 border border-slate-300 text-right font-mono font-bold">84.0 T</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* FACTURE PROFORMA EXPORT */}
        {docType === "FACTURE_PROFORMA" && currentPackingList && (
          <div className="space-y-6">
            <div className="bg-slate-100 p-3 rounded-lg text-center border border-slate-300">
              <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                FACTURE PROFORMA COMMERCIALE D'EXPORTATION
              </h2>
              <p className="text-xs font-mono text-slate-600 mt-0.5">
                INCOTERM : FOB PORT DE NOUADHIBOU • DEVISE : EURO (€)
              </p>
            </div>

            <div className="flex justify-between text-xs border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div>
                <span className="font-bold text-slate-500 uppercase text-[10px] block">CLIENT ACHETEUR :</span>
                <span className="font-extrabold text-slate-900 text-sm">{currentPackingList.clientName}</span>
                <span className="text-slate-600 block">{currentPackingList.destinationPort}, {currentPackingList.clientCountry}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">TOTAL À PAYER :</span>
                <span className="text-xl font-black text-cyan-900">{formatEUR(currentPackingList.totalValueEUR)}</span>
                <span className="text-[10px] text-slate-500 block">Équivalent : {formatMRU(currentPackingList.totalValueMRU)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Signatures & Official Seals */}
        <div className="mt-12 pt-8 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <span className="font-bold text-slate-800 uppercase block mb-1">Le Chef Frigoriste / Quai</span>
            <div className="h-16 flex items-center justify-center text-slate-400 italic text-[11px]">
              (Signature & Date)
            </div>
            <span className="text-[11px] text-slate-500">Sidi Mohamed Ould Cheikh</span>
          </div>

          <div>
            <span className="font-bold text-slate-800 uppercase block mb-1">Contrôle Qualité ONISPA</span>
            <div className="h-16 flex items-center justify-center">
              <div className="w-14 h-14 border-2 border-emerald-600 rounded-full flex flex-col items-center justify-center text-emerald-700 text-[8px] font-bold rotate-[-12deg]">
                <span>ONISPA</span>
                <span>CONFORME</span>
                <span>RIM-NDB</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500">Visa Vétérinaire Officiel</span>
          </div>

          <div>
            <span className="font-bold text-slate-800 uppercase block mb-1">Direction Générale MAURIPESCA</span>
            <div className="h-16 flex items-center justify-center">
              <div className="w-16 h-14 border-2 border-slate-900 rounded flex flex-col items-center justify-center text-slate-900 text-[8px] font-black rotate-[-5deg]">
                <span>MAURIPESCA S.A.</span>
                <span>DIRECTION EXPORT</span>
                <span>NOUADHIBOU</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-500">Cachet & Signature Agréée</span>
          </div>
        </div>

      </div>

    </div>
  );
};
