import { IFoodDataProvider, FoodSearchResult, CanonicalFoodRecord } from './provider.interface.js';
import { ifctProvider } from './ifct.provider.js';
import { fssaiProvider } from './fssai.provider.js';
import { usdaProvider } from './usda.provider.js';
import { openFoodFactsProvider } from './openfoodfacts.provider.js';
import { getSourcePriority } from '../../modules/intelligence/sources.js';

export class FoodDataProviderRegistry {
  private providers: Map<string, IFoodDataProvider> = new Map();

  constructor() {
    this.registerProvider(ifctProvider);
    this.registerProvider(usdaProvider);
    this.registerProvider(openFoodFactsProvider);
  }

  registerProvider(provider: IFoodDataProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): IFoodDataProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): IFoodDataProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Search across all registered providers, ordered by hierarchy priority
   */
  async searchAll(query: string): Promise<FoodSearchResult[]> {
    const allResults: FoodSearchResult[] = [];

    for (const provider of this.providers.values()) {
      try {
        const results = await provider.search(query);
        allResults.push(...results);
      } catch (err) {
        console.warn(`Provider ${provider.id} search failed for '${query}':`, err);
      }
    }

    // Sort by priority rank then match score
    return allResults.sort((a, b) => {
      const rankDiff = getSourcePriority(b.sourceType) - getSourcePriority(a.sourceType);
      if (rankDiff !== 0) return rankDiff;
      return b.matchScore - a.matchScore;
    });
  }

  /**
   * Cross-reference barcode lookup across providers
   */
  async lookupBarcode(barcode: string): Promise<Array<{ providerId: string; record: CanonicalFoodRecord }>> {
    const hits: Array<{ providerId: string; record: CanonicalFoodRecord }> = [];

    for (const provider of this.providers.values()) {
      try {
        const results = await provider.search(barcode);
        for (const res of results) {
          const rec = await provider.getFood(res.id);
          if (rec) {
            hits.push({ providerId: provider.id, record: rec });
          }
        }
      } catch (err) {
        console.warn(`Barcode lookup on ${provider.id} failed:`, err);
      }
    }

    return hits;
  }
}

export const providerRegistry = new FoodDataProviderRegistry();
