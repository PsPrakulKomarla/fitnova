import { GoogleGenAI } from '@google/genai';
import { FoodAnalysisRequest, IAIProvider, RawFoodExtraction } from './ai.interface.js';

export class GeminiAIAdapter implements IAIProvider {
  name = 'Google Gemini AI (gemini-3.8-flash)';
  private apiKey: string | undefined;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async analyzeFood(request: FoodAnalysisRequest): Promise<RawFoodExtraction> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured for GeminiAIAdapter');
    }

    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const prompt = `You are a strict, calibrated food data extraction and OCR agent for an adaptive nutrition system.
Analyze the provided image (food item, packaged product, or nutrition facts label) or text description.
Extract ONLY what is visible or scientifically justifiable. DO NOT fabricate exact numbers if invisible.
If the food is an unprepared whole meal on a plate, provide an ESTIMATED nutritional breakdown with confidence: "ESTIMATED".
If it is a packaged product nutrition table, read the declared values with confidence: "HIGH" or "VERIFIED".

Return a valid JSON object matching this schema:
{
  "name": "Exact food name or product name",
  "brand": "Brand name if applicable, or empty string",
  "barcode": "Barcode numbers if legible, or empty string",
  "servingSizeG": number,
  "servingUnit": "g" or "ml" or "portion",
  "caloriesPer100g": number (kcal per 100g),
  "proteinGPer100g": number (grams per 100g),
  "carbsGPer100g": number (grams per 100g),
  "fatGPer100g": number (grams per 100g),
  "saturatedFatGPer100g": number (grams per 100g),
  "sugarsGPer100g": number (grams per 100g),
  "fiberGPer100g": number (grams per 100g),
  "sodiumMgPer100g": number (milligrams per 100g),
  "fruitVegPercent": number (0-100),
  "rawLabelIngredients": "Verbatim ingredients from label or main ingredients separated by comma",
  "confidence": "VERIFIED" | "HIGH" | "ESTIMATED" | "PARTIAL" | "UNVERIFIED",
  "provenance": "Brief note on source (e.g. Gemini 3.8 Flash Multimodal OCR)",
  "uncertaintyNotes": "Any unconfirmed assumptions or estimated parameters"
}`;

    const contents: any[] = [];
    if (request.imageBase64 && request.mimeType) {
      contents.push({
        inlineData: {
          data: request.imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: request.mimeType || 'image/jpeg'
        }
      });
    }

    contents.push(
      request.textDescription
        ? `${prompt}\n\nUser Context/Input: "${request.textDescription}"`
        : prompt
    );

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const responseText = response.text?.trim() || '{}';
    return JSON.parse(responseText);
  }
}
