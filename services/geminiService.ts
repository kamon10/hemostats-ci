
import { GoogleGenAI, Type } from "@google/genai";
import { DistributionData, BloodGroup } from "../types";
import { BLOOD_GROUPS } from "../constants";

export const generateInsights = async (data: DistributionData, currentView: string) => {
  // Initialisation à chaque appel pour garantir l'utilisation de la clé API la plus récente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Pré-agrégation pour réduire la taille du prompt et éviter de saturer les jetons
  const siteSummary = data.monthlySite.map(r => ({
    product: r.productType,
    total: r.total,
    dist: BLOOD_GROUPS.filter(g => r.counts[g] > 0).map(g => `${g}:${r.counts[g]}`).join(', ')
  }));

  const nationalSummary = data.monthlyNational.map(r => ({
    product: r.productType,
    total: r.total
  }));

  const prompt = `
    En tant qu'expert médical pour HÉMOSTATS CI, analyse la distribution de ${data.metadata.site} (${currentView}).
    
    RÉSUMÉ SITE: ${JSON.stringify(siteSummary)}
    RÉSUMÉ NATIONAL: ${JSON.stringify(nationalSummary)}
    
    Identifie :
    1. Groupes en tension (forte demande/faible stock).
    2. Disparités vs moyenne nationale.
    3. Recommandations de collecte.
    
    Réponds en JSON uniquement.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  type: { type: Type.STRING } // Simplifié pour éviter les erreurs d'énumération strictes
                },
                required: ["title", "content", "type"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    // Extraction sécurisée du texte
    const text = response.text;
    if (!text) throw new Error("Réponse vide de l'IA");
    
    const result = JSON.parse(text);
    return result.insights || [];
  } catch (error: any) {
    console.error("Gemini Insight Error:", error);
    
    // Message d'erreur plus détaillé pour le débogage
    let errorMessage = "L'analyse automatique est temporairement indisponible.";
    if (error.message?.includes("API_KEY")) errorMessage = "Erreur de configuration de la clé API.";
    
    return [
      {
        title: "Analyse en pause",
        content: errorMessage,
        type: "warning"
      }
    ];
  }
};
