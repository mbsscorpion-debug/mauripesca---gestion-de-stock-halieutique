import React from "react";
import { 
  LayoutDashboard, 
  Boxes, 
  ArrowLeftRight, 
  ThermometerSnowflake, 
  FileText, 
  SearchCode, 
  Sparkles,
  Database
} from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  totalLotsCount?: number;
  totalMovementsCount?: number;
  coldRoomsAlertCount?: number;
  stockCount?: number;
  movementCount?: number;
  coldRoomAlertCount?: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  totalLotsCount,
  totalMovementsCount,
  coldRoomsAlertCount,
  stockCount,
  movementCount,
  coldRoomAlertCount,
}) => {
  const lotsCount = totalLotsCount ?? stockCount ?? 0;
  const mvtsCount = totalMovementsCount ?? movementCount ?? 0;
  const alertsCount = coldRoomsAlertCount ?? coldRoomAlertCount ?? 0;

  const tabs = [
    {
      id: "dashboard",
      targetId: "DASHBOARD",
      label: "Tableau de Bord",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "inventory",
      targetId: "INVENTORY",
      label: "Inventaire des Stocks",
      icon: Boxes,
      badge: lotsCount,
    },
    {
      id: "movements",
      targetId: "MOVEMENTS",
      label: "Mouvements & Opérations",
      icon: ArrowLeftRight,
      badge: mvtsCount,
    },
    {
      id: "coldrooms",
      targetId: "COLD_ROOMS",
      label: "Chambres Froides & Frigos",
      icon: ThermometerSnowflake,
      badge: alertsCount > 0 ? `${alertsCount} alerte` : null,
      badgeAlert: alertsCount > 0,
    },
    {
      id: "documents",
      targetId: "DOCUMENTS",
      label: "Bons & Packing Lists Export",
      icon: FileText,
      badge: "PDF / Print",
    },
    {
      id: "traceability",
      targetId: "TRACEABILITY",
      label: "Traçabilité & Lots ONISPA",
      icon: SearchCode,
      badge: null,
    },
    {
      id: "mysql_sync",
      targetId: "MYSQL_SYNC",
      label: "Base de Données MySQL",
      icon: Database,
      badge: "MySQL",
    },
    {
      id: "ai_assistant",
      targetId: "AI_ASSISTANT",
      label: "Assistant IA Logistique",
      icon: Sparkles,
      badge: "Gemini",
      badgeSpecial: true,
    },
  ];

  const isTabActive = (tabId: string, targetId: string) => {
    const normActive = (activeTab || "").toLowerCase().replace(/_/g, "");
    const normTab = tabId.toLowerCase().replace(/_/g, "");
    const normTarget = targetId.toLowerCase().replace(/_/g, "");
    return normActive === normTab || normActive === normTarget;
  };

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isTabActive(tab.id, tab.targetId);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.targetId)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? "bg-cyan-600 text-white shadow-sm shadow-cyan-900/40"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      tab.badgeAlert
                        ? "bg-rose-500 text-white"
                        : tab.badgeSpecial
                        ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                        : isActive
                        ? "bg-cyan-700 text-cyan-100"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
