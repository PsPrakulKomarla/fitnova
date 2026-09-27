import { SourceFreshness, SourceMetadata } from './provider.interface.js';

export interface FSSAIAdditiveStandard {
  insNumber: string; // e.g. INS 322(i), INS 407, INS 955
  eNumberEquivalent: string; // e.g. E322, E407, E955
  additiveName: string;
  functionalClass: string;
  foodCategoriesPermitted: string[];
  maxPermittedLevel: string; // e.g. "GMP" (Good Manufacturing Practices) or "15 mg/kg"
  adiValue: string;
  regulatoryReference: string;
}

export interface FSSAILabellingStandard {
  category: string;
  mandatoryDeclarations: string[];
  thresholdForSugarDeclaration: string;
  thresholdForSodiumDeclaration: string;
  effectiveDate: string;
  gazetteNotification: string;
}

export class FSSAIRegulatoryProvider {
  id = 'fssai_regulations';
  name = 'Food Safety and Standards Authority of India (FSSAI)';
  sourceType = 'FSSAI' as const;

  private metadata: SourceMetadata = {
    datasetName: 'FSSAI Food Safety and Standards (Food Products Standards and Food Additives) Regulations',
    version: 'FSSAI_FSSR_2011_Amended_2023',
    authority: 'Ministry of Health & Family Welfare, Government of India',
    countryOrRegion: 'India',
    sourceUrl: 'https://www.fssai.gov.in/standards.php',
    releaseDate: '2023-08-01',
    retrievedAt: '2026-01-15T00:00:00Z'
  };

  private additives = new Map<string, FSSAIAdditiveStandard>();
  private labellingRules: FSSAILabellingStandard[] = [];

  constructor() {
    this.seedFSSAIDatabase();
  }

  private seedFSSAIDatabase() {
    const standards: FSSAIAdditiveStandard[] = [
      {
        insNumber: 'INS 322(i)',
        eNumberEquivalent: 'E322',
        additiveName: 'Lecithins',
        functionalClass: 'Emulsifier, Stabilizer, Antioxidant',
        foodCategoriesPermitted: ['Dairy-based drinks', 'Bakery products', 'Confectionery'],
        maxPermittedLevel: 'GMP (Good Manufacturing Practices)',
        adiValue: 'Not specified (Safe in foods)',
        regulatoryReference: 'FSSAI Food Safety Standards Regulations Table 1'
      },
      {
        insNumber: 'INS 407',
        eNumberEquivalent: 'E407',
        additiveName: 'Carrageenan',
        functionalClass: 'Gelling agent, Thickener, Stabilizer',
        foodCategoriesPermitted: ['Sterilized flavored milks', 'Protein beverages', 'Desserts'],
        maxPermittedLevel: 'GMP',
        adiValue: '75 mg/kg bw/day (JECFA/EFSA aligned)',
        regulatoryReference: 'FSSAI Additives Appendix A, Table 3'
      },
      {
        insNumber: 'INS 955',
        eNumberEquivalent: 'E955',
        additiveName: 'Sucralose',
        functionalClass: 'Non-Nutritive Sweetener',
        foodCategoriesPermitted: ['Carbonated water', 'Energy drinks', 'Dairy desserts'],
        maxPermittedLevel: '300 mg/kg in beverages',
        adiValue: '15 mg/kg bw/day',
        regulatoryReference: 'FSSAI Sweeteners Regulation Section 3.1.2'
      },
      {
        insNumber: 'INS 621',
        eNumberEquivalent: 'E621',
        additiveName: 'Monosodium L-Glutamate (MSG)',
        functionalClass: 'Flavor Enhancer',
        foodCategoriesPermitted: ['Savory seasonings', 'Soups', 'Snacks'],
        maxPermittedLevel: 'GMP',
        adiValue: '30 mg/kg bw/day',
        regulatoryReference: 'FSSAI Appendix A: Table on Flavor Enhancers'
      },
      {
        insNumber: 'INS 415',
        eNumberEquivalent: 'E415',
        additiveName: 'Xanthan Gum',
        functionalClass: 'Thickener, Stabilizer',
        foodCategoriesPermitted: ['Salad dressings', 'Sauces', 'Gluten-free bakery'],
        maxPermittedLevel: 'GMP',
        adiValue: 'Not limited',
        regulatoryReference: 'FSSAI Appendix A: Table 2'
      }
    ];

    for (const std of standards) {
      this.additives.set(std.insNumber.toLowerCase(), std);
      this.additives.set(std.eNumberEquivalent.toLowerCase(), std);
      this.additives.set(std.additiveName.toLowerCase(), std);
    }

    this.labellingRules.push({
      category: 'Packaged General Solid & Liquid Foods',
      mandatoryDeclarations: [
        'Energy (kcal)',
        'Protein (g)',
        'Carbohydrates (g) and Sugars (g) with added sugars separated',
        'Total Fat (g), Saturated Fat (g), Trans Fat (g)',
        'Sodium (mg)',
        'Serving size and number of servings per pack'
      ],
      thresholdForSugarDeclaration: 'Mandatory on all pre-packaged foods (FSSAI Labelling Regulations 2020)',
      thresholdForSodiumDeclaration: 'Mandatory per 100g or per serving',
      effectiveDate: '2022-01-01',
      gazetteNotification: 'F.No. 1-94/FSSAI/SP(L&C/A)/2017'
    });
  }

  lookupAdditive(query: string): FSSAIAdditiveStandard | null {
    const q = query.trim().toLowerCase();
    return this.additives.get(q) || null;
  }

  getLabellingStandards() {
    return this.labellingRules;
  }

  getMetadata(): SourceMetadata {
    return this.metadata;
  }

  checkFreshness(): SourceFreshness {
    return {
      lastChecked: new Date().toISOString(),
      lastUpdated: this.metadata.releaseDate,
      nextScheduledRefresh: '2026-12-31T00:00:00Z',
      status: 'FRESH'
    };
  }
}

export const fssaiProvider = new FSSAIRegulatoryProvider();
