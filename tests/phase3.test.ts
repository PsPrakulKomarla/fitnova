import crypto from 'crypto';
import { InMemoryImageStorage } from '../server/modules/food/storage/image.storage.js';
import { MockFoodVisionProvider } from '../server/modules/food/vision/vision.provider.js';
import { ProductCatalog } from '../server/modules/food/matching/product.matcher.js';
import { reconcileMultiImageObservations } from '../server/modules/food/reconciliation/multi-image.reconciler.js';
import { ProductObservation } from '../server/modules/food/food.models.js';

console.log('--- RUNNING PHASE 3 FOOD PIPELINE & DATA INTEGRITY TESTS ---');

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean, extra?: string) {
  if (condition) {
    console.log(`[PASS] ${description}`);
    passed++;
  } else {
    console.error(`[FAIL] ${description} ${extra ? `-> ${extra}` : ''}`);
    failed++;
  }
}

async function runTests() {
  // 1. Image Storage & Validation Tests
  const storage = new InMemoryImageStorage();
  const validBuffer = Buffer.from('test_image_data_jpg');

  // Test 1a: Valid upload & SHA-256 hash generation
  const res1 = await storage.storeImage({
    userId: 'u1',
    fileName: 'sample.jpg',
    mimeType: 'image/jpeg',
    buffer: validBuffer
  });
  const expectedHash = crypto.createHash('sha256').update(validBuffer).digest('hex');
  assert('Image stored with correct SHA-256 hash', res1.metadata.fileHash === expectedHash);
  assert('First upload is not marked as duplicate', !res1.isDuplicate);

  // Test 1b: Duplicate detection via SHA-256
  const resDuplicate = await storage.storeImage({
    userId: 'u1',
    fileName: 'different_name.jpg',
    mimeType: 'image/jpeg',
    buffer: validBuffer
  });
  assert('Exact identical file buffer detected as duplicate via hash', resDuplicate.isDuplicate);
  assert('Duplicate returns existing image ID', resDuplicate.metadata.id === res1.metadata.id);

  // Test 1c: Invalid MIME rejection
  let mimeErrorCaught = false;
  try {
    await storage.storeImage({
      userId: 'u1',
      fileName: 'virus.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('bad_code')
    });
  } catch (err: any) {
    mimeErrorCaught = true;
  }
  assert('Unsupported MIME type gracefully rejected', mimeErrorCaught);

  // Test 1d: Empty file rejection
  let emptyErrorCaught = false;
  try {
    await storage.storeImage({
      userId: 'u1',
      fileName: 'empty.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.alloc(0)
    });
  } catch (err: any) {
    emptyErrorCaught = true;
  }
  assert('Zero-byte corrupt file rejected', emptyErrorCaught);

  // 2. Vision Extraction & Missing Data Integrity (Null vs 0)
  const visionProvider = new MockFoodVisionProvider();

  // Test 2a: Incomplete front-of-pack scan returns null, NEVER 0
  const extractionFrontOnly = await visionProvider.extractFromImage({
    base64Data: 'placeholder',
    mimeType: 'image/jpeg',
    textHint: 'front_only'
  });
  assert('Unobserved energy is null (not 0)', extractionFrontOnly.nutrition.energyKcal === null);
  assert('Unobserved protein is null (not 0)', extractionFrontOnly.nutrition.proteinG === null);
  assert('Missing fields list captures unobserved nutrition values', extractionFrontOnly.missingFields.includes('nutrition.proteinG'));

  // Test 2b: Complete packaging scan extracts numbers faithfully
  const extractionComplete = await visionProvider.extractFromImage({
    base64Data: 'placeholder',
    mimeType: 'image/jpeg',
    textHint: 'shake'
  });
  assert('Complete scan extracts protein (26.0g)', extractionComplete.nutrition.proteinG === 26.0);
  assert('Detected barcode extracted from packaging', extractionComplete.detectedBarcode === '0811620021350');
  assert('Raw ingredients captured verbatim', extractionComplete.ingredientsRaw !== null);
  assert('Additives parsed with E-numbers (Carrageenan -> E407)', extractionComplete.ingredientsParsed.some(i => i.eNumber === 'E407'));

  // 3. Product Catalog & Barcode Matching
  const catalog = new ProductCatalog();

  // Test 3a: Exact Barcode Match
  const matchBarcode = catalog.match({ barcode: '0811620021350' });
  assert('Barcode yields EXACT_MATCH', matchBarcode.status === 'EXACT_MATCH');
  assert('Barcode match confidence is >= 0.98', matchBarcode.confidence >= 0.98);

  // Test 3b: Brand + Product Name Match
  const matchName = catalog.match({ brand: 'ChocoCrisp', productName: 'Crispy Hazelnut Chocolate Coated Wafer Bar' });
  assert('Brand and exact title yield EXACT_MATCH', matchName.status === 'EXACT_MATCH');

  // Test 3c: Unknown Product Match
  const matchUnknown = catalog.match({ barcode: '999999999999', productName: 'Unknown Generic Item' });
  assert('Uncatalogued item returns UNKNOWN status with low confidence', matchUnknown.status === 'UNKNOWN');

  // 4. Multi-Image Reconciliation & Conflict Detection
  // Simulate Image 1 (Front label) and Image 2 (Back Nutrition Table with discrepancy)
  const obsFront: ProductObservation = {
    id: 'obs-1',
    scanJobId: 'job-1',
    imageId: 'img-1',
    userId: 'u1',
    detectedBarcode: '0811620021350',
    productName: 'Core Power Elite',
    brand: 'Fairlife',
    nutrition: {
      basis: 'per_serving',
      servingSize: '340 ml',
      servingSizeBytes: 340,
      energyKcal: null,
      proteinG: 26.0,
      carbohydratesG: null,
      sugarsG: null,
      fatG: null,
      saturatedFatG: null,
      fiberG: null,
      sodiumMg: null,
      saltG: null
    },
    ingredientsRaw: null,
    ingredientsParsed: [],
    missingFields: ['nutrition.carbohydratesG', 'nutrition.fatG'],
    confidence: 0.9,
    createdAt: new Date().toISOString()
  };

  const obsBackDiscrepancy: ProductObservation = {
    id: 'obs-2',
    scanJobId: 'job-1',
    imageId: 'img-2',
    userId: 'u1',
    detectedBarcode: null,
    productName: null,
    brand: null,
    nutrition: {
      basis: 'per_serving',
      servingSize: '340 ml',
      servingSizeBytes: 340,
      energyKcal: 170,
      proteinG: 24.0, // Discrepancy! 26g on Image 1 vs 24g on Image 2
      carbohydratesG: 8.0,
      sugarsG: 5.0,
      fatG: 3.5,
      saturatedFatG: 2.0,
      fiberG: 1.0,
      sodiumMg: 260,
      saltG: 0.65
    },
    ingredientsRaw: 'Filtered Lowfat Milk, Whey Protein Isolate',
    ingredientsParsed: [{ rawText: 'Whey Protein Isolate', canonicalName: 'Whey Protein Isolate', isAdditive: false }],
    missingFields: [],
    confidence: 0.95,
    createdAt: new Date().toISOString()
  };

  const reconciled = reconcileMultiImageObservations([obsFront, obsBackDiscrepancy]);

  assert('Reconciliation merged product name from Image 1', reconciled.name === 'Core Power Elite');
  assert('Reconciliation merged carbohydrate from Image 2', reconciled.nutrition.carbohydratesG === 8.0);
  assert('Reconciliation detected protein numerical discrepancy as CONFLICT', reconciled.conflicts.some(c => c.field === 'nutrition.proteinG'));
  assert('Verification state flagged as CONFLICT due to contradictory images', reconciled.verificationState === 'CONFLICT');
  assert('Provenance preserved for reconciled fields', reconciled.provenance.length >= 2);

  console.log(`\nPHASE 3 TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL PHASE 3 SPECIFICATION TESTS PASSED SUCCESSFULLY!');
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
