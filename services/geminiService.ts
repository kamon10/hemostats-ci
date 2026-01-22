
import { GoogleGenAI, Type } from "@google/genai";
import { DistributionData } from "../types";

export const generateInsights = async (data: DistributionData, currentView: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    En tant qu'expert en analyse de données médicales pour HÉMOSTATS CI (Système d'analyse de distribution sanguine de Côte d'Ivoire), analyse les données suivantes pour le site de ${data.metadata.site} en vue de ${currentView}.
    
    Données du site: ${JSON.stringify(data.monthlySite)}
    Données nationales: ${JSON.stringify(data.monthlyNational)}
    
    Ta mission est d'identifier:
    1. Les groupes sanguins en tension (forte demande vs stock habituel).
    2. Les disparités entre les besoins du site et la moyenne nationale.
    3. Des recommandations concrètes pour la prochaine campagne de collecte.
    
    Réponds uniquement au format JSON avec la structure suivante :
    {
      "insights": [
        { "title": "...", "content": "...", "type": "info" | "warning" | "success" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
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
                  type: { type: Type.STRING, enum: ["info", "warning", "success"] }
                },
                required: ["title", "content", "type"]
              }
            }
          },
          required: ["insights"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"insights": []}');
    return result.insights;
  } catch (error) {
    console.error("Gemini Insight generation failed:", error);
    return [
      {
        title: "Analyse Indisponible",
        content: "Impossible de générer des insights pour le moment. Vérifiez votre connexion ou la clé API.",
        type: "warning"
      }
    ];
  }
};
