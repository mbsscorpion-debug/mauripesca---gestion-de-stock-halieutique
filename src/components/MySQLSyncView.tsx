import React, { useState } from "react";
import { 
  StockItem, 
  ColdRoom, 
  StockMovement, 
  ExportPackingList, 
  Vessel, 
  MySQLSyncConfig, 
  SyncLogEntry 
} from "../types";
import { 
  generateMySQLSchemaSQL, 
  generateSQLDataDump, 
  generatePHPBridgeCode, 
  testMySQLConnection, 
  pushDataToMySQL, 
  pullDataFromMySQL, 
  downloadFile 
} from "../utils/mysqlSync";
import {
  Database,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  FileCode,
  Server,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Copy,
  Check,
  HardDrive,
  Layers,
  ArrowRightLeft,
  Sliders,
  Terminal,
  FileSpreadsheet,
  HelpCircle,
  ExternalLink,
  RotateCcw
} from "lucide-react";

interface MySQLSyncViewProps {
  stockItems: StockItem[];
  coldRooms: ColdRoom[];
  movements: StockMovement[];
  packingLists: ExportPackingList[];
  vessels: Vessel[];
  syncConfig: MySQLSyncConfig;
  setSyncConfig: React.Dispatch<React.SetStateAction<MySQLSyncConfig>>;
  syncLogs: SyncLogEntry[];
  onAddLog: (entry: Omit<SyncLogEntry, "id" | "timestamp">) => void;
  onApplyImportedData: (data: {
    stockItems: StockItem[];
    movements: StockMovement[];
    coldRooms: ColdRoom[];
    packingLists: ExportPackingList[];
  }) => void;
  onClearAllData: () => void;
  onLoadDemoData: () => void;
}

