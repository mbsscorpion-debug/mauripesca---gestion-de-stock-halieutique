import React, { useState } from "react";
import { StockItem, ColdRoom, StockMovement } from "../types";
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  TrendingUp, 
  ThermometerSnowflake, 
  Ship, 
  ShieldAlert, 
  Copy, 
  Check, 
  FileText,
  Boxes,
  Zap
} from "lucide-react";

interface AiAssistantViewProps {
  stockItems?: StockItem[];
  coldRooms?: ColdRoom[];
  movements?: StockMovement[];
  activeCurrency?: "MRU" | "EUR" | "USD";
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  stockItems = [],
  coldRooms = [],
  movements = [],
  activeCurrency = "MRU",
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>("SYNTHESE");

  const runAnalysis = async (presetType?: string, customPrompt?: string) => {
    setLoading(true);
    setAnalysisResult(null);

    const type = presetType || activePreset;
    const safeStock = stockItems || [];
    const safeRooms = coldRooms || [];
    const safeMovements = movements || [];

    const stockSummary = {
      totalLots: safeStock.length,
      totalTonnage: safeStock.reduce((acc, i) => acc + i.totalWeightTonnes, 0),
      totalCartons: safeStock.reduce((acc, i) => acc + i.cartonCount, 0),
      totalValueMRU: safeStock.reduce((acc, i) => acc + i.totalWeightKg * i.unitPriceMRUPerKg, 0),
      categoriesBreakdown: {
        cephalopodesTonnes: safeStock.filter(i => i.category === "Céphalopodes").reduce((acc, i) => acc + i.totalWeightTonnes, 0),
        pelagiquesTonnes: safeStock.filter(i => i.category === "Pélagiques").reduce((acc, i) => acc + i.totalWeightTonnes, 0),
        noblesTonnes: safeStock.filter(i => i.category === "Démersaux / Poissons Nobles").reduce((acc, i) => acc + i.totalWeightTonnes, 0),
        farineHuileTonnes: safeStock.filter(i => i.category === "Farine & Huile de Poisson").reduce((acc, i) => acc + i.totalWeightTonnes, 0),
      },
      coldRooms: safeRooms.map(r => ({
        name: r.name,
        location: r.location,
        occupancyPercent: Math.round((r.currentTonnes / (r.capacityTonnes || 1)) * 100),
        currentTemp: r.currentTempCelsius,
        targetTemp: r.targetTempCelsius,
        status: r.status,
      })),
      recentMovementsCount: safeMovements.length,
    };

    try {
      const response = await fetch("/api/ai/analyze-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stockSummary,
          promptType: customPrompt || type,
        }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        setAnalysisResult(
          "Erreur lors de l'analyse. Veuillez vérifier la connexion ou l'état du serveur."
        );
      }
    } catch (err) {
      console.error(err);
      setAnalysisResult(
        "Impossible de joindre le service d'analyse IA. Vérifiez que le serveur fonctionne."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const presets = [
    {
      id: "SYNTHESE",
      label: "Synthèse Globale & Valorisation",
      icon: TrendingUp,
      desc: "Audit complet des tonnages, valorisations en devises et marges export",
    },
    {
      id: "ROTATION_FRIGO",
      label: "Optimisation Rotation Chambres Froides",
      icon: ThermometerSnowflake,
      desc: "Détection des lots à expédier en priorité pour libérer l'espace à Nouadhibou",
    },
    {
      id: "STRATEGIE_EXPORT",
      label: "Opportunités Marchés Export (Asie / UE)",
      icon: Ship,
      desc: "Orientation des poulpes T1-T4, seiches et poissons nobles vers les meilleurs acheteurs",
    },
    {
      id: "CONFORMITE_DDM",
      label: "Contrôle Qualité & DDM Congélation",
      icon: ShieldAlert,
      desc: "Surveillance de l'âge des lots congelés et respect strict des normes HACCP / ONISPA",
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
          <span>Intelligence Halieutique & Analyse Logistique (Gemini)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Assistant IA de Gestion des Stocks MAURIPESCA
        </h1>
        <p className="text-sm text-slate-300 mt-1.5 max-w-3xl">
          Analyse stratégique en temps réel du stock congelé, calcul prédictif des rotations dans les entrepôts frigorifiques de Nouadhibou et Nouakchott, et recommandations pour l'exportation maritime.
        </p>
      </div>

      {/* Preset Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = activePreset === p.id;

          return (
            <div
              key={p.id}
              onClick={() => {
                setActivePreset(p.id);
                runAnalysis(p.id);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-cyan-950 text-white border-cyan-500 shadow-md ring-1 ring-cyan-500"
                  : "bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50 shadow-xs"
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-100 mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">{p.label}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <button
                disabled={loading}
                className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analyser</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Prompt Box */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (prompt.trim()) {
              runAnalysis("CUSTOM", prompt);
            }
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Posez une question spécifique (ex: Quels lots de poulpe préparer pour un conteneur vers le Japon ?)..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shrink-0 transition-all shadow-xs"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Interroger l'IA</span>
          </button>
        </form>
      </div>

      {/* Analysis Result Card */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Génération de l'analyse halieutique en cours...
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Calcul des stocks, examen des températures de stockage et évaluation des marchés d'exportation.
            </p>
          </div>
        </div>
      ) : analysisResult ? (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2 text-cyan-800 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-cyan-600" />
              <span>Rapport d'Analyse IA MAURIPESCA</span>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copier le rapport</span>
                </>
              )}
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-line text-xs sm:text-sm font-sans bg-slate-50/50 p-6 rounded-xl border border-slate-100">
            {analysisResult}
          </div>
        </div>
      ) : null}

    </div>
  );
};
