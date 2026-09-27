import { CanonicalFoodRecord, FoodSearchResult, IFoodDataProvider, SourceFreshness, SourceMetadata } from './provider.interface.js';

export class ICMRNINIFCTProvider implements IFoodDataProvider {
  id = 'icmr_nin_ifct_2017';
  name = 'ICMR-NIN Indian Food Composition Tables (IFCT 2017)';
  sourceType = 'ICMR_NIN_IFCT' as const;

  private metadata: SourceMetadata = {
    datasetName: 'Indian Food Composition Tables',
    version: 'IFCT_2017_v1.2',
    authority: 'ICMR - National Institute of Nutrition (Hyderabad, India)',
    countryOrRegion: 'India',
    sourceUrl: 'https://www.nin.res.in/ifct.html',
    releaseDate: '2017-01-01',
    retrievedAt: '2026-01-10T00:00:00Z'
  };

  private records: Map<string, CanonicalFoodRecord> = new Map();

  constructor() {
    this.seedIFCTDataset();
  }

  private seedIFCTDataset() {
    const items: Array<Partial<CanonicalFoodRecord> & { id: string; canonicalName: string; calories: number; protein: number; carbs: number; fat: number; fiber: number; sodium: number }> = [
      {
        id: 'ifct-moong-dal',
        canonicalName: 'Green Gram Split (Moong Dal)',
        commonIndianName: 'Mung / Moong Dal',
        category: 'Pulses and Legumes',
        servingSizeG: 100,
        calories: 348,
        protein: 24.5,
        carbs: 59.9,
        fat: 1.2,
        fiber: 16.3,
        sodium: 28.5
      },
      {
        id: 'ifct-paneer',
        canonicalName: 'Paneer (Cottage Cheese, Buffalo Milk)',
        commonIndianName: 'Paneer',
        category: 'Milk and Milk Products',
        servingSizeG: 100,
        calories: 257,
        protein: 18.3,
        carbs: 3.4,
        fat: 19.5,
        fiber: 0.0,
        sodium: 22.0
      },
      {
        id: 'ifct-roti-atta',
        canonicalName: 'Whole Wheat Flour (Atta Roti)',
        commonIndianName: 'Phulka / Chapati',
        category: 'Cereals and Millets',
        servingSizeG: 100,
        calories: 320,
        protein: 10.6,
        carbs: 64.9,
        fat: 1.5,
        fiber: 11.2,
        sodium: 9.0
      },
      {
        id: 'ifct-chana',
        canonicalName: 'Bengal Gram Whole (Kala Chana / Chickpeas)',
        commonIndianName: 'Chana / Garbanzo',
        category: 'Pulses and Legumes',
        servingSizeG: 100,
        calories: 328,
        protein: 17.1,
        carbs: 58.1,
        fat: 5.3,
        fiber: 25.2,
        sodium: 35.0
      },
      {
        id: 'ifct-basmati-rice',
        canonicalName: 'Milled Basmati Rice (Cooked)',
        commonIndianName: 'Chawal',
        category: 'Cereals and Millets',
        servingSizeG: 100,
        calories: 130,
        protein: 2.7,
        carbs: 28.2,
        fat: 0.3,
        fiber: 0.4,
        sodium: 1.2
      },
      {
        id: 'ifct-palak',
        canonicalName: 'Spinach (Palak, Raw Leaves)',
        commonIndianName: 'Palak',
        category: 'Green Leafy Vegetables',
        servingSizeG: 100,
        calories: 26,
        protein: 2.0,
        carbs: 2.9,
        fat: 0.7,
        fiber: 2.5,
        sodium: 58.5
      },
      {
        id: 'ifct-ghee',
        canonicalName: 'Clarified Butter (Desi Cow Ghee)',
        commonIndianName: 'Ghee',
        category: 'Fats and Edible Oils',
        servingSizeG: 100,
        calories: 900,
        protein: 0.0,
        carbs: 0.0,
        fat: 100.0,
        fiber: 0.0,
        sodium: 0.0
      }
    ];

    for (const item of items) {
      this.records.set(item.id, {
        id: item.id,
        canonicalName: item.canonicalName,
        commonIndianName: item.commonIndianName,
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
          sugarsG: null, // IFCT specifies total carbohydrates
          fatG: item.fat,
          saturatedFatG: null,
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
      const nameMatch = record.canonicalName.toLowerCase().includes(q);
      const hindiMatch = record.commonIndianName?.toLowerCase().includes(q);

      if (nameMatch || hindiMatch) {
        results.push({
          id: record.id,
          name: `${record.canonicalName} (${record.commonIndianName || ''})`,
          sourceType: this.sourceType,
          datasetName: this.metadata.datasetName,
          category: record.category,
          proteinPer100g: record.nutritionPer100g.proteinG,
          caloriesPer100g: record.nutritionPer100g.energyKcal,
          matchScore: hindiMatch ? 0.95 : 0.85
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
      nextScheduledRefresh: '2027-01-01T00:00:00Z',
      status: 'FRESH'
    };
  }
}

export const ifctProvider = new ICMRNINIFCTProvider();
