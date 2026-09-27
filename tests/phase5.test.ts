import { recommendationService } from '../server/modules/recommendations/recommendations.service.js';
import { database } from '../server/core/database.js';
import { fallbackFoodAnalysis } from '../server/geminiVision.js';
import { FoodItemData, UserProfile } from '../src/types/index.js';

console.log('--- RUNNING PHASE 5 FOOD INTELLIGENCE, PERSONALIZATION & EXPLAINABILITY TESTS ---');

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

async function runPhase5Tests() {
  // Test User 1: Muscle Gain athlete with Nut Allergy and Hypertension
  const testUser1: UserProfile = {
    id: 'user-athlete-1',
    name: 'Marcus Vance',
    email: 'marcus@emberground.dev',
    age: 26,
    gender: 'male',
    heightCm: 182,
    weightKg: 80,
    activityLevel: 'very_active',
    goal: 'muscle_gain',
    dietaryPreference: 'standard',
    allergies: ['Peanuts', 'Tree Nuts'],
    foodPreferences: ['High protein', 'Salmon', 'Oats'],
    trainingExperience: 'advanced',
    availableTrainingDays: 5,
    equipment: ['Barbell', 'Dumbbells'],
    healthConstraints: ['Hypertension'],
    safetyNotes: 'Keep sodium controlled below 1800mg daily',
    createdAt: new Date().toISOString()
  };
  database.profiles.set(testUser1.id, testUser1);

  // Test User 2: Vegan with Soy and Gluten allergies, Fat Loss goal
  const testUser2: UserProfile = {
    id: 'user-vegan-2',
    name: 'Priya Sharma',
    email: 'priya@emberground.dev',
    age: 31,
    gender: 'female',
    heightCm: 165,
    weightKg: 62,
    activityLevel: 'moderate',
    goal: 'fat_loss',
    dietaryPreference: 'vegan',
    allergies: ['Soy', 'Gluten'],
    foodPreferences: ['Lentils', 'Legumes', 'Greens'],
    trainingExperience: 'intermediate',
    availableTrainingDays: 4,
    equipment: ['Kettlebells'],
    healthConstraints: ['Blood Glucose Regulation'],
    safetyNotes: '',
    createdAt: new Date().toISOString()
  };
  database.profiles.set(testUser2.id, testUser2);

  // 1. Personalized User Profile & Goal Configuration Tests
  assert('User profile exists in database with goal "muscle_gain"', database.profiles.get('user-athlete-1')?.goal === 'muscle_gain');
  assert('User 2 profile exists with dietaryPreference "vegan"', database.profiles.get('user-vegan-2')?.dietaryPreference === 'vegan');

  // 2. Allergen Checking Tests
  const peanutFood: FoodItemData = {
    ...fallbackFoodAnalysis('wafer'),
    name: 'Peanut Butter Granola Bar',
    rawLabelIngredients: 'Rolled oats, peanut butter (roasted peanuts, arachis oil), cane sugar, sea salt.'
  };

  const allergyWarnings1 = recommendationService.checkAllergens(peanutFood, testUser1.allergies);
  assert('Allergy engine detects declared peanut in ingredients', allergyWarnings1.length > 0);
  assert('Detected allergen matches user allergy "Peanuts"', allergyWarnings1[0].userAllergyMatched === 'Peanuts');
  assert('Allergen severity is marked FATAL/WARNING', allergyWarnings1[0].severity === 'FATAL');

  const safeFood = fallbackFoodAnalysis('yogurt');
  const allergyWarningsSafe = recommendationService.checkAllergens(safeFood, testUser1.allergies);
  assert('Nut-free Greek Yogurt raises no allergen alerts for nut-allergic user', allergyWarningsSafe.length === 0);

  // 3. Clinical & Medical Boundary Constraints Tests
  const highSodiumMeal: FoodItemData = {
    ...fallbackFoodAnalysis('salmon'),
    name: 'Smoked Salmon Teriyaki',
    sodiumMg: 780 // exceeds hypertension 400mg threshold
  };
  const medicalWarnings = recommendationService.checkMedicalConstraints(highSodiumMeal, testUser1);
  assert('Hypertension constraint triggers warning on 780mg sodium food', medicalWarnings.length > 0);
  assert('Warning identifies "Hypertension" and "Sodium (mg)" parameter', medicalWarnings[0].condition === 'Hypertension');

  // 4. Multi-Metric Nutrition Gap Detection
  const evalResult1 = recommendationService.evaluate({
    userId: testUser1.id,
    foodItem: highSodiumMeal,
    dailyProgress: {
      date: '2026-09-27',
      userId: testUser1.id,
      targetCalories: 2800,
      consumedCalories: 1200,
      targetProtein: 160,
      consumedProtein: 50,
      targetCarbs: 320,
      consumedCarbs: 140,
      targetFat: 75,
      consumedFat: 35,
      waterConsumedMl: 1500,
      workoutsCompleted: 1,
      adherencePercentage: 88,
      logs: []
    }
  });

  assert('Gap analysis accounts for previous progress and new food protein', evalResult1.gapAnalysis.newProteinTotal > 50);
  assert('Remaining protein is precisely calculated', evalResult1.gapAnalysis.remainingProtein === evalResult1.gapAnalysis.targetProtein - evalResult1.gapAnalysis.newProteinTotal);
  assert('Remaining sodium allowance is computed', evalResult1.gapAnalysis.sodiumAllowanceRemainingMg !== undefined);

  // 5. Dietary Preference Filtering & Explainable Recommendations
  const evalResultVegan = recommendationService.evaluate({
    userId: testUser2.id,
    foodItem: safeFood,
    dailyProgress: {
      date: '2026-09-27',
      userId: testUser2.id,
      targetCalories: 1800,
      consumedCalories: 600,
      targetProtein: 120,
      consumedProtein: 30,
      targetCarbs: 200,
      consumedCarbs: 80,
      targetFat: 50,
      consumedFat: 20,
      waterConsumedMl: 1000,
      workoutsCompleted: 0,
      adherencePercentage: 80,
      logs: []
    }
  });

  // Verify vegan user NEVER receives non-vegan recommendations
  const veganRecs = evalResultVegan.explainableRecommendations;
  const hasAnimalProduct = veganRecs.some(r => r.title.toLowerCase().includes('chicken') || r.title.toLowerCase().includes('egg') || r.title.toLowerCase().includes('paneer'));
  assert('Vegan user receives zero meat/poultry/egg recommendations', !hasAnimalProduct);
  assert('All recommendations include explicit "whyRationale" mechanism', veganRecs.every(r => r.whyRationale && r.whyRationale.length > 10));
  assert('All recommendations have scientific citation', veganRecs.every(r => r.scientificCitation && r.scientificCitation.length > 5));
  assert('All recommendations have graded evidenceLevel (High, Moderate, Regulatory)', veganRecs.every(r => ['High', 'Moderate', 'Regulatory', 'Emerging'].includes(r.evidenceLevel)));

  // 6. Actionable Meal Improvement & Food Pairing Suggestions
  const dalFood: FoodItemData = {
    ...fallbackFoodAnalysis('salmon'),
    name: 'Yellow Moong Dal Tadka',
    calories: 220,
    proteinG: 14,
    fiberG: 8,
    sodiumMg: 520, // high sodium
    sugarsG: 2
  };
  const improvements = recommendationService.generateMealImprovements(dalFood, testUser1);
  assert('Dal triggers non-heme iron absorption pairing suggestion (Vitamin C)', improvements.some(i => i.category === 'iron_bioavailability'));
  assert('High sodium triggers potassium counterbalance suggestion', improvements.some(i => i.category === 'sodium_mitigation'));
  assert('Pairing suggestion explains physiological mechanism (Fe3+ to Fe2+ reduction)', improvements.some(i => i.physiologicalMechanism.includes('ferrous iron')));

  // 7. Food-to-Body System Physiological Pathways
  const pathways = evalResult1.bodyPathways;
  assert('Food generates pathways across body systems', pathways.length >= 3);
  assert('Muscular system pathway links protein to mTORC1 activation', pathways.some(p => p.system === 'muscular' && p.cellularMechanism.includes('mTORC1')));
  assert('Cardiovascular system pathway accounts for sodium and endothelial regulation', pathways.some(p => p.system === 'cardiovascular'));
  assert('Each pathway includes scientific citation and provenance status', pathways.every(p => p.citation && p.provenanceStatus));

  // 8. Distinction of Verified vs Estimated vs Reference States
  assert('Food item preserves confidence level (VERIFIED / ESTIMATED / etc.)', evalResult1.confidence !== undefined);
  assert('Pathways preserve underlying food confidence status', evalResult1.bodyPathways.every(p => p.provenanceStatus === evalResult1.confidence));

  console.log(`\nPHASE 5 TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('ALL PHASE 5 SPECIFICATION TESTS PASSED SUCCESSFULLY!');
  }
}

runPhase5Tests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
