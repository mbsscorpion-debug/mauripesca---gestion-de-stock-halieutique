import React, { useState, useEffect } from "react";
import { 
  TabType, 
  Currency, 
  StockItem, 
  ColdRoom, 
  StockMovement, 
  ExportPackingList, 
  Vessel,
  MySQLSyncConfig,
  SyncLogEntry
} from "./types";
import { 
  INITIAL_STOCK_ITEMS, 
  INITIAL_COLD_ROOMS, 
  INITIAL_MOVEMENTS, 
  INITIAL_PACKING_LISTS, 
  INITIAL_VESSELS,
  DEMO_STOCK_ITEMS,
  DEMO_COLD_ROOMS,
  DEMO_MOVEMENTS,
  DEMO_PACKING_LISTS
} from "./data/mockData";
import { DEFAULT_MYSQL_CONFIG } from "./utils/mysqlSync";
import { Navbar } from "./components/Navbar";
import { NavigationTabs } from "./components/NavigationTabs";
import { DashboardView } from "./components/DashboardView";
import { StockInventoryView } from "./components/StockInventoryView";
import { StockMovementsView } from "./components/StockMovementsView";
import { ColdRoomsView } from "./components/ColdRoomsView";
import { TraceabilityMatrixView } from "./components/TraceabilityMatrixView";
import { OfficialDocumentsView } from "./components/OfficialDocumentsView";
import { AiAssistantView } from "./components/AiAssistantView";
import { MySQLSyncView } from "./components/MySQLSyncView";

// Modals
import { NewLotModal } from "./components/modals/NewLotModal";
import { NewMovementModal } from "./components/modals/NewMovementModal";
import { LotDetailModal } from "./components/modals/LotDetailModal";
import { PrintLabelModal } from "./components/modals/PrintLabelModal";

const STORAGE_KEYS = {
  STOCK_ITEMS: "mauripesca_stock_items_v2",
  COLD_ROOMS: "mauripesca_cold_rooms_v2",
  MOVEMENTS: "mauripesca_movements_v2",
  PACKING_LISTS: "mauripesca_packing_lists_v2",
  VESSELS: "mauripesca_vessels_v2",
  SYNC_CONFIG: "mauripesca_sync_config_v2",
  SYNC_LOGS: "mauripesca_sync_logs_v2",
};

