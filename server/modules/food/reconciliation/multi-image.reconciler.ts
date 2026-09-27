import {
  IngredientItem,
  NutritionData,
  ProductObservation,
  ProvenanceRecord,
  VerificationState
} from '../food.models.js';

export interface ReconciledFoodResult {
  name: string | null;
  brand: string | null;
  barcode: string | null;
  servingSize: string | null;
  nutrition: NutritionData;
  ingredientsRaw: string | null;
  ingredients: IngredientItem[];
  verificationState: VerificationState;
  missingFields: string[];
  conflicts: Array<{ field: string; values: unknown[]; resolutionNotes: string }>;
  provenance: ProvenanceRecord[];
}

export function reconcileMultiImageObservations(observations: ProductObservation[]): ReconciledFoodResult {
  if (observations.length === 0) {
    throw new Error('Cannot reconcile empty observation set');
  }

  const conflicts: Array<{ field: string; values: unknown[]; resolutionNotes: string }> = [];
  const provenance: ProvenanceRecord[] = [];

  // 1. Reconcile Product Name & Brand
  let name: string | null = null;
  let brand: string | null = null;
  let barcode: string | null = null;
  let servingSize: string | null = null;

  for (const obs of observations) {
    if (obs.productName && !name) {
      name = obs.productName;
      provenance.push({
        field: 'productName',
        source: 'label_ocr',
        imageId: obs.imageId,
        confidence: obs.confidence,
        observedValue: obs.productName,
        timestamp: obs.createdAt
      });
    }
    if (obs.brand && !brand) {
      brand = obs.brand;
      provenance.push({
        field: 'brand',
        source: 'label_ocr',
        imageId: obs.imageId,
        confidence: obs.confidence,
        observedValue: obs.brand,
        timestamp: obs.createdAt
      });
    }
    if (obs.detectedBarcode && !barcode) {
      barcode = obs.detectedBarcode;
      provenance.push({
        field: 'barcode',
        source: 'barcode_database',
        imageId: obs.imageId,
        confidence: 0.99,
        observedValue: obs.detectedBarcode,
        timestamp: obs.createdAt
      });
    }
    if (obs.nutrition.servingSize && !servingSize) {
      servingSize = obs.nutrition.servingSize;
    }
  }

  // 2. Reconcile Ingredients
  let ingredientsRaw: string | null = null;
  const ingredientsMap = new Map<string, IngredientItem>();

  for (const obs of observations) {
    if (obs.ingredientsRaw && (!ingredientsRaw || obs.ingredientsRaw.length > ingredientsRaw.length)) {
      ingredientsRaw = obs.ingredientsRaw;
      provenance.push({
        field: 'ingredientsRaw',
        source: 'label_ocr',
        imageId: obs.imageId,
        confidence: obs.confidence,
        observedValue: obs.ingredientsRaw,
        timestamp: obs.createdAt
      });
    }
    for (const ing of obs.ingredientsParsed) {
      if (!ingredientsMap.has(ing.canonicalName.toLowerCase())) {
        ingredientsMap.set(ing.canonicalName.toLowerCase(), ing);
      }
    }
  }

  // 3. Reconcile Nutrition Fields & Detect Numerical Conflicts
  const nutritionKeys: Array<keyof Omit<NutritionData, 'basis' | 'servingSize' | 'servingSizeBytes'>> = [
    'energyKcal',
    'proteinG',
    'carbohydratesG',
    'sugarsG',
    'fatG',
    'saturatedFatG',
    'fiberG',
    'sodiumMg',
    'saltG'
  ];

  const reconciledNutrition: NutritionData = {
    basis: observations[0].nutrition.basis || 'per_100g',
    servingSize,
    servingSizeBytes: null,
    energyKcal: null,
    proteinG: null,
    carbohydratesG: null,
    sugarsG: null,
    fatG: null,
    saturatedFatG: null,
    fiberG: null,
    sodiumMg: null,
    saltG: null
  };

  for (const key of nutritionKeys) {
    const observedVals: Array<{ val: number; imageId: string; conf: number }> = [];

    for (const obs of observations) {
      const val = obs.nutrition[key];
      if (typeof val === 'number') {
        observedVals.push({ val, imageId: obs.imageId, conf: obs.confidence });
      }
    }

    if (observedVals.length === 1) {
      reconciledNutrition[key] = observedVals[0].val;
      provenance.push({
        field: `nutrition.${key}`,
        source: 'label_ocr',
        imageId: observedVals[0].imageId,
        confidence: observedVals[0].conf,
        observedValue: observedVals[0].val,
        timestamp: new Date().toISOString()
      });
    } else if (observedVals.length > 1) {
      // Check for conflict
      const distinctVals = Array.from(new Set(observedVals.map((o) => o.val)));
      if (distinctVals.length === 1) {
        // All observations agree
        reconciledNutrition[key] = distinctVals[0];
        provenance.push({
          field: `nutrition.${key}`,
          source: 'label_ocr',
          confidence: Math.max(...observedVals.map((o) => o.conf)),
          observedValue: distinctVals[0],
          timestamp: new Date().toISOString()
        });
      } else {
        // Disagreement / Conflict detected!
        conflicts.push({
          field: `nutrition.${key}`,
          values: distinctVals,
          resolutionNotes: `Discrepancy detected across ${observedVals.length} images: ${observedVals.map((o) => `${o.val} (Image ${o.imageId})`).join(', ')}. Value flagged for human verification.`
        });
        // Preserve highest confidence observation while marking conflict
        const highestConf = observedVals.sort((a, b) => b.conf - a.conf)[0];
        reconciledNutrition[key] = highestConf.val;
      }
    }
  }

  // 4. Identify Missing Fields (Null fields)
  const missingFields: string[] = [];
  if (!name) missingFields.push('productName');
  if (!ingredientsRaw && ingredientsMap.size === 0) missingFields.push('ingredients');

  const requiredNutritionFields: Array<keyof NutritionData> = [
    'energyKcal',
    'proteinG',
    'carbohydratesG',
    'fatG'
  ];
  for (const reqKey of requiredNutritionFields) {
    if (reconciledNutrition[reqKey] === null) {
      missingFields.push(`nutrition.${reqKey}`);
    }
  }

  // 5. Determine Verification State
  let verificationState: VerificationState = 'OBSERVED';
  if (conflicts.length > 0) {
    verificationState = 'CONFLICT';
  } else if (missingFields.length > 0) {
    verificationState = 'UNVERIFIED';
  } else if (barcode) {
    verificationState = 'VERIFIED';
  }

  return {
    name,
    brand,
    barcode,
    servingSize,
    nutrition: reconciledNutrition,
    ingredientsRaw,
    ingredients: Array.from(ingredientsMap.values()),
    verificationState,
    missingFields,
    conflicts,
    provenance
  };
}