export const MySQLSyncView: React.FC<MySQLSyncViewProps> = ({
  stockItems,
  coldRooms,
  movements,
  packingLists,
  vessels,
  syncConfig,
  setSyncConfig,
  syncLogs,
  onAddLog,
  onApplyImportedData,
  onClearAllData,
  onLoadDemoData,
}) => {
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [copiedPhp, setCopiedPhp] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"SYNC" | "SQL_SCRIPT" | "PHP_BRIDGE" | "GUIDE">("SYNC");
  const [showConfirmClear, setShowConfirmClear] = useState<boolean>(false);

  // Test XAMPP Connection
  const handleTestConnection = async () => {
    setTestingConnection(true);
    setSyncConfig((prev) => ({ ...prev, syncStatus: "SYNCING" }));

    const res = await testMySQLConnection(syncConfig.apiUrl);
    setTestingConnection(false);

    if (res.success) {
      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: "SUCCESS",
        lastSyncTimestamp: new Date().toLocaleTimeString(),
        lastErrorMessage: undefined,
      }));
      onAddLog({
        type: "TEST",
        status: "SUCCESS",
        message: "Connexion MySQL XAMPP réussie (Serveur actif & base accessible).",
      });
    } else {
      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: "ERROR",
        lastErrorMessage: res.message,
      }));
      onAddLog({
        type: "TEST",
        status: "ERROR",
        message: res.message,
      });
    }
  };

  // Push local data to MySQL XAMPP
  const handlePushData = async () => {
    setIsPushing(true);
    setSyncConfig((prev) => ({ ...prev, syncStatus: "SYNCING" }));

    const res = await pushDataToMySQL(syncConfig.apiUrl, {
      stockItems,
      movements,
      coldRooms,
      packingLists,
    });

    setIsPushing(false);
    if (res.success) {
      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: "SUCCESS",
        lastSyncTimestamp: new Date().toLocaleTimeString(),
      }));
      onAddLog({
        type: "PUSH",
        status: "SUCCESS",
        message: `Export vers MySQL XAMPP réussi (${stockItems.length} lots, ${movements.length} mouvements envoyés).`,
        itemCount: stockItems.length,
      });
    } else {
      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: "ERROR",
        lastErrorMessage: res.message,
      }));
      onAddLog({
        type: "PUSH",
        status: "ERROR",
        message: res.message,
      });
    }
  };

  // Pull data from MySQL XAMPP
  const handlePullData = async () => {
    setIsPulling(true);
    setSyncConfig((prev) => ({ ...prev, syncStatus: "SYNCING" }));

    const res = await pullDataFromMySQL(syncConfig.apiUrl);
    setIsPulling(false);

    if (res.success && res.data) {
      onApplyImportedData(res.data);
      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: "SUCCESS",
        lastSyncTimestamp: new Date().toLocaleTimeString(),
      }));
      onAddLog({
        type: "PULL",
        status: "SUCCESS",
        message: res.message,
        itemCount: res.data.stockItems?.length || 0,
      });
    } else {
      setSyncConfig((prev) => ({
        ...prev,
        syncStatus: "ERROR",
        lastErrorMessage: res.message,
      }));
      onAddLog({
        type: "PULL",
        status: "ERROR",
        message: res.message,
      });
    }
  };

  // Copy Schema SQL
  const handleCopySchema = () => {
    const sql = generateMySQLSchemaSQL();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Copy PHP Bridge
  const handleCopyPhp = () => {
    const php = generatePHPBridgeCode(
      syncConfig.dbHost,
      syncConfig.dbPort,
      syncConfig.dbName,
      syncConfig.dbUser,
      ""
    );
    navigator.clipboard.writeText(php);
    setCopiedPhp(true);
    setTimeout(() => setCopiedPhp(false), 2500);
  };

  // Download SQL Dump
  const handleDownloadDump = () => {
    const sqlDump = generateSQLDataDump(stockItems, movements, coldRooms, packingLists, vessels);
    downloadFile(`mauripesca_dump_${new Date().toISOString().slice(0, 10)}.sql`, sqlDump, "application/sql");
    onAddLog({
      type: "IMPORT",
      status: "INFO",
      message: "Dump SQL généré et téléchargé pour phpMyAdmin.",
    });
  };

  // Download PHP Bridge
  const handleDownloadPhp = () => {
    const php = generatePHPBridgeCode(
      syncConfig.dbHost,
      syncConfig.dbPort,
      syncConfig.dbName,
      syncConfig.dbUser,
      ""
    );
    downloadFile("api.php", php, "application/x-httpd-php");
  };

  // Clear all database
  const handleConfirmClear = () => {
    onClearAllData();
    setShowConfirmClear(false);
    onAddLog({
      type: "CLEAR",
      status: "INFO",
      message: "Base de données vidée : tous les lots et mouvements de démonstration ont été supprimés.",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-800/40 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Database className="w-64 h-64 text-cyan-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Database className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Synchronisation MySQL & XAMPP
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                phpMyAdmin / MariaDB
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl">
              Connectez directement l'application de gestion halieutique à votre serveur local <strong className="text-cyan-200">XAMPP MySQL</strong>. Exportez les tables SQL, synchronisez les stocks en temps réel et gérez une base de données propre.
            </p>
          </div>

          {/* Quick status pill */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                syncConfig.syncStatus === "SUCCESS" 
                  ? "bg-emerald-400 shadow-xs shadow-emerald-400" 
                  : syncConfig.syncStatus === "ERROR"
                  ? "bg-rose-400 shadow-xs shadow-rose-400"
                  : "bg-amber-400 shadow-xs shadow-amber-400"
              }`} />
              <div className="text-xs">
                <p className="text-slate-400 font-medium">Statut XAMPP</p>
                <p className="font-bold text-white">
                  {syncConfig.syncStatus === "SUCCESS" ? "Connecté à MySQL" : syncConfig.syncStatus === "ERROR" ? "Non connecté / Hors-ligne" : "Prêt à synchroniser"}
                </p>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testingConnection ? "animate-spin" : ""}`} />
              <span>{testingConnection ? "Test en cours..." : "Tester Connexion"}</span>
            </button>
          </div>
        </div>

        {/* Navigation sub-tabs */}
        <div className="flex items-center space-x-2 mt-6 border-t border-slate-800 pt-4 overflow-x-auto">
          {[
            { id: "SYNC", label: "Centre de Synchronisation", icon: ArrowRightLeft },
            { id: "SQL_SCRIPT", label: "Script SQL (phpMyAdmin)", icon: FileCode },
            { id: "PHP_BRIDGE", label: "Fichier API PHP (XAMPP)", icon: Terminal },
            { id: "GUIDE", label: "Guide XAMPP pas-à-pas", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "SYNC" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Main Operations & Status */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Database Inventory Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-5 h-5 text-cyan-600" />
                  <h2 className="text-base font-black text-slate-800">
                    État Actuel de la Base de Données
                  </h2>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  stockItems.length === 0 
                    ? "bg-slate-100 text-slate-600 border border-slate-200" 
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {stockItems.length === 0 ? "Base de Données Vierge (0 lot)" : `${stockItems.length} Lots Actifs`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">Lots en Stock</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stockItems.length}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">Mouvements</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{movements.length}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">Chambres Froides</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{coldRooms.length}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium">Packing Lists</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{packingLists.length}</p>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePushData}
                  disabled={isPushing}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                  title="Enregistrer toutes les données actuelles dans la base MySQL de XAMPP"
                >
                  <UploadCloud className={`w-4 h-4 ${isPushing ? "animate-bounce" : ""}`} />
                  <span>{isPushing ? "Envoi vers MySQL..." : "1. Pousser vers MySQL XAMPP"}</span>
                </button>

                <button
                  onClick={handlePullData}
                  disabled={isPulling}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                  title="Charger les données enregistrées dans votre base MySQL XAMPP"
                >
                  <DownloadCloud className={`w-4 h-4 ${isPulling ? "animate-bounce" : ""}`} />
                  <span>{isPulling ? "Récupération..." : "2. Importer depuis MySQL XAMPP"}</span>
                </button>

                <button
                  onClick={handleDownloadDump}
                  className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
                  title="Télécharger le fichier SQL complet pour phpMyAdmin"
                >
                  <FileCode className="w-4 h-4 text-cyan-600" />
                  <span>Télécharger Dump SQL</span>
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all"
                    title="Vider tous les lots et mouvements pour démarrer à zéro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vider la Base</span>
                  </button>

                  {stockItems.length === 0 && (
                    <button
                      onClick={onLoadDemoData}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all"
                      title="Recharger des exemples pour tester"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Charger Données Démo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* XAMPP Server Configuration */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-slate-700" />
                  <h2 className="text-base font-black text-slate-800">
                    Paramètres du Serveur MySQL XAMPP
                  </h2>
                </div>
                <span className="text-xs text-slate-500">
                  Par défaut : localhost:3306
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    URL du Pont API PHP (XAMPP htdocs)
                  </label>
                  <input
                    type="text"
                    value={syncConfig.apiUrl}
                    onChange={(e) => setSyncConfig({ ...syncConfig, apiUrl: e.target.value })}
                    placeholder="http://localhost/mauripesca/api.php"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Exemple : <code className="text-cyan-700 font-semibold">http://localhost/mauripesca/api.php</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de la Base de Données
                  </label>
                  <input
                    type="text"
                    value={syncConfig.dbName}
                    onChange={(e) => setSyncConfig({ ...syncConfig, dbName: e.target.value })}
                    placeholder="mauripesca_db"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Créée automatiquement lors de l'exécution du script SQL
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hôte MySQL & Port
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={syncConfig.dbHost}
                      onChange={(e) => setSyncConfig({ ...syncConfig, dbHost: e.target.value })}
                      placeholder="localhost"
                      className="w-2/3 text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={syncConfig.dbPort}
                      onChange={(e) => setSyncConfig({ ...syncConfig, dbPort: parseInt(e.target.value) || 3306 })}
                      placeholder="3306"
                      className="w-1/3 text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Utilisateur MySQL (XAMPP par défaut: root)
                  </label>
                  <input
                    type="text"
                    value={syncConfig.dbUser}
                    onChange={(e) => setSyncConfig({ ...syncConfig, dbUser: e.target.value })}
                    placeholder="root"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mot de passe vide par défaut sous XAMPP
                  </p>
                </div>
              </div>
            </div>

            {/* Sync Activity Logs */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-slate-700" />
                  <h2 className="text-base font-black text-slate-800">
                    Journal des Événements & Synchronisations
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  {syncLogs.length} entrées
                </span>
              </div>

              {syncLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Aucune opération effectuée pour le moment. Cliquez sur "Tester Connexion" ou "Pousser vers MySQL".
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {syncLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border text-xs flex items-start space-x-3 ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                          : log.status === "ERROR"
                          ? "bg-rose-50/70 border-rose-200 text-rose-900"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      {log.status === "SUCCESS" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : log.status === "ERROR" ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <Database className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px]">
                            {log.type}
                          </span>
                          <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                        </div>
                        <p className="mt-0.5 leading-relaxed">{log.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Col: Quick Setup & Instructions */}
          <div className="space-y-6">
            
            {/* Quick 3-Step Setup Card */}
            <div className="bg-gradient-to-br from-cyan-900 to-slate-900 rounded-2xl p-5 text-white border border-cyan-800/40 shadow-md">
              <div className="flex items-center space-x-2 mb-4">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="font-black text-sm">Guide Rapide XAMPP (3 Étapes)</h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-cyan-200">Démarrer XAMPP</p>
                    <p className="text-slate-300 mt-0.5">
                      Ouvrez <strong>XAMPP Control Panel</strong> et démarrez les modules <strong>Apache</strong> et <strong>MySQL</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-cyan-200">Créer les Tables dans phpMyAdmin</p>
                    <p className="text-slate-300 mt-0.5">
                      Allez sur <code className="text-cyan-300 font-mono">http://localhost/phpmyadmin</code>, cliquez sur <strong>Importer</strong> et chargez le script SQL ci-dessous.
                    </p>
                    <button
                      onClick={handleCopySchema}
                      className="mt-2 text-[11px] px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center space-x-1"
                    >
                      {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSql ? "Copié !" : "Copier le Script SQL"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-cyan-200">Placer le Pont API PHP</p>
                    <p className="text-slate-300 mt-0.5">
                      Téléchargez le fichier <code className="text-cyan-300 font-mono">api.php</code> et collez-le dans :
                    </p>
                    <code className="block bg-slate-950/80 px-2 py-1 rounded text-[10px] text-cyan-300 my-1 font-mono break-all">
                      C:\xampp\htdocs\mauripesca\api.php
                    </code>
                    <button
                      onClick={handleDownloadPhp}
                      className="mt-1 text-[11px] px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center space-x-1"
                    >
                      <DownloadCloud className="w-3 h-3" />
                      <span>Télécharger api.php</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <h3 className="font-bold text-xs text-slate-800 mb-3 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-cyan-600" />
                <span>Tables Incluses dans le Schéma MySQL</span>
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { name: "stock_items", desc: "Lots de poissons, espèces, calibres, poids, certifications ONISPA" },
                  { name: "stock_movements", desc: "Journal des débarquements, sorties export et transferts" },
                  { name: "cold_rooms", desc: "Chambres froides, capacités, températures et sondes" },
                  { name: "export_packing_lists", desc: "Manifestes d'expédition et bons de livraison export" },
                  { name: "vessels", desc: "Flotte de navires et chalutiers enregistrés" },
                ].map((t) => (
                  <div key={t.name} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                    <p className="font-mono font-bold text-cyan-900 text-[11px]">{t.name}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SQL Script Tab */}
      {activeTab === "SQL_SCRIPT" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-800">
                Script SQL Complet pour MySQL / phpMyAdmin
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Crée la base de données <code>mauripesca_db</code>, les clés primaires, index et contraintes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySchema}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-all"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? "Script Copié !" : "Copier le Script SQL"}</span>
              </button>
              <button
                onClick={handleDownloadDump}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                <DownloadCloud className="w-4 h-4 text-cyan-600" />
                <span>Télécharger .sql</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-900 text-cyan-300 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
            {generateMySQLSchemaSQL()}
          </pre>
        </div>
      )}

      {/* PHP Bridge Tab */}
      {activeTab === "PHP_BRIDGE" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-800">
                Script Serveur PHP Pont (api.php pour XAMPP)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Placez ce fichier dans <code className="font-mono text-cyan-700">C:\xampp\htdocs\mauripesca\api.php</code> pour activer la communication en direct.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPhp}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-all"
              >
                {copiedPhp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPhp ? "Code PHP Copié !" : "Copier le Code PHP"}</span>
              </button>
              <button
                onClick={handleDownloadPhp}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
              >
                <DownloadCloud className="w-4 h-4 text-cyan-600" />
                <span>Télécharger api.php</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-900 text-amber-300 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] leading-relaxed border border-slate-800">
            {generatePHPBridgeCode(
              syncConfig.dbHost,
              syncConfig.dbPort,
              syncConfig.dbName,
              syncConfig.dbUser,
              ""
            )}
          </pre>
        </div>
      )}

      {/* Guide Tab */}
      {activeTab === "GUIDE" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-800">
              Guide d'Installation & Synchronisation Complète avec XAMPP
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivez ces étapes pour lier l'application avec votre serveur MySQL local en moins de 2 minutes.
            </p>
          </div>

          <div className="space-y-6 text-xs text-slate-700">
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-black flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="font-bold text-slate-900 text-sm">Lancer XAMPP</h4>
                <p>
                  Ouvrez l'application <strong>XAMPP Control Panel</strong> sur votre ordinateur. Cliquez sur <strong>Start</strong> devant <strong>Apache</strong> et <strong>MySQL</strong>. Les deux boutons doivent devenir verts.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-black flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="font-bold text-slate-900 text-sm">Créer la Base de Données dans phpMyAdmin</h4>
                <p>
                  Dans votre navigateur, rendez-vous sur <a href="http://localhost/phpmyadmin" target="_blank" rel="noreferrer" className="text-cyan-700 font-bold underline">http://localhost/phpmyadmin</a>.
                </p>
                <p>
                  Cliquez sur l'onglet <strong>SQL</strong> ou <strong>Importer</strong>, collez ou téléversez le script SQL fourni dans l'onglet <em>"Script SQL (phpMyAdmin)"</em> et cliquez sur <strong>Exécuter</strong>. La base <code>mauripesca_db</code> et toutes ses tables seront créées instantanément.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-black flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="font-bold text-slate-900 text-sm">Installer le script de liaison PHP</h4>
                <p>
                  Dans votre dossier XAMPP (généralement <code>C:\xampp\htdocs\</code>), créez un dossier nommé <code>mauripesca</code>.
                </p>
                <p>
                  Placez le fichier <code>api.php</code> à l'intérieur : <code>C:\xampp\htdocs\mauripesca\api.php</code>.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-black flex items-center justify-center shrink-0">
                4
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="font-bold text-slate-900 text-sm">Tester et Synchroniser</h4>
                <p>
                  Revenez dans l'onglet <strong>Centre de Synchronisation</strong> et cliquez sur <strong>"Tester Connexion"</strong>. Dès que le voyant vert apparaît, vous pouvez librement envoyer ou récupérer vos lots et mouvements en un clic !
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal to Clear Data */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-slate-900">
                Vider Complètement la Base de Données ?
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Cette action va effacer tous les lots de poissons et tous les mouvements de stock actuels pour laisser la base de données <strong>totalement vide et prête pour votre saisie réelle</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmClear}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/20 transition-all"
              >
                Oui, Vider la Base
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
