import { calculateTargets, evaluateGoalGap } from './server/calculator.js';
import { parseIngredientsList } from './server/ingredientIntelligence.js';
import { calculateNutriScore } from './server/scoring.js';
import { UserProfile } from './src/types/index.js';

console.log('--- RUNNING ADAPTIV DETERMINISTIC ENGINE TESTS ---');

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

// 1. Nutri-Score Solid Foods 2023 Algorithm Tests
const yogurtScore = calculateNutriScore({
  calories: 88,
  sugarsG: 5.1,
  saturatedFatG: 0.5,
  sodiumMg: 45,
  fiberG: 2.3,
  proteinG: 9.5,
  fruitVegPercent: 42
});
assert('Yogurt has Nutri-Score Grade A', yogurtScore.grade === 'A');
assert('Yogurt score is <= -1', yogurtScore.score <= -1, `score=${yogurtScore.score}`);
assert('Yogurt protein is counted because negative points < 11', !yogurtScore.proteinExcluded);

const waferScore = calculateNutriScore({
  calories: 545,
  sugarsG: 44,
  saturatedFatG: 16.4,
  sodiumMg: 220,
  fiberG: 2.1,
  proteinG: 5.8,
  fruitVegPercent: 0
});
assert('Wafer has Nutri-Score Grade E', waferScore.grade === 'E');
assert('Wafer total negative points >= 19', waferScore.negativePoints.totalNegative >= 19);
assert('Wafer protein is excluded by anti-masking rule', waferScore.proteinExcluded);

// 2. Deterministic Mifflin-St Jeor & Macro calculations
const sampleUser: UserProfile = {
  id: 'u1',
  name: 'Alex',
  email: 'alex@emberground.dev',
  age: 28,
  gender: 'male',
  heightCm: 180,
  weightKg: 78,
  activityLevel: 'moderate',
  goal: 'muscle_gain',
  dietaryPreference: 'standard',
  allergies: ['Peanuts'],
  foodPreferences: [],
  trainingExperience: 'intermediate',
  availableTrainingDays: 4,
  equipment: [],
  healthConstraints: [],
  safetyNotes: '',
  createdAt: ''
};

const { bmr, tdee, targets } = calculateTargets(sampleUser);
assert('Mifflin-St Jeor BMR matches formula (1770 kcal)', bmr === 1770, `bmr=${bmr}`);
assert('TDEE moderate multiplier (1.55) gives ~2744 kcal', Math.abs(tdee - 2744) <= 2, `tdee=${tdee}`);
assert('Muscle gain surplus (+300 kcal) gives ~3044 kcal', Math.abs(targets.calories - 3044) <= 2, `cal=${targets.calories}`);
assert('Muscle gain protein is 2.0g/kg (156g)', targets.proteinG === 156, `protein=${targets.proteinG}`);

// 3. Goal Gap Math
const gap = evaluateGoalGap(
  sampleUser,
  targets,
  1000,
  60,
  { calories: 250, proteinG: 26, name: 'Core Power Shake' }
);
assert('New protein total is 86g', gap.newProteinTotal === 86, `new=${gap.newProteinTotal}`);
assert('Remaining protein is 70g (156 - 86)', gap.remainingProtein === 70, `rem=${gap.remainingProtein}`);
assert('New calories total is 1250 kcal', gap.newCaloriesTotal === 1250);
assert('Recommendations exclude peanut allergens', gap.recommendations.every(r => !r.allergens.includes('Peanuts')));

// 4. Ingredient Normalization & E-number intelligence
const ingredients = parseIngredientsList('Whey Protein Isolate, Carrageenan (E407), Sucralose, Sunflower Lecithin');
assert('Extracted 4 normalized ingredients', ingredients.length === 4, `length=${ingredients.length}`);
assert('Carrageenan maps to E407 and has regulatory status', ingredients.some(i => i.eNumber === 'E407' && i.functionCategory.includes('Stabilizer')));
assert('Sucralose maps to ADI and High evidence', ingredients.some(i => i.canonicalName === 'Sucralose' && i.evidenceLevel === 'High'));

console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL DETERMINISTIC TESTS PASSED SUCCESSFULLY!');
}
