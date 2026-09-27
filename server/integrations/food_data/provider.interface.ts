import { DataSourceType, StalenessStatus } from '../../modules/intelligence/sources.js';
import { NutritionData } from '../../modules/food/food.models.js';

export interface SourceMetadata {
  datasetName: string;
  version: string;
  authority: string;
  countryOrRegion: string;
  sourceUrl: string;
  releaseDate: string;
  retrievedAt: string;
}

export interface SourceFreshness {
  lastChecked: string;
  lastUpdated: string;
  nextScheduledRefresh: string;
  status: StalenessStatus;
}

export interface CanonicalFoodRecord {
  id: string;
  canonicalName: string;
  category: string;
  sourceType: DataSourceType;
  datasetVersion: string;
  servingSizeG: number;
  nutritionPer100g: NutritionData;
  commonIndianName?: string;
  fssaiCategoryCode?: string;
  ingredients?: string[];
  allergens?: string[];
}

export interface FoodSearchResult {
  id: string;
  name: string;
  sourceType: DataSourceType;
  datasetName: string;
  category: string;
  proteinPer100g: number | null;
  caloriesPer100g: number | null;
  matchScore: number;
}

export interface IFoodDataProvider {
  id: string;
  name: string;
  sourceType: DataSourceType;
  search(query: string): Promise<FoodSearchResult[]>;
  getFood(id: string): Promise<CanonicalFoodRecord | null>;
  getMetadata(): SourceMetadata;
  checkFreshness(): SourceFreshness;
}
