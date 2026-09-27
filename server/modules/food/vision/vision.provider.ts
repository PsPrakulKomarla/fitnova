import { GoogleGenAI } from '@google/genai';
import { config } from '../../../config/index.js';
import { NutritionData, IngredientItem } from '../food.models.js';

export interface FoodVisionExtractionOutput {
  productName: string | null;
  brand: string | null;
  detectedBarcode: string | null;
  servingSize: string | null;
  nutrition: NutritionData;
  ingredientsRaw: string | null;
  ingredientsParsed: IngredientItem[];
  missingFields: string[];
  confidence: number; // 0.0 to 1.0
  observationType: 'PACKAGED_LABEL' | 'MEAL_PHOTO' | 'BARCODE_ONLY';
}

export interface IFoodVisionProvider {
  name: string;
  extractFromImage(params: {
    base64Data: string;
    mimeType: string;
    textHint?: string;
  }): Promise<FoodVisionExtractionOutput>;
}

export class GeminiFoodVisionProvider implements IFoodVisionProvider {
  name = 'Gemini 3.8 Flash Food Vision OCR';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  async extractFromImage(params: {
    base64Data: string;
    mimeType: string;
    textHint?: string;
  }): Promise<FoodVisionExtractionOutput> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const prompt = `You are a strict, calibrated food label extraction and OCR engine for an adaptive nutrition system.
Analyze the provided image (food packaging, nutrition table, ingredient list, or meal photo).
CRITICAL RULES:
1. Extract ONLY what is genuinely legible or observable in the image.
2. If a nutrition value is NOT visible or NOT printed on the label, return NULL. NEVER invent, guess, or return 0 for unknown values. 0 means zero grams, while null means unobserved.
3. If an ingredient list is visible, capture the EXACT verbatim text in "ingredientsRaw", then parse individual ingredients in "ingredientsParsed".
4. If a barcode is visible, read its numerical digits in "detectedBarcode".

Return ONLY a valid JSON object matching this exact structure:
{
  "productName": string or null,
  "brand": string or null,
  "detectedBarcode": string or null,
  "servingSize": string or null,
  "observationType": "PACKAGED_LABEL" | "MEAL_PHOTO" | "BARCODE_ONLY",
  "nutrition": {
    "basis": "per_100g" | "per_serving" | "per_100ml",
    "servingSize": string or null,
    "servingSizeBytes": number or null,
    "energyKcal": number or null,
    "proteinG": number or null,
    "carbohydratesG": number or null,
    "sugarsG": number or null,
    "fatG": number or null,
    "saturatedFatG": number or null,
    "fiberG": number or null,
    "sodiumMg": number or null,
    "saltG": number or null
  },
  "ingredientsRaw": string or null,
  "ingredientsParsed": [
    {
      "rawText": "exact text from label",
      "canonicalName": "standardized name",
      "isAdditive": boolean,
      "eNumber": string or null,
      "allergenWarning": string or null
    }
  ],
  "confidence": number between 0.1 and 1.0,
  "missingFields": [
    "list of fields that could not be verified from the image, e.g. 'nutrition.fiberG', 'nutrition.saturatedFatG'"
  ]
}`;

    const contents: any[] = [
      {
        inlineData: {
          data: params.base64Data.replace(/^data:image\/[a-z]+;base64,/, ''),
          mimeType: params.mimeType || 'image/jpeg'
        }
      },
      prompt
    ];

    if (params.textHint) {
      contents.push(`User context hint: ${params.textHint}`);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1
      }
    });

    const parsed: FoodVisionExtractionOutput = JSON.parse(response.text?.trim() || '{}');
    return sanitizeExtraction(parsed);
  }
}

export class MockFoodVisionProvider implements IFoodVisionProvider {
  name = 'Deterministic Mock Food Vision (Testing)';