export default function App() {
  // Navigation & State
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [activeCurrency, setActiveCurrency] = useState<Currency>("MRU");
  const [globalSearch, setGlobalSearch] = useState<string>("");

  // Core Datasets with local storage persistence
  const [stockItems, setStockItems] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCK_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_ITEMS;
    } catch {
      return INITIAL_STOCK_ITEMS;
    }
  });

  const [coldRooms, setColdRooms] = useState<ColdRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COLD_ROOMS);
      return saved ? JSON.parse(saved) : INITIAL_COLD_ROOMS;
    } catch {
      return INITIAL_COLD_ROOMS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
    } catch {
      return INITIAL_MOVEMENTS;
    }
  });

  const [packingLists, setPackingLists] = useState<ExportPackingList[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PACKING_LISTS);
      return saved ? JSON.parse(saved) : INITIAL_PACKING_LISTS;
    } catch {
      return INITIAL_PACKING_LISTS;
    }
  });

  const [vessels, setVessels] = useState<Vessel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VESSELS);
      return saved ? JSON.parse(saved) : INITIAL_VESSELS;
    } catch {
      return INITIAL_VESSELS;
    }
  });

  // MySQL Sync Config & Logs
  const [syncConfig, setSyncConfig] = useState<MySQLSyncConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_MYSQL_CONFIG;
    } catch {
      return DEFAULT_MYSQL_CONFIG;
    }
  });

  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STOCK_ITEMS, JSON.stringify(stockItems));
    } catch (e) {
      console.error(e);
    }
  }, [stockItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COLD_ROOMS, JSON.stringify(coldRooms));
    } catch (e) {
      console.error(e);
    }
  }, [coldRooms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    } catch (e) {
      console.error(e);
    }
  }, [movements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PACKING_LISTS, JSON.stringify(packingLists));
    } catch (e) {
      console.error(e);
    }
  }, [packingLists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VESSELS, JSON.stringify(vessels));
    } catch (e) {
      console.error(e);
    }
  }, [vessels]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(syncConfig));
    } catch (e) {
      console.error(e);
    }
  }, [syncConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(syncLogs));
    } catch (e) {
      console.error(e);
    }
  }, [syncLogs]);

  // Recalculate cold rooms occupancy dynamically when stockItems changes
  const syncColdRoomsTonnage = (currentLots: StockItem[]) => {
    setColdRooms((prevRooms) =>
      prevRooms.map((room) => {
        const roomLots = currentLots.filter((item) => item.coldRoomId === room.id);
        const totalTonnes = Math.round(roomLots.reduce((acc, l) => acc + l.totalWeightTonnes, 0) * 10) / 10;
        return {
          ...room,
          currentTonnes: totalTonnes,
          activeLotsCount: roomLots.length,
        };
      })
    );
  };

  const handleAddLog = (entry: Omit<SyncLogEntry, "id" | "timestamp">) => {
    const newEntry: SyncLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    setSyncLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  };

  // Clear all database data (empty DB)
  const handleClearAllData = () => {
    setStockItems([]);
    setMovements([]);
    setPackingLists([]);
    setColdRooms((prev) =>
      prev.map((r) => ({
        ...r,
        currentTonnes: 0,
        activeLotsCount: 0,
      }))
    );
    handleAddLog({
      type: "PURGE_LOCALE",
      status: "SUCCESS",
      message: "Base de données locale réinitialisée et vidée avec succès.",
      details: "0 lots, 0 mouvements, 0 packing lists restants.",
    });
  };

  // Load demo test data
  const handleLoadDemoData = () => {
    setStockItems(DEMO_STOCK_ITEMS);
    setColdRooms(DEMO_COLD_ROOMS);
    setMovements(DEMO_MOVEMENTS);
    setPackingLists(DEMO_PACKING_LISTS);
    handleAddLog({
      type: "CHARGEMENT_DEMO",
      status: "SUCCESS",
      message: "Données de démonstration chargées pour tests.",
      details: `${DEMO_STOCK_ITEMS.length} lots, ${DEMO_MOVEMENTS.length} mouvements.`,
    });
  };

  // Apply imported data from MySQL
  const handleApplyImportedData = (data: {
    stockItems: StockItem[];
    movements: StockMovement[];
    coldRooms: ColdRoom[];
    packingLists: ExportPackingList[];
  }) => {
    if (data.stockItems) setStockItems(data.stockItems);
    if (data.movements) setMovements(data.movements);
    if (data.packingLists) setPackingLists(data.packingLists);
    if (data.coldRooms && data.coldRooms.length > 0) {
      setColdRooms(data.coldRooms);
    } else if (data.stockItems) {
      syncColdRoomsTonnage(data.stockItems);
    }
  };

  // Modals state
  const [isNewLotModalOpen, setIsNewLotModalOpen] = useState<boolean>(false);
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState<boolean>(false);
  const [isLotDetailModalOpen, setIsLotDetailModalOpen] = useState<boolean>(false);
  const [isPrintLabelModalOpen, setIsPrintLabelModalOpen] = useState<boolean>(false);

  const [selectedLotForDetail, setSelectedLotForDetail] = useState<StockItem | null>(null);
  const [preselectedLotForMovement, setPreselectedLotForMovement] = useState<StockItem | null>(null);

  // Handlers
  const handleAddLot = (newLot: StockItem) => {
    const updated = [newLot, ...stockItems];
    setStockItems(updated);
    syncColdRoomsTonnage(updated);

    // Create an initial movement for entry
    const entryMovement: StockMovement = {
      id: `mvt-${Date.now()}`,
      reference: `MVT-REC-${newLot.lotNumber.split("-").pop() || Date.now().toString().slice(-4)}`,
      date: newLot.captureDate || new Date().toISOString().split("T")[0],
      type: "ENTREE_DEBARQUEMENT",
      stockItemId: newLot.id,
      lotNumber: newLot.lotNumber,
      productName: newLot.speciesName,
      cartonCount: newLot.cartonCount,
      weightKg: newLot.totalWeightKg,
      weightTonnes: newLot.totalWeightTonnes,
      fromLocation: `Quai de Débarquement (Navire ${newLot.vesselName})`,
      toLocation: newLot.coldRoomName,
      vesselOrSupplier: newLot.vesselName,
      operatorName: "Mohamed Lemine (Pointeur Quai)",
      notes: "Débarquement initial et pesée quai enregistrés.",
    };
    setMovements((prev) => [entryMovement, ...prev]);
  };

  const handleSaveMovement = (movement: StockMovement, updatedStockItem?: StockItem) => {
    setMovements((prev) => [movement, ...prev]);

    if (updatedStockItem) {
      const updatedList = stockItems.map((item) =>
        item.id === updatedStockItem.id ? updatedStockItem : item
      );
      setStockItems(updatedList);
      syncColdRoomsTonnage(updatedList);
    }
  };

  const handleDeleteLot = (lotId: string) => {
    const updatedList = stockItems.filter((l) => l.id !== lotId);
    setStockItems(updatedList);
    syncColdRoomsTonnage(updatedList);
  };

  const handleUpdateColdRoomTemp = (roomId: string, newTemp: number) => {
    setColdRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              currentTempCelsius: newTemp,
              status: Math.abs(newTemp - r.targetTempCelsius) > 3 ? "ATTENTION_TEMP" : "OPTIMAL",
            }
          : r
      )
    );
  };

  const handleOpenLotDetail = (lot: StockItem) => {
    setSelectedLotForDetail(lot);
    setIsLotDetailModalOpen(true);
  };

  const handleOpenPrintLabel = (lot: StockItem) => {
    setSelectedLotForDetail(lot);
    setIsPrintLabelModalOpen(true);
  };

  const handleOpenMovementForLot = (lot: StockItem) => {
    setPreselectedLotForMovement(lot);
    setIsNewMovementModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-cyan-600 selection:text-white">
      
      {/* Top Main Navigation */}
      <Navbar
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
        onOpenNewLot={() => setIsNewLotModalOpen(true)}
        onOpenNewMovement={() => {
          setPreselectedLotForMovement(null);
          setIsNewMovementModalOpen(true);
        }}
        searchQuery={globalSearch}
        setSearchQuery={setGlobalSearch}
        onSelectTab={setActiveTab}
        onTriggerAiTab={() => setActiveTab("AI_ASSISTANT")}
        syncStatus={syncConfig.syncStatus}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <NavigationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stockCount={stockItems.length}
          movementCount={movements.length}
          coldRoomAlertCount={coldRooms.filter((r) => r.status === "ATTENTION_TEMP").length}
        />

        {/* Dynamic Views */}
        <main>
          {activeTab === "DASHBOARD" && (
            <DashboardView
              stockItems={stockItems}
              coldRooms={coldRooms}
              movements={movements}
              activeCurrency={activeCurrency}
              onNavigateTab={setActiveTab}
              onSelectLot={handleOpenLotDetail}
              onOpenNewLot={() => setIsNewLotModalOpen(true)}
              onOpenNewMovement={() => {
                setPreselectedLotForMovement(null);
                setIsNewMovementModalOpen(true);
              }}
            />
          )}

          {activeTab === "INVENTORY" && (
            <StockInventoryView
              stockItems={stockItems}
              coldRooms={coldRooms}
              activeCurrency={activeCurrency}
              searchQuery={globalSearch}
              setSearchQuery={setGlobalSearch}
              onOpenNewLot={() => setIsNewLotModalOpen(true)}
              onSelectLot={handleOpenLotDetail}
              onPrintLabel={handleOpenPrintLabel}
              onOpenMovementForLot={handleOpenMovementForLot}
              onDeleteLot={handleDeleteLot}
            />
          )}

          {activeTab === "MOVEMENTS" && (
            <StockMovementsView
              movements={movements}
              stockItems={stockItems}
              activeCurrency={activeCurrency}
              onOpenNewMovement={() => {
                setPreselectedLotForMovement(null);
                setIsNewMovementModalOpen(true);
              }}
              onSelectLotById={(lotId) => {
                const found = stockItems.find((s) => s.id === lotId);
                if (found) handleOpenLotDetail(found);
              }}
            />
          )}

          {activeTab === "COLD_ROOMS" && (
            <ColdRoomsView
              coldRooms={coldRooms}
              stockItems={stockItems}
              onSelectLot={handleOpenLotDetail}
              onOpenNewMovement={() => {
                setPreselectedLotForMovement(null);
                setIsNewMovementModalOpen(true);
              }}
              onUpdateTemp={handleUpdateColdRoomTemp}
            />
          )}

          {activeTab === "TRACEABILITY" && (
            <TraceabilityMatrixView
              stockItems={stockItems}
              movements={movements}
              selectedLot={selectedLotForDetail}
              onSelectLot={handleOpenLotDetail}
              onPrintLabel={handleOpenPrintLabel}
            />
          )}

          {activeTab === "DOCUMENTS" && (
            <OfficialDocumentsView
              packingLists={packingLists}
              stockItems={stockItems}
              activeCurrency={activeCurrency}
              onSelectLot={handleOpenLotDetail}
            />
          )}

          {activeTab === "MYSQL_SYNC" && (
            <MySQLSyncView
              stockItems={stockItems}
              coldRooms={coldRooms}
              movements={movements}
              packingLists={packingLists}
              vessels={vessels}
              syncConfig={syncConfig}
              setSyncConfig={setSyncConfig}
              syncLogs={syncLogs}
              onAddLog={handleAddLog}
              onApplyImportedData={handleApplyImportedData}
              onClearAllData={handleClearAllData}
              onLoadDemoData={handleLoadDemoData}
            />
          )}

          {activeTab === "AI_ASSISTANT" && (
            <AiAssistantView
              stockItems={stockItems}
              coldRooms={coldRooms}
              movements={movements}
              activeCurrency={activeCurrency}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200/80 bg-white py-6 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">MAURIPESCA S.A.</span>
            <span>•</span>
            <span>Système de Gestion des Stocks & Traçabilité Halieutique</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>Port Frigorifique de Nouadhibou & Nouakchott • République Islamique de Mauritanie</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab("MYSQL_SYNC")}
              className="hover:text-cyan-700 transition-colors underline cursor-pointer"
            >
              Base Locale
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewLotModal
        isOpen={isNewLotModalOpen}
        onClose={() => setIsNewLotModalOpen(false)}
        onAddLot={handleAddLot}
        coldRooms={coldRooms}
        vessels={vessels}
      />

      <NewMovementModal
        isOpen={isNewMovementModalOpen}
        onClose={() => {
          setIsNewMovementModalOpen(false);
          setPreselectedLotForMovement(null);
        }}
        stockItems={stockItems}
        coldRooms={coldRooms}
        preselectedLot={preselectedLotForMovement}
        onSaveMovement={handleSaveMovement}
      />

      <LotDetailModal
        lot={selectedLotForDetail}
        isOpen={isLotDetailModalOpen}
        onClose={() => {
          setIsLotDetailModalOpen(false);
        }}
        onPrintLabel={handleOpenPrintLabel}
        onOpenMovement={handleOpenMovementForLot}
        onDeleteLot={handleDeleteLot}
        activeCurrency={activeCurrency}
      />

      <PrintLabelModal
        lot={selectedLotForDetail}
        isOpen={isPrintLabelModalOpen}
        onClose={() => setIsPrintLabelModalOpen(false)}
      />

    </div>
  );
}
