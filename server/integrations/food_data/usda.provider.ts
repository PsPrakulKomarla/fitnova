import { CanonicalFoodRecord, FoodSearchResult, IFoodDataProvider, SourceFreshness, SourceMetadata } from './provider.interface.js';

export class USDAFDCProvider implements IFoodDataProvider {
  id = 'usda_fdc';
  name = 'USDA FoodData Central (Standard Reference & Foundation Foods)';
  sourceType = 'USDA_FDC' as const;

  private metadata: SourceMetadata = {
    datasetName: 'USDA FoodData Central',
    version: 'USDA_FDC_Release_2024_Q3',
    authority: 'Agricultural Research Service, U.S. Department of Agriculture',
    countryOrRegion: 'United States / Global Reference',
    sourceUrl: 'https://fdc.nal.usda.gov/',
    releaseDate: '2024-10-01',
    retrievedAt: '2026-01-20T00:00:00Z'
  };

  private records = new Map<string, CanonicalFoodRecord>();

  constructor() {
    this.seedUSDADataset();
  }

  private seedUSDADataset() {
    const items: Array<Partial<CanonicalFoodRecord> & { id: string; canonicalName: string; calories: number; protein: number; carbs: number; fat: number; satFat: number; sugars: number; fiber: number; sodium: number }> = [
      {
        id: 'fdc-175176',
        canonicalName: 'Chicken Breast (Meat only, cooked, roasted)',
        category: 'Poultry Products',
        servingSizeG: 100,
        calories: 165,
        protein: 31.0,
        carbs: 0.0,
        fat: 3.6,
        satFat: 1.0,
        sugars: 0.0,
        fiber: 0.0,
        sodium: 74
      },
      {
        id: 'fdc-175167',
        canonicalName: 'Egg (Whole, raw, fresh)',
        category: 'Dairy and Egg Products',
        servingSizeG: 100,
        calories: 143,
        protein: 12.6,
        carbs: 0.7,
        fat: 9.5,
        satFat: 3.1,
        sugars: 0.4,
        fiber: 0.0,
        sodium: 142
      },
      {
        id: 'fdc-170567',
        canonicalName: 'Quinoa (Cooked)',
        category: 'Cereal Grains and Pastas',
        servingSizeG: 100,
        calories: 120,
        protein: 4.4,
        carbs: 21.3,
        fat: 1.9,
        satFat: 0.2,
        sugars: 0.9,
        fiber: 2.8,
        sodium: 7
      },
      {
        id: 'fdc-173688',
        canonicalName: 'Salmon (Atlantic, wild, cooked, dry heat)',
        category: 'Finfish and Shellfish Products',
        servingSizeG: 100,
        calories: 182,
        protein: 25.4,
        carbs: 0.0,
        fat: 8.1,
        satFat: 1.3,
        sugars: 0.0,
        fiber: 0.0,
        sodium: 60
      }
    ];

    for (const item of items) {
      this.records.set(item.id, {
        id: item.id,
        canonicalName: item.canonicalName,
        category: item.category || 'General Food',
        sourceType: this.sourceType,
        datasetVersion: this.metadata.version,
        servingSizeG: item.servingSizeG || 100,
        nutritionPer100g: {
          basis: 'per_100g',
          servingSize: '100g',
          servingSizeBytes: 100,
          energyKcal: item.calories,
          proteinG: item.protein,
          carbohydratesG: item.carbs,
          sugarsG: item.sugars,
          fatG: item.fat,
          saturatedFatG: item.satFat,
          fiberG: item.fiber,
          sodiumMg: item.sodium,
          saltG: Math.round((item.sodium * 2.5) / 10) / 100
        }
      });
    }
  }

  async search(query: string): Promise<FoodSearchResult[]> {
    const q = query.toLowerCase();
    const results: FoodSearchResult[] = [];

    for (const record of this.records.values()) {
      if (record.canonicalName.toLowerCase().includes(q)) {
        results.push({
          id: record.id,
          name: record.canonicalName,
          sourceType: this.sourceType,
          datasetName: this.metadata.datasetName,
          category: record.category,
          proteinPer100g: record.nutritionPer100g.proteinG,
          caloriesPer100g: record.nutritionPer100g.energyKcal,
          matchScore: 0.88
        });
      }
    }
    return results;
  }

  async getFood(id: string): Promise<CanonicalFoodRecord | null> {
    return this.records.get(id) || null;
  }

  getMetadata(): SourceMetadata {
    return this.metadata;
  }

  checkFreshness(): SourceFreshness {
    return {
      lastChecked: new Date().toISOString(),
      lastUpdated: this.metadata.releaseDate,
      nextScheduledRefresh: '2026-10-01T00:00:00Z',
      status: 'FRESH'
    };
  }
}

export const usdaProvider = new USDAFDCProvider();
