import { MatchStatus, ProductEntity, ProductVersion } from '../food.models.js';

export interface MatchResult {
  status: MatchStatus;
  product?: ProductEntity;
  version?: ProductVersion;
  confidence: number;
  matchReason: string;
}

export class ProductCatalog {
  private products = new Map<string, ProductEntity>();
  private versions = new Map<string, ProductVersion>(); // versionId -> version
  private barcodeIndex = new Map<string, string>(); // barcode -> productId

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    // Verified Product 1: Core Power Shake
    const prod1Id = 'prod-core-power-26';
    const ver1Id = 'ver-cp-1';
    const prod1: ProductEntity = {
      id: prod1Id,
      barcode: '0811620021350',
      brand: 'Fairlife',
      name: 'Core Power Elite 26g Protein Shake',
      currentVersionId: ver1Id,
      matchConfidence: 1.0,
      matchStatus: 'EXACT_MATCH',
      createdAt: '2026-01-15T00:00:00Z'
    };
    const ver1: ProductVersion = {
      id: ver1Id,
      productId: prod1Id,
      versionNumber: 1,
      barcode: '0811620021350',
      productName: 'Core Power Elite 26g Protein Shake',
      brand: 'Fairlife',
      servingSize: '340 ml',
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
      ingredients: [
        { rawText: 'Filtered Lowfat Milk', canonicalName: 'Lowfat Milk', isAdditive: false },
        { rawText: 'Whey Protein Isolate', canonicalName: 'Whey Protein Isolate', isAdditive: false },
        { rawText: 'Carrageenan', canonicalName: 'Carrageenan', isAdditive: true, eNumber: 'E407' },
        { rawText: 'Sucralose', canonicalName: 'Sucralose', isAdditive: true, eNumber: 'E955' }
      ],
      verificationState: 'VERIFIED',
      provenance: [
        { field: 'barcode', source: 'barcode_database', confidence: 1.0, observedValue: '0811620021350', timestamp: '2026-01-15T00:00:00Z' }
      ],
      createdAt: '2026-01-15T00:00:00Z'
    };

    this.products.set(prod1Id, prod1);
    this.versions.set(ver1Id, ver1);
    this.barcodeIndex.set('0811620021350', prod1Id);

    // Verified Product 2: Crispy Hazelnut Wafer
    const prod2Id = 'prod-choco-wafer-45';
    const ver2Id = 'ver-cw-1';
    const prod2: ProductEntity = {
      id: prod2Id,
      barcode: '4008400404127',
      brand: 'ChocoCrisp',
      name: 'Crispy Hazelnut Chocolate Coated Wafer Bar',
      currentVersionId: ver2Id,
      matchConfidence: 1.0,
      matchStatus: 'EXACT_MATCH',
      createdAt: '2026-02-10T00:00:00Z'
    };
    const ver2: ProductVersion = {
      id: ver2Id,
      productId: prod2Id,
      versionNumber: 1,
      barcode: '4008400404127',
      productName: 'Crispy Hazelnut Chocolate Coated Wafer Bar',
      brand: 'ChocoCrisp',
      servingSize: '45g bar',
      nutrition: {
        basis: 'per_serving',
        servingSize: '45g',
        servingSizeBytes: 45,
        energyKcal: 245,
        proteinG: 2.6,
        carbohydratesG: 26.1,
        sugarsG: 19.8,
        fatG: 14.6,
        saturatedFatG: 7.4,
        fiberG: 0.9,
        sodiumMg: 99,
        saltG: 0.25
      },
      ingredients: [
        { rawText: 'Sugar', canonicalName: 'Sugar', isAdditive: false },
        { rawText: 'Wheat Flour', canonicalName: 'Wheat Flour', isAdditive: false },
        { rawText: 'Palm Oil', canonicalName: 'Palm Oil', isAdditive: false },
        { rawText: 'Soy Lecithin', canonicalName: 'Soy Lecithin', isAdditive: true, eNumber: 'E322' }
      ],
      verificationState: 'VERIFIED',
      provenance: [
        { field: 'barcode', source: 'barcode_database', confidence: 1.0, observedValue: '4008400404127', timestamp: '2026-02-10T00:00:00Z' }
      ],
      createdAt: '2026-02-10T00:00:00Z'
    };

    this.products.set(prod2Id, prod2);
    this.versions.set(ver2Id, ver2);
    this.barcodeIndex.set('4008400404127', prod2Id);
  }

  match(params: { barcode?: string | null; brand?: string | null; productName?: string | null }): MatchResult {
    // 1. Barcode Matching (Highest Priority)
    if (params.barcode) {
      const cleanBarcode = params.barcode.trim();
      const productId = this.barcodeIndex.get(cleanBarcode);
      if (productId) {
        const prod = this.products.get(productId)!;
        const ver = this.versions.get(prod.currentVersionId)!;
        return {
          status: 'EXACT_MATCH',
          product: prod,
          version: ver,
          confidence: 0.99,
          matchReason: `Exact GS1 barcode match (${cleanBarcode}) verified against certified product registry.`
        };
      }
    }

    // 2. Brand + Name Matching
    if (params.productName) {
      const searchName = params.productName.toLowerCase();
      const searchBrand = (params.brand || '').toLowerCase();

      for (const prod of this.products.values()) {
        const prodName = prod.name.toLowerCase();
        const prodBrand = prod.brand.toLowerCase();

        if (prodName === searchName || (prodBrand === searchBrand && prodName.includes(searchName))) {
          const ver = this.versions.get(prod.currentVersionId)!;
          return {
            status: 'EXACT_MATCH',
            product: prod,
            version: ver,
            confidence: 0.95,
            matchReason: `Exact brand ('${prod.brand}') and title match in catalog.`
          };
        }

        // Fuzzy similarity match
        if (searchName.includes(prodName.split(' ')[0]) && searchName.includes(prodBrand)) {
          const ver = this.versions.get(prod.currentVersionId)!;
          return {
            status: 'PROBABLE_MATCH',
            product: prod,
            version: ver,
            confidence: 0.78,
            matchReason: `Probable match with '${prod.name}' based on key token overlap.`
          };
        }
      }
    }

    // 3. Unknown Product
    return {
      status: 'UNKNOWN',
      confidence: 0.2,
      matchReason: 'No matching barcode or product signature found in verified catalog. Recorded as new unverified observation.'
    };
  }

  getProductById(id: string) {
    return this.products.get(id);
  }

  getVersionById(id: string) {
    return this.versions.get(id);
  }
}

export const productCatalog = new ProductCatalog();