  async extractFromImage(params: {
    base64Data: string;
    mimeType: string;
    textHint?: string;
  }): Promise<FoodVisionExtractionOutput> {
    const hint = (params.textHint || '').toLowerCase();

    if (hint.includes('shake') || hint.includes('core power')) {
      return {
        productName: 'Core Power Elite 26g Protein Shake',
        brand: 'Fairlife',
        detectedBarcode: '0811620021350',
        servingSize: '340 ml bottle',
        observationType: 'PACKAGED_LABEL',
        nutrition: {
          basis: 'per_serving',
          servingSize: '340 ml',
          servingSizeBytes: 340,
          energyKcal: 170,
          proteinG: 26.0,
          carbohydratesG: 8.0,
          sugarsG: 5.0,
          fatG: 3.5,
          saturatedFatG: 2.0,
          fiberG: 1.0,
          sodiumMg: 260,
          saltG: 0.65
        },
        ingredientsRaw: 'Filtered Lowfat Milk, Whey Protein Isolate, Carrageenan, Sucralose, Sunflower Lecithin, Lactase Enzyme',
        ingredientsParsed: [
          { rawText: 'Filtered Lowfat Milk', canonicalName: 'Lowfat Milk', isAdditive: false },
          { rawText: 'Whey Protein Isolate', canonicalName: 'Whey Protein Isolate', isAdditive: false },
          { rawText: 'Carrageenan', canonicalName: 'Carrageenan', isAdditive: true, eNumber: 'E407' },
          { rawText: 'Sucralose', canonicalName: 'Sucralose', isAdditive: true, eNumber: 'E955' },
          { rawText: 'Sunflower Lecithin', canonicalName: 'Sunflower Lecithin', isAdditive: true, eNumber: 'E322' }
        ],
        confidence: 0.98,
        missingFields: []
      };
    }

    if (hint.includes('front_only') || hint.includes('missing_nutrition')) {
      // Demonstrates missing information behavior: front of packet recognized, nutrition unverified
      return {
        productName: 'Organic Crunchy Peanut Butter Energy Bar',
        brand: 'PureTrail',
        detectedBarcode: '850012345678',
        servingSize: null,
        observationType: 'PACKAGED_LABEL',
        nutrition: {
          basis: 'per_100g',
          servingSize: null,
          servingSizeBytes: null,
          energyKcal: null, // NULL, not 0!
          proteinG: null,
          carbohydratesG: null,
          sugarsG: null,
          fatG: null,
          saturatedFatG: null,
          fiberG: null,
          sodiumMg: null,
          saltG: null
        },
        ingredientsRaw: null,
        ingredientsParsed: [],
        confidence: 0.65,
        missingFields: [
          'nutrition.energyKcal',
          'nutrition.proteinG',
          'nutrition.carbohydratesG',
          'nutrition.sugarsG',
          'nutrition.fatG',
          'nutrition.saturatedFatG',
          'ingredients'
        ]
      };
    }

    // Default: Greek Yogurt Bowl
    return {
      productName: 'Greek Yogurt High Protein Bowl',
      brand: 'Artisan Kitchen',
      detectedBarcode: null,
      servingSize: '220g bowl',
      observationType: 'PACKAGED_LABEL',
      nutrition: {
        basis: 'per_serving',
        servingSize: '220g',
        servingSizeBytes: 220,
        energyKcal: 195,
        proteinG: 21.0,
        carbohydratesG: 18.0,
        sugarsG: 11.2,
        fatG: 3.1,
        saturatedFatG: 1.1,
        fiberG: 5.0,
        sodiumMg: 95,
        saltG: 0.24
      },
      ingredientsRaw: 'Cultured Strained Skim Milk, Fresh Blueberries, Whole Chia Seeds, Pure Honey',
      ingredientsParsed: [
        { rawText: 'Cultured Strained Skim Milk', canonicalName: 'Strained Skim Milk (Greek Yogurt)', isAdditive: false },
        { rawText: 'Fresh Blueberries', canonicalName: 'Blueberries', isAdditive: false },
        { rawText: 'Whole Chia Seeds', canonicalName: 'Chia Seeds', isAdditive: false },
        { rawText: 'Pure Honey', canonicalName: 'Honey', isAdditive: false }
      ],
      confidence: 0.94,
      missingFields: []
    };
  }
}

function sanitizeExtraction(raw: any): FoodVisionExtractionOutput {
  const missing: string[] = [];
  const n = raw.nutrition || {};

  const fieldsToCheck = [
    ['energyKcal', 'nutrition.energyKcal'],
    ['proteinG', 'nutrition.proteinG'],
    ['carbohydratesG', 'nutrition.carbohydratesG'],
    ['fatG', 'nutrition.fatG'],
    ['sugarsG', 'nutrition.sugarsG'],
    ['saturatedFatG', 'nutrition.saturatedFatG'],
    ['sodiumMg', 'nutrition.sodiumMg']
  ];

  for (const [key, label] of fieldsToCheck) {
    if (n[key] === null || n[key] === undefined) {
      missing.push(label);
    }
  }

  if (!raw.ingredientsRaw && (!raw.ingredientsParsed || raw.ingredientsParsed.length === 0)) {
    missing.push('ingredients');
  }

  return {
    productName: raw.productName || null,
    brand: raw.brand || null,
    detectedBarcode: raw.detectedBarcode || null,
    servingSize: raw.servingSize || null,
    observationType: raw.observationType || 'PACKAGED_LABEL',
    nutrition: {
      basis: n.basis || 'per_100g',
      servingSize: n.servingSize || raw.servingSize || null,
      servingSizeBytes: n.servingSizeBytes || null,
      energyKcal: typeof n.energyKcal === 'number' ? n.energyKcal : null,
      proteinG: typeof n.proteinG === 'number' ? n.proteinG : null,
      carbohydratesG: typeof n.carbohydratesG === 'number' ? n.carbohydratesG : null,
      sugarsG: typeof n.sugarsG === 'number' ? n.sugarsG : null,
      fatG: typeof n.fatG === 'number' ? n.fatG : null,
      saturatedFatG: typeof n.saturatedFatG === 'number' ? n.saturatedFatG : null,
      fiberG: typeof n.fiberG === 'number' ? n.fiberG : null,
      sodiumMg: typeof n.sodiumMg === 'number' ? n.sodiumMg : null,
      saltG: typeof n.saltG === 'number' ? n.saltG : null
    },
    ingredientsRaw: raw.ingredientsRaw || null,
    ingredientsParsed: Array.isArray(raw.ingredientsParsed) ? raw.ingredientsParsed : [],
    missingFields: Array.from(new Set([...(raw.missingFields || []), ...missing])),
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.8
  };
}

export function getFoodVisionProvider(): IFoodVisionProvider {
  if (config.ai.apiKey) {
    return new GeminiFoodVisionProvider(config.ai.apiKey);
  }
  return new MockFoodVisionProvider();
}
