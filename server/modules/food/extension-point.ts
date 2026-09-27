/**
 * Extension Point: Food Domain (Phase 3 & 4)
 * 
 * Future entities:
 * - FoodProduct
 * - FoodScan
 * - Ingredient
 * - NutritionProfile
 * - Meal
 * - MealLog
 * - FoodObservation
 * 
 * Future pipeline:
 * IMAGE -> VISION/OCR -> PRODUCT IDENTIFICATION -> PRODUCT DATA -> NUTRITION -> INGREDIENTS -> ANALYSIS
 */
export interface IFoodDomainService {
  identifyFood(imageInput: unknown): Promise<unknown>;
  lookupBarcode(barcode: string): Promise<unknown>;
  extractNutritionTable(ocrText: string): Promise<unknown>;
}

export const FOOD_DOMAIN_VERSION = 'v1-draft';
