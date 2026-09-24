import React from "react";
import { 
  StockItem, 
  ColdRoom, 
  StockMovement, 
  SpeciesCategory 
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
  Package, 
  TrendingUp, 
  ThermometerSnowflake, 
  ShieldCheck, 
  Anchor, 
  Ship, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Boxes, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Layers,
  FileCheck
} from "lucide-react";

interface DashboardViewProps {
  stockItems?: StockItem[];
  coldRooms?: ColdRoom[];
  movements?: StockMovement[];
  activeCurrency?: "MRU" | "EUR" | "USD";
  onSelectTab?: (tab: any) => void;
  onNavigateTab?: (tab: any) => void;
  onOpenNewLot?: () => void;
  onOpenNewMovement?: () => void;
  onSelectLot?: (lot: StockItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stockItems = [],
  coldRooms = [],
  movements = [],
  activeCurrency = "MRU",
  onSelectTab,
  onNavigateTab,
  onOpenNewLot,
  onOpenNewMovement,
  onSelectLot,
}) => {
  const triggerTab = (tab: string) => {
    if (onSelectTab) onSelectTab(tab);
    else if (onNavigateTab) onNavigateTab(tab);
  };

  // Calculations
  const totalTonnage = (stockItems || []).reduce((acc, item) => acc + item.totalWeightTonnes, 0);
  const totalCartons = (stockItems || []).reduce((acc, item) => acc + item.cartonCount, 0);
  
  const totalValueMRU = (stockItems || []).reduce(
    (acc, item) => acc + item.totalWeightKg * item.unitPriceMRUPerKg,
    0
  );
  const totalValueEUR = (stockItems || []).reduce(
    (acc, item) => acc + item.totalWeightKg * item.unitPriceEURPerKg,
    0
  );
  const totalValueUSD = (stockItems || []).reduce(
    (acc, item) => acc + item.totalWeightKg * item.unitPriceUSDPerKg,
    0
  );

  const formatActiveCurrency = (mru: number, eur: number, usd: number) => {
    if (activeCurrency === "EUR") return formatEUR(eur);
    if (activeCurrency === "USD") return formatUSD(usd);
    return formatMRU(mru);
  };

  const totalCapacity = (coldRooms || []).reduce((acc, r) => acc + r.capacityTonnes, 0);
  const currentColdTonnes = (coldRooms || []).reduce((acc, r) => acc + r.currentTonnes, 0);
  const overallOccupancyPercent = Math.round((currentColdTonnes / (totalCapacity || 1)) * 100);

  // Group by category
  const categories: SpeciesCategory[] = [
    "Céphalopodes",
    "Pélagiques",
    "Démersaux / Poissons Nobles",
    "Farine & Huile de Poisson",
  ];

  const categoryStats = categories.map((cat) => {
    const items = (stockItems || []).filter((i) => i.category === cat);
    const catTonnes = items.reduce((acc, i) => acc + i.totalWeightTonnes, 0);
    const catMRU = items.reduce((acc, i) => acc + i.totalWeightKg * i.unitPriceMRUPerKg, 0);
    const catEUR = items.reduce((acc, i) => acc + i.totalWeightKg * i.unitPriceEURPerKg, 0);
    const catUSD = items.reduce((acc, i) => acc + i.totalWeightKg * i.unitPriceUSDPerKg, 0);
    const percentage = totalTonnage > 0 ? (catTonnes / totalTonnage) * 100 : 0;
    return {
      category: cat,
      itemsCount: items.length,
      tonnes: catTonnes,
      valueMRU: catMRU,
      valueEUR: catEUR,
      valueUSD: catUSD,
      percentage: Math.round(percentage * 10) / 10,
    };
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner: MAURIPESCA Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Système Centralisé de Gestion des Stocks Halieutiques</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Tableau de Bord des Stocks MAURIPESCA
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Surveillance en temps réel des stocks congelés, débarquements des navires, entrepôts frigorifiques à Nouadhibou/Nouakchott et expéditions conteneurs Reefer.
          </p>
        </div>

        {/* Quick Operations Button Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewMovement}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-all shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
            <span>Sortie / Export Reefer</span>
          </button>

          <button
            onClick={onOpenNewLot}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-cyan-900/40"
          >
            <Ship className="w-4 h-4" />
            <span>Réception Débarquement</span>
          </button>
        </div>
      </div>

      {/* 4 Key Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Tonnage */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stock Global en Réserve
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {formatTonnes(totalTonnage)}
            </div>
            <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
              <span className="font-semibold text-cyan-700">{totalCartons.toLocaleString()}</span>
              <span>cartons / sacs / fûts</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Estimated Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Valeur Estimée ({activeCurrency})
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 truncate">
              {formatActiveCurrency(totalValueMRU, totalValueEUR, totalValueUSD)}
            </div>
            <div className="flex items-center space-x-2 mt-1 text-xs text-slate-500">
              <span>Cours marché export actif</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Cold Storage Occupancy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Remplissage Chambres Froides
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {overallOccupancyPercent}%
              </span>
              <span className="text-xs font-medium text-slate-500">
                ({formatTonnes(currentColdTonnes)} / {formatTonnes(totalCapacity)})
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallOccupancyPercent > 85 ? "bg-amber-500" : "bg-cyan-600"
                }`}
                style={{ width: `${Math.min(overallOccupancyPercent, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 4: ONISPA Compliance & Lots */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Conformité & Traçabilité
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stockItems.length} Lots
            </div>
            <div className="flex items-center space-x-1.5 mt-1 text-xs text-emerald-700 font-medium">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Certifiés ONISPA / HACCP</span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Stock by Species Category & Cold Storage Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2 Cols: Category Breakdown & Species Inventory */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Category Cards Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Répartition des Stocks par Espèces
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tonnage et valorisation selon les grandes filières halieutiques
                </p>
              </div>
              <button
                onClick={() => triggerTab("inventory")}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 flex items-center space-x-1"
              >
                <span>Voir l'inventaire complet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categoryStats.map((cat) => (
                <div
                  key={cat.category}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer"
                  onClick={() => triggerTab("inventory")}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getCategoryBadgeClass(cat.category)}`}>
                      {cat.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {cat.percentage}% du total
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {formatTonnes(cat.tonnes)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {cat.itemsCount} références de lots
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800">
                        {formatActiveCurrency(cat.valueMRU, cat.valueEUR, cat.valueUSD)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Valeur estimée
                      </div>
                    </div>
                  </div>

                  {/* Micro progress gauge */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div
                      className="bg-cyan-600 h-full rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Lots & Fast Mover Highlights */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Lots Stratégiques Disponibles (Prêts pour Export)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lots à forte valeur ajoutée calibrés en chambres froides
                </p>
              </div>
              <button
                onClick={() => triggerTab("inventory")}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
              >
                Gérer les lots
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {stockItems.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center mx-auto mb-3">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Base de Données Vierge (Aucun lot en stock)
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                    Commencez par enregistrer une réception de navire ou synchronisez vos données avec votre serveur local.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={onOpenNewLot}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      + Enregistrer un Débarquement
                    </button>
                    <button
                      onClick={() => triggerTab("MYSQL_SYNC")}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      Synchroniser la Base Locale
                    </button>
                  </div>
                </div>
              ) : (
                stockItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectLot && onSelectLot(item)}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-200">
                        {item.speciesName.includes("Poulpe") ? "🐙" : item.speciesName.includes("Calmar") ? "🦑" : item.speciesName.includes("Farine") ? "🌾" : item.speciesName.includes("Langouste") ? "🦞" : "🐟"}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                            {item.lotNumber}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            {item.speciesName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                          <span className="font-medium text-slate-700">Calibre: {item.caliber}</span>
                          <span>•</span>
                          <span>{item.coldRoomName}</span>
                          <span>•</span>
                          <span className="text-slate-600">Navire: {item.vesselName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {formatTonnes(item.totalWeightTonnes)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.cartonCount.toLocaleString()} cartons
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* 1 Col: Cold Rooms Surveillance & Recent Activity Feed */}
        <div className="space-y-6">
          
          {/* Cold Rooms Status Widget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ThermometerSnowflake className="w-5 h-5 text-cyan-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Chambres Froides
                </h2>
              </div>
              <button
                onClick={() => triggerTab("coldrooms")}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
              >
                Détails
              </button>
            </div>

            <div className="space-y-3">
              {coldRooms.map((room) => {
                const occupancy = Math.round((room.currentTonnes / (room.capacityTonnes || 1)) * 100);
                const isAlert = room.status === "ATTENTION_TEMP";

                return (
                  <div
                    key={room.id}
                    onClick={() => triggerTab("coldrooms")}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isAlert
                        ? "bg-amber-50/50 border-amber-300 ring-1 ring-amber-400/20"
                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-slate-900 truncate max-w-[170px]">
                        {room.name}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isAlert ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-800"
                        }`}>
                          {room.currentTempCelsius}°C
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span>{formatTonnes(room.currentTonnes)} / {formatTonnes(room.capacityTonnes)}</span>
                      <span className="font-semibold text-slate-700">{occupancy}% occupé</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isAlert ? "bg-amber-500" : occupancy > 80 ? "bg-blue-600" : "bg-cyan-600"
                        }`}
                        style={{ width: `${occupancy}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Operations Activity Feed */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-slate-700" />
                <h2 className="text-base font-bold text-slate-900">
                  Derniers Mouvements
                </h2>
              </div>
              <button
                onClick={() => triggerTab("movements")}
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
              >
                Journal
              </button>
            </div>

            <div className="space-y-3">
              {movements.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p>Aucun mouvement enregistré</p>
                  <button
                    onClick={onOpenNewMovement}
                    className="mt-2 text-cyan-700 hover:text-cyan-800 font-bold"
                  >
                    + Enregistrer une opération
                  </button>
                </div>
              ) : (
                movements.slice(0, 4).map((mvt) => (
                  <div
                    key={mvt.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[10px] text-slate-500">
                        {mvt.reference}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        mvt.type === "ENTREE_DEBARQUEMENT"
                          ? "bg-emerald-100 text-emerald-800"
                          : mvt.type === "SORTIE_EXPORT"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}>
                        {mvt.type === "ENTREE_DEBARQUEMENT" ? "Débarquement" : mvt.type === "SORTIE_EXPORT" ? "Export Reefer" : "Transfert"}
                      </span>
                    </div>

                    <div className="font-semibold text-slate-900">
                      {mvt.productName}
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>{formatTonnes(mvt.weightTonnes)} ({mvt.cartonCount} ctn)</span>
                      <span className="text-slate-400">{mvt.date.split(" ")[0]}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick AI Assistant Card */}
          <div className="bg-gradient-to-br from-cyan-900 to-slate-900 text-white rounded-2xl p-5 border border-cyan-800/50 shadow-md">
            <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>IA Halieutique & Analyse de Stock</span>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              Optimisation des rotations & Valorisation
            </h3>
            <p className="text-xs text-slate-300 mb-3">
              Générez en 1 clic un audit prédictif des stocks congelés et préparez les manifestes d'exportation vers le Japon et l'Europe.
            </p>
            <button
              onClick={() => triggerTab("ai_assistant")}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Lancer l'Analyse IA
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
