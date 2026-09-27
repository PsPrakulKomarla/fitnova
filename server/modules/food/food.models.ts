export type VerificationState = 'UNVERIFIED' | 'OBSERVED' | 'VERIFIED' | 'CONFLICT' | 'STALE';
export type MatchStatus = 'EXACT_MATCH' | 'PROBABLE_MATCH' | 'CONFLICT' | 'UNKNOWN';
export type ScanJobStatus = 'UPLOADED' | 'PROCESSING' | 'EXTRACTED' | 'MATCHED' | 'REQUIRES_VERIFICATION' | 'COMPLETED' | 'FAILED';

export interface StoredImageMetadata {
  id: string;
  userId: string;
  fileHash: string; // SHA-256 hash of original image buffer
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  createdAt: string;
}

export interface NutritionData {
  basis: 'per_100g' | 'per_serving' | 'per_100ml';
  servingSize: string | null;
  servingSizeBytes: number | null;
  energyKcal: number | null;
  proteinG: number | null;
  carbohydratesG: number | null;
  sugarsG: number | null;
  fatG: number | null;
  saturatedFatG: number | null;
  fiberG: number | null;
  sodiumMg: number | null;
  saltG: number | null;
}

export interface IngredientItem {
  rawText: string;
  canonicalName: string;
  isAdditive: boolean;
  eNumber?: string;
  allergenWarning?: string;
}

export interface ProvenanceRecord {
  field: string;
  source: 'label_ocr' | 'barcode_database' | 'user_upload' | 'vision_estimate';
  imageId?: string;
  confidence: number;
  observedValue: unknown;
  timestamp: string;
}

export interface ProductObservation {
  id: string;
  scanJobId: string;
  imageId: string;
  userId: string;
  detectedBarcode: string | null;
  productName: string | null;
  brand: string | null;
  nutrition: NutritionData;
  ingredientsRaw: string | null;
  ingredientsParsed: IngredientItem[];
  missingFields: string[];
  confidence: number;
  createdAt: string;
}

export interface ProductVersion {
  id: string;
  productId: string;
  versionNumber: number;
  barcode: string | null;
  productName: string;
  brand: string;
  servingSize: string | null;
  nutrition: NutritionData;
  ingredients: IngredientItem[];
  verificationState: VerificationState;
  provenance: ProvenanceRecord[];
  createdAt: string;
}

export interface ProductEntity {
  id: string;
  barcode: string | null;
  brand: string;
  name: string;
  currentVersionId: string;
  matchConfidence: number;
  matchStatus: MatchStatus;
  createdAt: string;
}

export interface FoodScanJob {
  id: string;
  userId: string;
  status: ScanJobStatus;
  imageIds: string[];
  observations: ProductObservation[];
  reconciledProduct: {
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
    matchStatus: MatchStatus;
    matchedProductId?: string;
  } | null;
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}
