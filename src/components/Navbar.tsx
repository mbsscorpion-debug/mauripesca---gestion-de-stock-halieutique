import React from "react";
import { 
  Anchor, 
  Search, 
  Plus, 
  MapPin, 
  ThermometerSnowflake,
  Layers
} from "lucide-react";
import { ColdRoom } from "../types";

interface NavbarProps {
  activeCurrency: "MRU" | "EUR" | "USD";
  setActiveCurrency: (c: "MRU" | "EUR" | "USD") => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onOpenNewLot?: () => void;
  onOpenNewMovement?: () => void;
  coldRooms?: ColdRoom[];
  onSelectTab?: (tab: string) => void;
  onTriggerAiTab?: () => void;
  syncStatus?: "IDLE" | "SYNCING" | "SUCCESS" | "ERROR";
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCurrency,
  setActiveCurrency,
  searchQuery = "",
  setSearchQuery,
  onOpenNewLot,
  onOpenNewMovement,
  coldRooms = [],
  onSelectTab,
  onTriggerAiTab,
  syncStatus = "IDLE",
}) => {
  const alertRooms = (coldRooms || []).filter((r) => r.status === "ATTENTION_TEMP");

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Company Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab && onSelectTab("dashboard")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-900/30 border border-cyan-400/30">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl tracking-wider text-white">MAURIPESCA</span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">
                  RIM S.A.
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-tight hidden sm:block">
                Gestion des Stocks Halieutiques & Logistique Frigorifique
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                placeholder="Rechercher un lot, espèce (ex: Poulpe T3), navire, frigo..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* Currency Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setActiveCurrency("MRU")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeCurrency === "MRU"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Ouguiya Mauritanienne"
              >
                MRU
              </button>
              <button
                onClick={() => setActiveCurrency("EUR")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeCurrency === "EUR"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Euro (Export UE)"
              >
                EUR (€)
              </button>
              <button
                onClick={() => setActiveCurrency("USD")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  activeCurrency === "USD"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="US Dollar (Export Asie)"
              >
                USD ($)
              </button>
            </div>

            {/* Cold Room Temp Alert Pill */}
            {alertRooms.length > 0 ? (
              <button
                onClick={() => onSelectTab && onSelectTab("coldrooms")}
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800 text-xs animate-pulse"
                title="Alerte température chambre froide"
              >
                <ThermometerSnowflake className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{alertRooms.length} Alerte Frigo</span>
              </button>
            ) : (
              <div className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                <span>Frigos -25°C OK</span>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenNewMovement}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nouveau Mouvement</span>
              </button>

              <button
                onClick={onOpenNewLot}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Réception Débarquement</span>
                <span className="xs:hidden">Entrée</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
