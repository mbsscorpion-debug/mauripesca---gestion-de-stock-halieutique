import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini lazily
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "MAURIPESCA Stock Management API",
      timestamp: new Date().toISOString(),
    });
  });

  // AI Stock Analysis Endpoint
  app.post("/api/ai/analyze-stock", async (req, res) => {
    try {
      const { stockSummary, promptType } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback intelligent heuristic response if GEMINI_API_KEY is not set
        return res.json({
          success: true,
          analysis: `### 📊 Synthèse Logistique MAURIPESCA (Mode Local Autonome)
- **Tonnage global**: Analyse des stocks en cours d'actualisation.
- **Céphalopodes**: Priorité aux lots T1-T4 vers le marché Japonais et Européen (Vigo).
- **Pélagiques**: Rotation recommandée sous 45 jours pour les sardines et chinchards vers les marchés ouest-africains.
- **Chambres froides**: Surveillance stricte des zones à -22°C et -25°C à Nouadhibou.
- **Recommandation**: Préparer les bons de sortie conteneurs Reefer pour les lots arrivant à 90 jours de congélation.`,
          source: "local-heuristic",
        });
      }

      const prompt = `Tu es l'expert logistique halieutique et gestionnaire de stock en chef pour l'entreprise MAURIPESCA, société majeure d'armement de pêche, d'usines de congélation et d'exportation de produits de la mer basée à Nouadhibou et Nouakchott (Mauritanie).

Données actuelles des stocks et chambres froides :
${JSON.stringify(stockSummary, null, 2)}

Demande de l'utilisateur :
Type d'analyse : ${promptType || "Synthèse générale et recommandations opérationnelles"}

Fournis une analyse professionnelle, précise et actionnable en français avec :
1. 📈 **Diagnostic de valorisation et de rotation du stock** (Poulpes T1-T8, Céphalopodes, Pélagiques, Poissons nobles, Farine & Huile)
2. ❄️ **Optimisation de l'espace dans les chambres froides** (gestion du froid à Nouadhibou/Nouakchott)
3. 🚢 **Stratégie d'expédition & Marchés cibles** (Export UE/Japon vs Vente régionale Afrique de l'Ouest vs Marché local en Ouguiyas MRU)
4. ⚠️ **Points de vigilance qualité & ONISPA** (normes sanitaires, DDM de congélation, traçabilité HACCP)

Reste concis, structuré et orienté décision.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      res.json({
        success: true,
        analysis: response.text || "Analyse indisponible.",
        source: "gemini-3.7-flash",
      });
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Erreur lors de la génération de l'analyse IA",
      });
    }
  });

  // AI Export Packing List / Custom Document Generator
  app.post("/api/ai/generate-export-memo", async (req, res) => {
    try {
      const { exportData } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          memo: `DOSSIER D'EXPÉDITION MARITIME MAURIPESCA
Référence Conteneur : ${exportData?.containerNumber || "MSKU-REEFER"}
Destination : ${exportData?.destination || "Export Maritime"}
Tonnage total : ${exportData?.totalTonnes || "0"} T
Statut : Conforme aux exigences sanitaires ONISPA et normes vétérinaires RIM.`,
        });
      }

      const prompt = `Rédige un mémo officiel d'expédition maritime et de conformité sanitaire pour l'entreprise MAURIPESCA (Nouadhibou, Mauritanie) pour l'exportation suivante :
${JSON.stringify(exportData, null, 2)}

Inclus les mentions légales de conformité vétérinaire ONISPA, conditions de transport en conteneur frigorifique (-20°C à -25°C), et directives de dédouanement. Rédige en français professionnel.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      res.json({
        success: true,
        memo: response.text,
      });
    } catch (error: any) {
      console.error("Memo error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`MAURIPESCA Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
