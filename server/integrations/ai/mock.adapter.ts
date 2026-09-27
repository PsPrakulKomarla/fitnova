import { FoodAnalysisRequest, IAIProvider, RawFoodExtraction } from './ai.interface.js';

export class MockAIAdapter implements IAIProvider {
  name = 'Deterministic Mock AI Adapter (Offline / Testing)';

  async analyzeFood(request: FoodAnalysisRequest): Promise<RawFoodExtraction> {
    const text = (request.textDescription || '').toLowerCase();

    if (text.includes('shake') || text.includes('fairlife') || text.includes('core power')) {
      return {
        name: 'Core Power Elite 26g Protein Shake',
        brand: 'Fairlife',
        barcode: '0811620021350',
        servingSizeG: 340,
        servingUnit: 'ml bottle',
        caloriesPer100g: 50,
        proteinGPer100g: 7.6,
        carbsGPer100g: 2.3,
        fatGPer100g: 1.0,
        saturatedFatGPer100g: 0.6,
        sugarsGPer100g: 1.5,
        fiberGPer100g: 0.3,
        sodiumMgPer100g: 75,
        fruitVegPercent: 0,
        rawLabelIngredients: 'Filtered Lowfat Milk, Whey Protein Isolate, Carrageenan (E407), Sucralose (E955), Sunflower Lecithin (E322), Lactase Enzyme, Vitamin D3',
        confidence: 'VERIFIED',
        provenance: 'Verified Packaging OCR Record #FL-081162'
      };
    }

    if (text.includes('wafer') || text.includes('chocolate') || text.includes('snack')) {
      return {
        name: 'Crispy Hazelnut Chocolate Coated Wafer Bar',
        brand: 'ChocoCrisp',
        barcode: '4008400404127',
        servingSizeG: 45,
        servingUnit: 'bar',
        caloriesPer100g: 545,
        proteinGPer100g: 5.8,
        carbsGPer100g: 58.0,
        fatGPer100g: 32.5,
        saturatedFatGPer100g: 16.4,
        sugarsGPer100g: 44.0,
        fiberGPer100g: 2.1,
        sodiumMgPer100g: 220,
        fruitVegPercent: 0,
        rawLabelIngredients: 'Sugar, Wheat Flour, Palm Kernel Oil, Cocoa Butter, Skimmed Milk Powder, Hazelnuts, Cocoa Mass, Soy Lecithin (E322), Sodium Bicarbonate, Vanillin',
        confidence: 'VERIFIED',
        provenance: 'Verified Label OCR Record #WF-400840'
      };
    }

    if (text.includes('salmon') || text.includes('quinoa')) {
      return {
        name: 'Atlantic Salmon with Tri-Color Quinoa & Asparagus',
        brand: 'Fresh Kitchen',
        servingSizeG: 350,
        servingUnit: 'plate',
        caloriesPer100g: 145,
        proteinGPer100g: 11.2,
        carbsGPer100g: 10.5,
        fatGPer100g: 6.2,
        saturatedFatGPer100g: 1.1,
        sugarsGPer100g: 1.2,
        fiberGPer100g: 2.8,
        sodiumMgPer100g: 110,
        fruitVegPercent: 35,
        rawLabelIngredients: 'Atlantic Salmon (Salmo Salar), Whole Grain Quinoa, Fresh Green Asparagus, Extra Virgin Olive Oil, Sea Salt, Cracked Black Pepper, Lemon Juice',
        confidence: 'HIGH',
        provenance: 'Volumetric Meal Vision & USDA Standard Composition Table'
      };
    }

    // Default Greek Yogurt Bowl
    return {
      name: 'Greek Yogurt High Protein Bowl with Berries & Chia Seeds',
      brand: 'Artisan Kitchen',
      servingSizeG: 220,
      servingUnit: 'bowl',
      caloriesPer100g: 88,
      proteinGPer100g: 9.5,
      carbsGPer100g: 8.2,
      fatGPer100g: 1.4,
      saturatedFatGPer100g: 0.5,
      sugarsGPer100g: 5.1,
      fiberGPer100g: 2.3,
      sodiumMgPer100g: 45,
      fruitVegPercent: 42,
      rawLabelIngredients: 'Cultured Strained Skim Milk (Greek Yogurt), Fresh Blueberries, Organic Strawberries, Whole Chia Seeds, Pure Honey, Natural Vanilla Extract',
      confidence: 'HIGH',
      provenance: 'Certified Dairy Composition Reference Model'
    };
  }
}
