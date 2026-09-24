import React, { useState, useMemo } from "react";
import { 
  StockMovement, 
  MovementType, 
  StockItem 
} from "../types";
import { 
  formatMRU, 
  formatTonnes, 
  formatKg 
} from "../utils/formatters";
import { 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RefreshCw, 
  Plus, 
  Download, 
  Search, 
  Ship, 
  Truck, 
  FileText,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2
} from "lucide-react";

interface StockMovementsViewProps {
  movements?: StockMovement[];
  stockItems?: StockItem[];
  activeCurrency?: "MRU" | "EUR" | "USD";
  onOpenNewMovement?: () => void;
  onSelectLotById?: (lotId: string) => void;
}

export const StockMovementsView: React.FC<StockMovementsViewProps> = ({
  movements = [],
  stockItems = [],
  activeCurrency = "MRU",
  onOpenNewMovement,
  onSelectLotById,
}) => {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredMovements = useMemo(() => {
    return (movements || []).filter((m) => {
      const matchesType = filterType === "ALL" || m.type === filterType;
      const matchesSearch =
        searchQuery === "" ||
        m.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.containerNumber && m.containerNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.clientOrDestination && m.clientOrDestination.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.vesselOrSupplier && m.vesselOrSupplier.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [movements, filterType, searchQuery]);

  const totalTonnageIn = movements
    .filter((m) => m.type === "ENTREE_DEBARQUEMENT")
    .reduce((acc, m) => acc + m.weightTonnes, 0);

  const totalTonnageOut = movements
    .filter((m) => m.type === "SORTIE_EXPORT" || m.type === "SORTIE_VENTE_LOCALE")
    .reduce((acc, m) => acc + m.weightTonnes, 0);

  const getMovementTypeBadge = (type: MovementType) => {
    switch (type) {
      case "ENTREE_DEBARQUEMENT":
        return {
          label: "Entrée Débarquement",
          icon: ArrowDownLeft,
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "SORTIE_EXPORT":
        return {
          label: "Sortie Export Reefer",
          icon: ArrowUpRight,
          className: "bg-blue-50 text-blue-800 border-blue-200",
        };
      case "SORTIE_VENTE_LOCALE":
        return {
          label: "Sortie Vente Locale",
          icon: Truck,
          className: "bg-amber-50 text-amber-800 border-amber-200",
        };
      case "TRANSFERT_CHAMBRE_FROIDE":
        return {
          label: "Transfert Frigo",
          icon: RefreshCw,
          className: "bg-purple-50 text-purple-800 border-purple-200",
        };
      case "AJUSTEMENT_INVENTAIRE":
        return {
          label: "Ajustement",
          icon: ArrowLeftRight,
          className: "bg-slate-50 text-slate-800 border-slate-200",
        };
      default:
        return {
          label: type,
          icon: ArrowLeftRight,
          className: "bg-slate-50 text-slate-800 border-slate-200",
        };
    }
  };

  const exportCSV = () => {
    const headers = [
      "Référence",
      "Type",
      "Date",
      "Lot",
      "Produit",
      "Cartons",
      "Poids (Tonnes)",
      "Origine",
      "Destination",
      "Navire / Fournisseur",
      "Client / Destination",
      "N° Conteneur",
      "N° Plomb / Scellé",
      "Opérateur"
    ];

    const rows = filteredMovements.map((m) => [
      m.reference,
      m.type,
      m.date,
      m.lotNumber,
      `"${m.productName}"`,
      m.cartonCount,
      m.weightTonnes,
      `"${m.fromLocation}"`,
      `"${m.toLocation}"`,
      `"${m.vesselOrSupplier || ""}"`,
      `"${m.clientOrDestination || ""}"`,
      `"${m.containerNumber || ""}"`,
      `"${m.sealNumber || ""}"`,
      `"${m.operatorName}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MAURIPESCA_JOURNAL_MOUVEMENTS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Journal des Mouvements & Opérations</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold font-mono">
              {filteredMovements.length} opérations
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Traçabilité des entrées de débarquement, pesées quai, sorties en conteneurs Reefer et transferts inter-frigos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Journal CSV</span>
          </button>

          <button
            onClick={onOpenNewMovement}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer un Mouvement</span>
          </button>
        </div>
      </div>

      {/* Summary KPI stats for movements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Entrées Débarquements Cumulées
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-0.5 block">
              {formatTonnes(totalTonnageIn)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Sorties Export & Ventes Cumulées
            </span>
            <span className="text-2xl font-extrabold text-blue-700 mt-0.5 block">
              {formatTonnes(totalTonnageOut)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Solde Net Opérationnel
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
              {formatTonnes(totalTonnageIn - totalTonnageOut)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === "ALL"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tous ({movements.length})
          </button>
          
          <button
            onClick={() => setFilterType("ENTREE_DEBARQUEMENT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === "ENTREE_DEBARQUEMENT"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            🚢 Entrées Débarquements Navires
          </button>

          <button
            onClick={() => setFilterType("SORTIE_EXPORT")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === "SORTIE_EXPORT"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            📦 Sorties Export Conteneurs Reefer
          </button>

          <button
            onClick={() => setFilterType("TRANSFERT_CHAMBRE_FROIDE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === "TRANSFERT_CHAMBRE_FROIDE"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100"
            }`}
          >
            🔄 Transferts Inter-Frigos
          </button>

          <button
            onClick={() => setFilterType("SORTIE_VENTE_LOCALE")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === "SORTIE_VENTE_LOCALE"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            🚚 Ventes Locales
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par référence, lot, produit, conteneur, client, navire..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Réf & Date</th>
                <th className="py-3 px-4">Type d'Opération</th>
                <th className="py-3 px-4">Lot & Produit</th>
                <th className="py-3 px-4">Volume & Poids</th>
                <th className="py-3 px-4">Flux (Origine → Destination)</th>
                <th className="py-3 px-4">Détails Logistiques (Navire / Reefer)</th>
                <th className="py-3 px-4">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Aucun mouvement trouvé.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mvt) => {
                  const badge = getMovementTypeBadge(mvt.type);
                  const Icon = badge.icon;

                  return (
                    <tr key={mvt.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ref & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900 text-xs">
                          {mvt.reference}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {mvt.date}
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Lot & Product */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => onSelectLotById(mvt.stockItemId)}
                          className="font-bold text-slate-900 hover:text-cyan-700 cursor-pointer"
                        >
                          {mvt.productName}
                        </div>
                        <div className="font-mono text-[11px] text-cyan-800 mt-0.5">
                          {mvt.lotNumber}
                        </div>
                      </td>

                      {/* Volume & Weight */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formatTonnes(mvt.weightTonnes)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {mvt.cartonCount.toLocaleString()} cartons ({formatKg(mvt.weightKg)})
                        </div>
                      </td>

                      {/* Flow: From -> To */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium flex items-center space-x-1.5">
                          <span className="text-slate-500">{mvt.fromLocation}</span>
                          <span className="text-slate-300 font-bold">→</span>
                          <span className="text-slate-900 font-semibold">{mvt.toLocation}</span>
                        </div>
                      </td>

                      {/* Logistic details */}
                      <td className="py-3.5 px-4">
                        {mvt.containerNumber ? (
                          <div>
                            <div className="font-mono font-semibold text-slate-900 text-[11px]">
                              📦 {mvt.containerNumber}
                            </div>
                            {mvt.clientOrDestination && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Dest: {mvt.clientOrDestination}
                              </div>
                            )}
                            {mvt.sealNumber && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Plomb: {mvt.sealNumber}
                              </div>
                            )}
                          </div>
                        ) : mvt.vesselOrSupplier ? (
                          <div>
                            <div className="font-medium text-slate-900 flex items-center space-x-1">
                              <Ship className="w-3.5 h-3.5 text-slate-500" />
                              <span>{mvt.vesselOrSupplier}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Transfert interne</span>
                        )}
                      </td>

                      {/* Operator */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800">
                          {mvt.operatorName}
                        </div>
                        {mvt.notes && (
                          <div className="text-[10px] text-slate-400 italic truncate max-w-[150px]" title={mvt.notes}>
                            {mvt.notes}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
