
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Schema definition for startup idea analysis using Gemini Type enum.
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    oneLineSummary: { type: Type.STRING, description: "A catchy, one-line summary of the idea that doesn't reveal the secret sauce but teases the value." },
    score: { type: Type.NUMBER },
    breakdown: {
      type: Type.OBJECT,
      properties: {
        innovation: { type: Type.NUMBER },
        market: { type: Type.NUMBER },
        feasibility: { type: Type.NUMBER },
        scalability: { type: Type.NUMBER },
        monetization: { type: Type.NUMBER },
      },
      required: ["innovation", "market", "feasibility", "scalability", "monetization"]
    },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    pitch: { type: Type.STRING },
  },
  required: ["oneLineSummary", "score", "breakdown", "strengths", "weaknesses", "suggestions", "pitch"]
};

export const analyzeStartupIdea = async (ideaDescription: string): Promise<AnalysisResult> => {
  // Always initialize GoogleGenAI with a configuration object containing the API key from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as an expert VC analyst. Evaluate this idea: "${ideaDescription}". Provide a punchy one-line summary, specific scores, and detailed feedback.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json", 
        responseSchema: analysisSchema 
      },
    });
    
    // Use .text property directly instead of calling it as a method.
    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response text returned from Gemini API");
    }
    
    return JSON.parse(responseText.trim()) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
