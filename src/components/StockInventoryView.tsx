import React, { useState, useMemo } from "react";
import { 
  StockItem, 
  ColdRoom, 
  SpeciesCategory, 
  StockStatus 
} from "../types";
import { 
  formatMRU, 
  formatEUR, 
  formatUSD, 
  formatTonnes, 
  formatKg, 
  getCategoryBadgeClass,
  getStatusBadgeClass,
  getStatusLabel
} from "../utils/formatters";
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  QrCode, 
  Printer, 
  Eye, 
  ArrowUpRight, 
  Edit, 
  Trash2, 
  Layers, 
  CheckCircle2, 
  FileSpreadsheet,
  Grid,
  List,
  Ship,
  Sparkles,
  ThermometerSnowflake,
  ShieldCheck
} from "lucide-react";

interface StockInventoryViewProps {
  stockItems?: StockItem[];
  coldRooms?: ColdRoom[];
  activeCurrency?: "MRU" | "EUR" | "USD";
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onOpenNewLot?: () => void;
  onSelectLot?: (lot: StockItem) => void;
  onPrintLabel?: (lot: StockItem) => void;
  onOpenMovementForLot?: (lot: StockItem) => void;
  onDeleteLot?: (lotId: string) => void;
}

export const StockInventoryView: React.FC<StockInventoryViewProps> = ({
  stockItems = [],
  coldRooms = [],
  activeCurrency = "MRU",
  searchQuery = "",
  setSearchQuery,
  onOpenNewLot,
  onSelectLot,
  onPrintLabel,
  onOpenMovementForLot,
  onDeleteLot,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedColdRoom, setSelectedColdRoom] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Filtering
  const filteredItems = useMemo(() => {
    return (stockItems || []).filter((item) => {
      // Search
      const matchesSearch =
        searchQuery === "" ||
        item.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.speciesName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.caliber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.coldRoomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.onispaCertNumber.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;

      // Cold room
      const matchesColdRoom =
        selectedColdRoom === "ALL" || item.coldRoomId === selectedColdRoom;

      // Status
      const matchesStatus =
        selectedStatus === "ALL" || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesColdRoom && matchesStatus;
    });
  }, [stockItems, searchQuery, selectedCategory, selectedColdRoom, selectedStatus]);

  // Aggregate stats for filtered items
  const filteredTonnage = filteredItems.reduce((acc, i) => acc + i.totalWeightTonnes, 0);
  const filteredCartons = filteredItems.reduce((acc, i) => acc + i.cartonCount, 0);
  const filteredValueMRU = filteredItems.reduce((acc, i) => acc + i.totalWeightKg * i.unitPriceMRUPerKg, 0);
  const filteredValueEUR = filteredItems.reduce((acc, i) => acc + i.totalWeightKg * i.unitPriceEURPerKg, 0);
  const filteredValueUSD = filteredItems.reduce((acc, i) => acc + i.totalWeightKg * i.unitPriceUSDPerKg, 0);

  const formatPrice = (item: StockItem) => {
    if (activeCurrency === "EUR") return `${formatEUR(item.unitPriceEURPerKg)}/kg`;
    if (activeCurrency === "USD") return `${formatUSD(item.unitPriceUSDPerKg)}/kg`;
    return `${formatMRU(item.unitPriceMRUPerKg)}/kg`;
  };

  const formatTotalValue = (item: StockItem) => {
    if (activeCurrency === "EUR") return formatEUR(item.totalWeightKg * item.unitPriceEURPerKg);
    if (activeCurrency === "USD") return formatUSD(item.totalWeightKg * item.unitPriceUSDPerKg);
    return formatMRU(item.totalWeightKg * item.unitPriceMRUPerKg);
  };

  const exportCSV = () => {
    const headers = [
      "Numéro de Lot",
      "Espèce",
      "Nom Scientifique",
      "Catégorie",
      "Calibre",
      "Conditionnement",
      "Nombre Cartons",
      "Poids Unitaire (kg)",
      "Poids Total (Tonnes)",
      "Chambre Froide",
      "Navire",
      "Date Capture",
      "Date Congélation",
      "Certificat ONISPA",
      "Statut",
      "Prix MRU/kg",
      "Valeur Totale MRU"
    ];

    const rows = filteredItems.map((item) => [
      item.lotNumber,
      `"${item.speciesName}"`,
      `"${item.scientificName}"`,
      `"${item.category}"`,
      `"${item.caliber}"`,
      `"${item.packaging}"`,
      item.cartonCount,
      item.unitWeightKg,
      item.totalWeightTonnes,
      `"${item.coldRoomName}"`,
      `"${item.vesselName}"`,
      item.captureDate,
      item.freezingDate,
      item.onispaCertNumber,
      item.status,
      item.unitPriceMRUPerKg,
      item.totalWeightKg * item.unitPriceMRUPerKg
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MAURIPESCA_INVENTAIRE_STOCK_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header & Primary Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Inventaire Général des Stocks</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 font-semibold font-mono">
              {filteredItems.length} lots
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestion fine des lots halieutiques calibrés, traçabilité des débarquements et suivi des entrepôts frigorifiques.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* CSV Export */}
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Exporter l'inventaire en CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          {/* New Lot Modal */}
          <button
            onClick={onOpenNewLot}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Débarquement / Lot</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        
        {/* Category Pills Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Toutes Espèces ({stockItems.length})
          </button>
          
          <button
            onClick={() => setSelectedCategory("Céphalopodes")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "Céphalopodes"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            🐙 Céphalopodes (Poulpe, Calmar, Seiche)
          </button>

          <button
            onClick={() => setSelectedCategory("Pélagiques")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "Pélagiques"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-sky-50 text-sky-700 hover:bg-sky-100"
            }`}
          >
            🐟 Pélagiques (Sardinelle, Chinchard, Maquereau)
          </button>

          <button
            onClick={() => setSelectedCategory("Démersaux / Poissons Nobles")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "Démersaux / Poissons Nobles"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            🦞 Poissons Nobles (Thiof, Sole, Langouste)
          </button>

          <button
            onClick={() => setSelectedCategory("Farine & Huile de Poisson")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === "Farine & Huile de Poisson"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            🌾 Farine & Huile (68% Protéines)
          </button>
        </div>

        {/* Dropdowns & View toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher lot, navire, espèce..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            />
          </div>

          {/* Cold Room Select */}
          <div>
            <select
              value={selectedColdRoom}
              onChange={(e) => setSelectedColdRoom(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">Toutes Chambres Froides</option>
              {coldRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.currentTempCelsius}°C)
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="ALL">Tous les Statuts</option>
              <option value="DISPONIBLE">Disponible en Stock</option>
              <option value="RESERVE_EXPORT">Réservé Export</option>
              <option value="EN_CONTROLE_ONISPA">Contrôle ONISPA</option>
              <option value="EN_QUARANTAINE">En Quarantaine</option>
              <option value="EPUISE">Épuisé</option>
            </select>
          </div>

          {/* View mode buttons */}
          <div className="flex items-center justify-end space-x-2">
            <span className="text-xs text-slate-500 mr-1">Affichage:</span>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg border ${
                viewMode === "table"
                  ? "bg-cyan-600 text-white border-cyan-600"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              title="Vue Tableau"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg border ${
                viewMode === "cards"
                  ? "bg-cyan-600 text-white border-cyan-600"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
              title="Vue Grille de Cartes"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Summary Filter Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center space-x-3">
            <span>Lots sélectionnés: <strong>{filteredItems.length}</strong></span>
            <span>•</span>
            <span>Tonnage total: <strong className="text-slate-900">{formatTonnes(filteredTonnage)}</strong></span>
            <span>•</span>
            <span>Cartons: <strong>{filteredCartons.toLocaleString()}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 font-bold text-slate-900">
            <span className="text-slate-500 font-normal">Valeur sélection:</span>
            <span className="text-cyan-700">
              {activeCurrency === "EUR"
                ? formatEUR(filteredValueEUR)
                : activeCurrency === "USD"
                ? formatUSD(filteredValueUSD)
                : formatMRU(filteredValueMRU)}
            </span>
          </div>
        </div>

      </div>

      {/* View Mode 1: Table View */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">N° Lot & Traçabilité</th>
                  <th className="py-3.5 px-4">Espèce / Produit</th>
                  <th className="py-3.5 px-4">Calibre & Pack</th>
                  <th className="py-3.5 px-4">Stock & Tonnage</th>
                  <th className="py-3.5 px-4">Chambre Froide</th>
                  <th className="py-3.5 px-4">Navire / Origine</th>
                  <th className="py-3.5 px-4">Prix & Valeur ({activeCurrency})</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400">
                      Aucun lot ne correspond aux critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectLot(item)}
                    >
                      {/* Lot number & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {item.lotNumber}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          SKU: {item.sku}
                        </div>
                      </td>

                      {/* Species name */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-xs max-w-[200px] truncate">
                          {item.speciesName}
                        </div>
                        <div className="text-[11px] text-slate-500 italic">
                          {item.scientificName}
                        </div>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.2 rounded-full border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      </td>

                      {/* Caliber & Pack */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {item.caliber}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.packaging} ({item.freezingMethod})
                        </div>
                      </td>

                      {/* Stock & Tonnage */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formatTonnes(item.totalWeightTonnes)}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {item.cartonCount.toLocaleString()} unités ({formatKg(item.totalWeightKg)})
                        </div>
                      </td>

                      {/* Cold room */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 flex items-center space-x-1">
                          <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />
                          <span className="truncate max-w-[150px]">{item.coldRoomName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Congélation: {item.freezingDate}
                        </div>
                      </td>

                      {/* Vessel & ONISPA */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 flex items-center space-x-1">
                          <Ship className="w-3 h-3 text-slate-500" />
                          <span>{item.vesselName}</span>
                        </div>
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1 mt-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>{item.onispaCertNumber}</span>
                        </div>
                      </td>

                      {/* Price & Value */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {formatTotalValue(item)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {formatPrice(item)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onPrintLabel(item)}
                            className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Imprimer Étiquette Carton / Palette Export"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => onOpenMovementForLot(item)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Sortie Export / Mouvement"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectLot(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Fiche Détaillée"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View Mode 2: Grid of Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectLot(item)}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-200">
                    {item.lotNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight">
                    {item.speciesName}
                  </h3>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    {item.scientificName}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Calibre</span>
                    <span className="font-bold text-slate-800">{item.caliber}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">Conditionnement</span>
                    <span className="font-medium text-slate-700">{item.packaging}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-black text-slate-900">
                      {formatTonnes(item.totalWeightTonnes)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.cartonCount.toLocaleString()} cartons
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-extrabold text-cyan-800">
                      {formatTotalValue(item)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatPrice(item)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[160px]">{item.coldRoomName}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPrintLabel(item);
                    }}
                    className="p-1.5 text-slate-500 hover:text-cyan-700 hover:bg-slate-100 rounded-lg"
                    title="Imprimer Étiquette"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMovementForLot(item);
                    }}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg"
                    title="Sortie Export"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
