

import { GoogleGenAI, Type } from "@google/genai";
import { ServiceCategory, AIAnalysisResult } from "../types";

const parseJsonClean = (text: string) => {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return null;
    }
};

export const analyzeServiceRequest = async (userDescription: string, language: string = 'sq'): Promise<AIAnalysisResult | null> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("No API Key provided for Gemini");
        return null;
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        
        // Use Translation Keys for categories so the UI can translate them dynamically
        const categories = "cat_plumbing, cat_electrical, cat_cleaning, cat_hvac, cat_landscaping, cat_moving, cat_general";
        
        const prompt = `
            You are a home service expert assistant. 
            A user has described a problem: "${userDescription}".
            
            1. Analyze the problem and map it to one of the following exact category keys: ${categories}.
            2. Provide a short reasoning in ${language === 'sq' ? 'Albanian' : 'English'} (max 1 sentence).
            3. Estimate a price range for this service (e.g., "$50 - $100").
            
            Return the result in JSON format.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        estimatedPriceRange: { type: Type.STRING },
                    },
                    required: ["category", "reasoning", "estimatedPriceRange"]
                }
            }
        });

        const text = response.text;
        if (!text) return null;

        const data = parseJsonClean(text);
        
        if (data) {
            return data as AIAnalysisResult;
        }
        return null;

    } catch (error) {
        console.error("Gemini API Error:", error);
        return null;
    }
};