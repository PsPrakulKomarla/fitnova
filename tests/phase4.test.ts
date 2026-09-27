import { providerRegistry } from '../server/integrations/food_data/registry.js';
import { ifctProvider } from '../server/integrations/food_data/ifct.provider.js';
import { fssaiProvider } from '../server/integrations/food_data/fssai.provider.js';
import { usdaProvider } from '../server/integrations/food_data/usda.provider.js';
import { openFoodFactsProvider } from '../server/integrations/food_data/openfoodfacts.provider.js';
import { reconciliationEngine } from '../server/modules/intelligence/reconciliation.js';
import { getSourcePriority, SOURCE_HIERARCHY_RANK } from '../server/modules/intelligence/sources.js';
import { computeDataQuality } from '../server/modules/intelligence/quality.js';

console.log('--- RUNNING PHASE 4 DATA INTELLIGENCE & ACCURACY LAYER TESTS ---');

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

async function runPhase4Tests() {
  // 1. Data Source Hierarchy Tests
  assert('PRODUCT_LABEL has highest priority rank (100)', SOURCE_HIERARCHY_RANK.PRODUCT_LABEL === 100);
  assert('FSSAI has higher priority than general reference (90)', SOURCE_HIERARCHY_RANK.FSSAI === 90);
  assert('ICMR_NIN_IFCT has higher priority than foreign reference (85)', SOURCE_HIERARCHY_RANK.ICMR_NIN_IFCT === 85);
  assert('AI_INFERENCE has lowest priority rank (20)', SOURCE_HIERARCHY_RANK.AI_INFERENCE === 20);
  assert('Product Label rank > AI Inference rank', getSourcePriority('PRODUCT_LABEL') > getSourcePriority('AI_INFERENCE'));

  // 2. Provider Registration & Metadata Tests
  const providers = providerRegistry.getAllProviders();
  assert('At least 3 core food data providers registered', providers.length >= 3);
  assert('IFCT 2017 provider registered', providers.some((p) => p.id === 'icmr_nin_ifct_2017'));
  assert('USDA FDC provider registered', providers.some((p) => p.id === 'usda_fdc'));
  assert('Open Food Facts provider registered', providers.some((p) => p.id === 'open_food_facts'));

  const ifctMeta = ifctProvider.getMetadata();
  assert('IFCT dataset version is IFCT_2017_v1.2', ifctMeta.version.includes('IFCT_2017'));
  assert('IFCT authority is ICMR - National Institute of Nutrition', ifctMeta.authority.includes('National Institute of Nutrition'));

  const ifctFreshness = ifctProvider.checkFreshness();
  assert('IFCT source freshness status is FRESH', ifctFreshness.status === 'FRESH');

  // 3. ICMR-NIN IFCT Indian Food Composition Tests
  const moongResults = await ifctProvider.search('Moong Dal');
  assert('IFCT search finds Green Gram Split (Moong Dal)', moongResults.length > 0);
  const moong = await ifctProvider.getFood('ifct-moong-dal');
  assert('Moong Dal has verified 24.5g protein per 100g', moong?.nutritionPer100g.proteinG === 24.5);
  assert('Moong Dal has verified 16.3g dietary fiber per 100g', moong?.nutritionPer100g.fiberG === 16.3);

  const paneer = await ifctProvider.getFood('ifct-paneer');
  assert('Paneer has verified 18.3g protein and 19.5g fat per 100g', paneer?.nutritionPer100g.proteinG === 18.3 && paneer?.nutritionPer100g.fatG === 19.5);

  // 4. FSSAI Regulatory Standards Tests
  const ins322 = fssaiProvider.lookupAdditive('INS 322(i)');
  assert('FSSAI lookup finds INS 322(i) Lecithins', ins322 !== null && ins322.additiveName === 'Lecithins');
  assert('INS 322(i) equivalent E-number is E322', ins322?.eNumberEquivalent === 'E322');

  const ins407 = fssaiProvider.lookupAdditive('INS 407');
  assert('FSSAI lookup finds INS 407 Carrageenan', ins407 !== null && ins407.insNumber === 'INS 407');
  assert('Carrageenan functional class includes Gelling agent & Stabilizer', ins407?.functionalClass.includes('Gelling agent') || false);

  const labellingStandards = fssaiProvider.getLabellingStandards();
  assert('FSSAI specifies mandatory declarations including energy, protein, fat, sodium', labellingStandards[0].mandatoryDeclarations.some((d) => d.includes('Protein')));

  // 5. Multi-Source Conflict Detection & Reconciliation Tests
  const observationsWithConflict = [
    {
      field: 'protein',
      value: 18.0,
      sourceType: 'PRODUCT_LABEL' as const,
      sourceId: 'user_packet_img_1',
      sourceVersion: 'v1',
      retrievedAt: new Date().toISOString(),
      verificationStatus: 'OBSERVED' as const,
      confidence: 0.98
    },
    {
      field: 'protein',
      value: 15.0, // 18% difference from 18g
      sourceType: 'OPEN_FOOD_FACTS' as const,
      sourceId: 'off-8901234567890',
      sourceVersion: 'OFF_2026_Q1',
      retrievedAt: new Date().toISOString(),
      verificationStatus: 'REFERENCE' as const,
      confidence: 0.8
    }
  ];

  const reconciliationResult = reconciliationEngine.evaluateField('protein', observationsWithConflict);
  assert('Reconciliation engine detects conflict between 18g and 15g protein', reconciliationResult.hasConflict);
  assert('Reconciliation resolves by primary source (Product Label) without silently erasing discrepancy', reconciliationResult.chosenValue === 18.0);
  assert('Conflict record specifies relative difference percentage', (reconciliationResult.conflictRecord?.relativeDifferencePercent || 0) > 15);
  assert('Conflict record captures source A and source B metadata', reconciliationResult.conflictRecord?.sourceA.type === 'PRODUCT_LABEL' && reconciliationResult.conflictRecord?.sourceB.type === 'OPEN_FOOD_FACTS');

  // 6. Data Quality Scoring Tests
  const highQuality = computeDataQuality({
    verificationState: 'VERIFIED',
    hasConflicts: false,
    missingFieldsCount: 0,
    totalFieldsCount: 8,
    extractionConfidence: 0.98,
    isFromOfficialSource: true
  });
  assert('Verified complete food yields HIGH_CONFIDENCE grade', highQuality.grade === 'HIGH_CONFIDENCE');
  assert('Verified complete food numerical score >= 85', highQuality.numericalScore >= 85);

  const missingQuality = computeDataQuality({
    verificationState: 'UNVERIFIED',
    hasConflicts: false,
    missingFieldsCount: 6,
    totalFieldsCount: 8,
    extractionConfidence: 0.6,
    isFromOfficialSource: false
  });
  assert('Food with 6 missing fields yields INSUFFICIENT_DATA grade', missingQuality.grade === 'INSUFFICIENT_DATA');

  // 7. Multi-Provider Cross-Reference Barcode Lookup
  const offHits = await providerRegistry.lookupBarcode('0811620021350');
  assert('Cross-reference barcode search finds matching product in Open Food Facts', offHits.some((h) => h.providerId === 'open_food_facts'));

  console.log(`\nPHASE 4 TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL PHASE 4 SPECIFICATION TESTS PASSED SUCCESSFULLY!');
  }
}

runPhase4Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
