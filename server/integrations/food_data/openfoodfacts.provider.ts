import { CanonicalFoodRecord, FoodSearchResult, IFoodDataProvider, SourceFreshness, SourceMetadata } from './provider.interface.js';

export class OpenFoodFactsProvider implements IFoodDataProvider {
  id = 'open_food_facts';
  name = 'Open Food Facts (Crowdsourced Product Cross-Reference)';
  sourceType = 'OPEN_FOOD_FACTS' as const;

  private metadata: SourceMetadata = {
    datasetName: 'Open Food Facts World Database',
    version: 'OFF_Snapshot_2026_Q1',
    authority: 'Open Food Facts Association (Non-profit community)',
    countryOrRegion: 'International',
    sourceUrl: 'https://world.openfoodfacts.org/',
    releaseDate: '2026-01-01',
    retrievedAt: '2026-01-15T00:00:00Z'
  };

  private barcodeMap = new Map<string, CanonicalFoodRecord>();

  constructor() {
    this.seedOFFDatabase();
  }

  private seedOFFDatabase() {
    // Packaged reference for cross-checking: Core Power Shake
    this.barcodeMap.set('0811620021350', {
      id: 'off-0811620021350',
      canonicalName: 'Core Power Elite High Protein Milk Shake',
      category: 'Beverages',
      sourceType: this.sourceType,
      datasetVersion: this.metadata.version,
      servingSizeG: 340,
      nutritionPer100g: {
        basis: 'per_100g',
        servingSize: '340 ml',
        servingSizeBytes: 340,
        energyKcal: 50,
        proteinG: 7.6, // User label has 26g per 340ml bottle = 7.64g/100g
        carbohydratesG: 2.3,
        sugarsG: 1.5,
        fatG: 1.0,
        saturatedFatG: 0.6,
        fiberG: 0.3,
        sodiumMg: 75,
        saltG: 0.19
      }
    });

    // Reference with deliberate discrepancy for conflict detection demonstration:
    // User packet says 18g protein / 100g, but OFF snapshot has 15g protein
    this.barcodeMap.set('8901234567890', {
      id: 'off-8901234567890',
      canonicalName: 'High Protein Oats & Almond Bar',
      category: 'Snack Foods',
      sourceType: this.sourceType,
      datasetVersion: this.metadata.version,
      servingSizeG: 50,
      nutritionPer100g: {
        basis: 'per_100g',
        servingSize: '50g',
        servingSizeBytes: 50,
        energyKcal: 420,
        proteinG: 15.0, // Discrepancy!
        carbohydratesG: 54.0,
        sugarsG: 18.0,
        fatG: 14.0,
        saturatedFatG: 3.5,
        fiberG: 8.0,
        sodiumMg: 180,
        saltG: 0.45
      }
    });
  }

  async search(query: string): Promise<FoodSearchResult[]> {
    const q = query.trim();
    const results: FoodSearchResult[] = [];

    // Barcode query
    if (this.barcodeMap.has(q)) {
      const rec = this.barcodeMap.get(q)!;
      results.push({
        id: rec.id,
        name: rec.canonicalName,
        sourceType: this.sourceType,
        datasetName: this.metadata.datasetName,
        category: rec.category,
        proteinPer100g: rec.nutritionPer100g.proteinG,
        caloriesPer100g: rec.nutritionPer100g.energyKcal,
        matchScore: 0.99
      });
      return results;
    }

    for (const rec of this.barcodeMap.values()) {
      if (rec.canonicalName.toLowerCase().includes(q.toLowerCase())) {
        results.push({
          id: rec.id,
          name: rec.canonicalName,
          sourceType: this.sourceType,
          datasetName: this.metadata.datasetName,
          category: rec.category,
          proteinPer100g: rec.nutritionPer100g.proteinG,
          caloriesPer100g: rec.nutritionPer100g.energyKcal,
          matchScore: 0.8
        });
      }
    }

    return results;
  }

  async getFood(id: string): Promise<CanonicalFoodRecord | null> {
    for (const rec of this.barcodeMap.values()) {
      if (rec.id === id) return rec;
    }
    return null;
  }

  getMetadata(): SourceMetadata {
    return this.metadata;
  }

  checkFreshness(): SourceFreshness {
    return {
      lastChecked: new Date().toISOString(),
      lastUpdated: this.metadata.releaseDate,
      nextScheduledRefresh: '2026-04-01T00:00:00Z',
      status: 'FRESH'
    };
  }
}

export const openFoodFactsProvider = new OpenFoodFactsProvider();
