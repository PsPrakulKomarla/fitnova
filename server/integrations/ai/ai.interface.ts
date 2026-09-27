export interface FoodAnalysisRequest {
  imageBase64?: string;
  mimeType?: string;
  textDescription?: string;
}

export interface RawFoodExtraction {
  name: string;
  brand?: string;
  barcode?: string;
  servingSizeG: number;
  servingUnit: string;
  caloriesPer100g: number;
  proteinGPer100g: number;
  carbsGPer100g: number;
  fatGPer100g: number;
  saturatedFatGPer100g: number;
  sugarsGPer100g: number;
  fiberGPer100g: number;
  sodiumMgPer100g: number;
  fruitVegPercent: number;
  rawLabelIngredients: string;
  confidence: 'VERIFIED' | 'HIGH' | 'ESTIMATED' | 'PARTIAL' | 'UNVERIFIED';
  provenance: string;
  uncertaintyNotes?: string;
}

export interface IAIProvider {
  name: string;
  analyzeFood(request: FoodAnalysisRequest): Promise<RawFoodExtraction>;
}
