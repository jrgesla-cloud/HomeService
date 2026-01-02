
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
    try {
        // ALWAYS use named parameter for apiKey from process.env.API_KEY
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Use Translation Keys for categories
        const categories = "cat_plumbing, cat_electrical, cat_cleaning, cat_hvac, cat_landscaping, cat_moving, cat_general";
        
        const prompt = `
            You are a home service expert assistant. 
            A user has described a problem: "${userDescription}".
            
            1. Analyze the problem and map it to one of the following exact category keys: ${categories}.
            2. Provide a short reasoning in ${language === 'sq' ? 'Albanian' : 'English'} (max 1 sentence).
            3. Estimate a price range for this service (e.g., "$50 - $100").
            
            Return the result in JSON format.
        `;

        // Using gemini-3-flash-preview for Basic Text Tasks
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: { 
                            type: Type.STRING,
                            description: "The category key of the service."
                        },
                        reasoning: { 
                            type: Type.STRING,
                            description: "Reasoning for the selection."
                        },
                        estimatedPriceRange: { 
                            type: Type.STRING,
                            description: "Estimated cost range."
                        },
                    },
                    required: ["category", "reasoning", "estimatedPriceRange"]
                }
            }
        });

        // Use .text property directly to extract text content
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
