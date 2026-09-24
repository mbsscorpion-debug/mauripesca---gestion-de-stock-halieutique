import React, { useState } from "react";
import { 
  ColdRoom, 
  StockItem 
} from "../types";
import { 
  formatTonnes, 
  formatKg, 
  getCategoryBadgeClass 
} from "../utils/formatters";
import { 
  ThermometerSnowflake, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  MapPin, 
  Package, 
  Clock, 
  ArrowRight, 
  RefreshCw,
  Layers,
  Sparkles,
  ShieldCheck,
  TrendingDown
} from "lucide-react";

interface ColdRoomsViewProps {
  coldRooms?: ColdRoom[];
  stockItems?: StockItem[];
  onSelectLot?: (lot: StockItem) => void;
  onOpenNewMovement?: () => void;
  onUpdateTemp?: (roomId: string, newTemp: number) => void;
}

export const ColdRoomsView: React.FC<ColdRoomsViewProps> = ({
  coldRooms = [],
  stockItems = [],
  onSelectLot,
  onOpenNewMovement,
  onUpdateTemp,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(coldRooms[0]?.id || "");
  const [editingTempRoomId, setEditingTempRoomId] = useState<string | null>(null);
  const [tempInputValue, setTempInputValue] = useState<string>("");

  const activeRoom = (coldRooms || []).find((r) => r.id === selectedRoomId) || coldRooms[0];
  const activeRoomLots = (stockItems || []).filter((item) => item.coldRoomId === activeRoom?.id);

  const totalCap = (coldRooms || []).reduce((acc, r) => acc + r.capacityTonnes, 0);
  const totalOccupied = (coldRooms || []).reduce((acc, r) => acc + r.currentTonnes, 0);

  const handleStartEditTemp = (room: ColdRoom) => {
    setEditingTempRoomId(room.id);
    setTempInputValue(room.currentTempCelsius.toString());
  };

  const handleSaveTemp = (roomId: string) => {
    const val = parseFloat(tempInputValue);
    if (!isNaN(val)) {
      onUpdateTemp(roomId, val);
    }
    setEditingTempRoomId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />
            <span>Supervision Frigorifique & Normes HACCP</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Chambres Froides & Entrepôts Frigorifiques
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Surveillance continue des températures de stockage à cœur (-20°C à -28°C), capacités et affectation spatiale des lots.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-500 block">Capacité Totale Installée</span>
            <span className="text-base font-extrabold text-slate-900">
              {formatTonnes(totalOccupied)} / {formatTonnes(totalCap)}
            </span>
          </div>
          <button
            onClick={onOpenNewMovement}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Transfert Inter-Chambres</span>
          </button>
        </div>
      </div>

      {/* 5 Cold Storage Facility Cards Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {coldRooms.map((room) => {
          const occupancy = Math.round((room.currentTonnes / room.capacityTonnes) * 100);
          const isSelected = room.id === activeRoom?.id;
          const isAlert = room.status === "ATTENTION_TEMP";

          return (
            <div
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-cyan-500"
                  : isAlert
                  ? "bg-amber-50/70 border-amber-300 text-slate-800 hover:bg-amber-100/50"
                  : "bg-white border-slate-200/80 text-slate-800 hover:bg-slate-50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isSelected ? "bg-slate-800 text-cyan-300" : "bg-slate-100 text-slate-600"
                  }`}>
                    {room.code}
                  </span>
                  {isAlert && (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-amber-500 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <h3 className={`font-bold text-xs mt-2 line-clamp-2 ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {room.name}
                </h3>

                <div className="flex items-center space-x-1 text-[10px] mt-1 text-slate-400">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span className="truncate">{room.location}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/40">
                <div className="flex items-baseline justify-between">
                  <span className={`text-lg font-black font-mono ${
                    isAlert ? "text-amber-500" : isSelected ? "text-cyan-300" : "text-cyan-800"
                  }`}>
                    {room.currentTempCelsius}°C
                  </span>
                  <span className={`text-[11px] font-bold ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {occupancy}% plein
                  </span>
                </div>

                <div className="w-full bg-slate-200/60 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isAlert
                        ? "bg-amber-500"
                        : isSelected
                        ? "bg-cyan-400"
                        : occupancy > 85
                        ? "bg-blue-700"
                        : "bg-cyan-600"
                    }`}
                    style={{ width: `${Math.min(occupancy, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Cold Room Detailed Inspector */}
      {activeRoom && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 1 Col: Facility Specs & Sensor Settings */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                  {activeRoom.code}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  activeRoom.status === "OPTIMAL"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  {activeRoom.status === "OPTIMAL" ? "Fonctionnement Normal" : "Attention Température"}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mt-2">
                {activeRoom.name}
              </h2>
              <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                <span>{activeRoom.location}</span>
              </p>
            </div>

            {/* Thermal Sensor Card */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Sonde Thermique en Direct
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-black font-mono text-cyan-300">
                    {activeRoom.currentTempCelsius} °C
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Consigne cible : {activeRoom.targetTempCelsius} °C
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-200">
                    {activeRoom.humidityPercent}%
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Hygrométrie
                  </div>
                </div>
              </div>

              {/* Adjust Temp Sensor Simulation */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                {editingTempRoomId === activeRoom.id ? (
                  <div className="flex items-center space-x-2 w-full">
                    <input
                      type="number"
                      step="0.1"
                      value={tempInputValue}
                      onChange={(e) => setTempInputValue(e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-800 text-white rounded border border-slate-700 text-xs font-mono"
                    />
                    <button
                      onClick={() => handleSaveTemp(activeRoom.id)}
                      className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-bold text-white"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => setEditingTempRoomId(null)}
                      className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEditTemp(activeRoom)}
                    className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center space-x-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Ajuster la sonde / Consigne</span>
                  </button>
                )}
              </div>
            </div>

            {/* Storage capacity specs */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Capacité Maximale :</span>
                <span className="font-bold text-slate-900">{formatTonnes(activeRoom.capacityTonnes)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Stock Actuel Présent :</span>
                <span className="font-bold text-cyan-800">{formatTonnes(activeRoom.currentTonnes)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Espace Disponible :</span>
                <span className="font-bold text-emerald-700">{formatTonnes(activeRoom.capacityTonnes - activeRoom.currentTonnes)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Dernière Inspection Sanitaire :</span>
                <span className="font-medium text-slate-800">{activeRoom.lastInspectionDate}</span>
              </div>
            </div>

            {/* HACCP Compliance statement */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Certification ONISPA & UE</strong>
                Entrepôt agréé pour l'exportation vers l'Union Européenne et le Japon. Chaîne du froid continue garantie.
              </div>
            </div>

          </div>

          {/* Right 2 Cols: Stored Lots in this Cold Room */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Lots Halieutiques Présents dans {activeRoom.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeRoomLots.length} références de lots stockées à {activeRoom.currentTempCelsius}°C
                </p>
              </div>

              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg">
                Total: {formatTonnes(activeRoomLots.reduce((acc, i) => acc + i.totalWeightTonnes, 0))}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {activeRoomLots.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Aucun lot n'est actuellement affecté à cette chambre froide.
                </div>
              ) : (
                activeRoomLots.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectLot(item)}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-200">
                          {item.lotNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                      
                      <div className="font-bold text-slate-900 text-sm">
                        {item.speciesName}
                      </div>

                      <div className="text-xs text-slate-500 flex items-center space-x-2">
                        <span>Calibre : <strong>{item.caliber}</strong></span>
                        <span>•</span>
                        <span>Navire : {item.vesselName}</span>
                        <span>•</span>
                        <span>Congélation : {item.freezingDate}</span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-base font-extrabold text-slate-900">
                        {formatTonnes(item.totalWeightTonnes)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {item.cartonCount.toLocaleString()} cartons ({formatKg(item.totalWeightKg)})
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
