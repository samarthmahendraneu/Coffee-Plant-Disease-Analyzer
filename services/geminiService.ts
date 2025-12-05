import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    diagnosis: {
      type: Type.STRING,
      description: "The primary diagnosis. Specific possibilities: Leaf Rust, Coffee Berry Borer, White Stem Borer, Nitrogen/Magnesium/Zinc Deficiency, Water Stress, Sun Scorch, or Healthy."
    },
    scientificName: {
      type: Type.STRING,
      description: "Scientific name of the pest or pathogen (e.g., Hemileia vastatrix, Xylotrechus quadripes)."
    },
    plantPart: {
      type: Type.STRING,
      description: "The specific part of the plant identified in the image (e.g., Leaf, Berry, Stem, Root, Whole Plant)."
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score between 0 and 100 based on visual clarity and characteristic symptoms."
    },
    severity: {
      type: Type.STRING,
      enum: ["Healthy", "Low", "Moderate", "Critical"],
      description: "Severity of the infestation or deficiency."
    },
    visualIndicators: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific visual cues used to make the diagnosis (e.g., 'orange powdery spots', 'pinholes in berries', 'interveinal chlorosis')."
    },
    summary: {
      type: Type.STRING,
      description: "A concise, farmer-friendly explanation of the condition and its potential impact on yield."
    },
    immediateActions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-5 distinct, actionable steps for immediate treatment (chemical/organic options relevant to India)."
    },
    preventativeMeasures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Long-term cultural practices to prevent recurrence (e.g., shade management, soil amendment)."
    },
    riskFactors: {
      type: Type.OBJECT,
      properties: {
        pestRisk: { type: Type.NUMBER, description: "0-100" },
        diseaseRisk: { type: Type.NUMBER, description: "0-100" },
        environmentalStress: { type: Type.NUMBER, description: "0-100" },
        nutrientDeficiency: { type: Type.NUMBER, description: "0-100" }
      },
      required: ["pestRisk", "diseaseRisk", "environmentalStress", "nutrientDeficiency"]
    },
    weeklyPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          task: { type: Type.STRING },
          reason: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
        },
        required: ["day", "task", "reason", "priority"]
      },
      description: "A 7-day schedule for treatment and recovery."
    }
  },
  required: [
    "diagnosis", "plantPart", "severity", "confidence", "visualIndicators", 
    "summary", "immediateActions", "preventativeMeasures", "riskFactors", "weeklyPlan"
  ]
};

// Rubric for Health Score Calculation
const calculateHealthScore = (result: Omit<AnalysisResult, 'healthScore'>): number => {
  let score = 100;

  // 1. Severity Deduction
  switch (result.severity) {
    case 'Critical': score -= 70; break;
    case 'Moderate': score -= 40; break;
    case 'Low': score -= 15; break;
    case 'Healthy': score -= 0; break;
  }

  // 2. Risk Factor Deduction (Weighted)
  const riskDeduction = (
    (result.riskFactors.diseaseRisk * 0.1) +
    (result.riskFactors.pestRisk * 0.15) + // Pests are high risk in Chikmagalur
    (result.riskFactors.nutrientDeficiency * 0.05) +
    (result.riskFactors.environmentalStress * 0.05)
  );

  score -= riskDeduction;

  // 3. Normalize
  return Math.max(0, Math.min(100, Math.round(score)));
};

export const analyzePlantImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const prompt = `
      You are an expert Coffee Agronomist for the Coffee Board of India, specializing in the Chikmagalur and Kodagu regions.
      
      Analyze the provided image to diagnose coffee plant health. 
      
      ### REGIONAL CONTEXT (Chikmagalur):
      - **Key Pests**: White Stem Borer (severe threat), Coffee Berry Borer.
      - **Key Diseases**: Coffee Leaf Rust (Hemileia vastatrix), Black Rot.
      - **Common Deficiencies**: Nitrogen (yellowing), Magnesium (interveinal chlorosis), Zinc.
      - **Environment**: Shade-grown Robusta/Arabica, high dependence on monsoon and blossom showers.

      ### ANALYSIS OBJECTIVES:
      1. **Identify Plant Part**: Is it a leaf, berry cluster, stem/trunk, or soil?
      2. **Visual Evidence**: You MUST cite specific visual cues (e.g., "sawdust-like frass on stem" for Borer, "yellow halo" for Rust).
      3. **Diagnosis**: precise identification. If Healthy, state "Healthy". If unclear, state "Unclear/Blurry".
      4. **Recommendations**:
         - **Immediate**: Specific fungicides/pesticides used in India (e.g., Chlorpyrifos for Borer - *only if legal/safe*, Bordeaux mixture for Rust).
         - **Preventative**: Shade lopping, tracing, lime application.

      Output must be strictly valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Very low temperature for analytical precision
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const rawResult = JSON.parse(text);
    const healthScore = calculateHealthScore(rawResult);

    return { ...rawResult, healthScore };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};