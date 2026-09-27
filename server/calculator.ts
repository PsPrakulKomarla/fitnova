import { ActivityLevel, GoalGapAnalysis, GoalType, MacroTarget, RecommendationItem, UserProfile } from '../src/types/index.js';

export function calculateBMR(user: Pick<UserProfile, 'gender' | 'weightKg' | 'heightCm' | 'age'>): number {
  const base = 10 * user.weightKg + 6.25 * user.heightCm - 5 * user.age;
  if (user.gender === 'male') {
    return Math.round(base + 5);
  } else if (user.gender === 'female') {
    return Math.round(base - 161);
  }
  return Math.round(base - 78);
}

export function getActivityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case 'sedentary': return 1.2;
    case 'light': return 1.375;
    case 'moderate': return 1.55;
    case 'very_active': return 1.725;
    case 'athlete': return 1.9;
    default: return 1.375;
  }
}

export function calculateTargets(profile: UserProfile): { bmr: number; tdee: number; targets: MacroTarget } {
  const bmr = calculateBMR(profile);
  const multiplier = getActivityMultiplier(profile.activityLevel);
  const tdee = Math.round(bmr * multiplier);

  let calorieAdjustment = 0;
  let proteinPerKg = 1.6;

  switch (profile.goal) {
    case 'muscle_gain':
      calorieAdjustment = 300; // Lean caloric surplus
      proteinPerKg = 2.0;
      break;
    case 'fat_loss':
      calorieAdjustment = -500; // Controlled deficit
      proteinPerKg = 2.2; // Higher protein to preserve lean mass during deficit
      break;
    case 'recomposition':
      calorieAdjustment = -150;
      proteinPerKg = 2.2;
      break;
    case 'maintenance':
    default:
      calorieAdjustment = 0;
      proteinPerKg = 1.6;
      break;
  }

  const targetCalories = Math.max(1200, Math.round(tdee + calorieAdjustment));
  const proteinG = Math.round(profile.weightKg * proteinPerKg);
  const proteinKcal = proteinG * 4;

  // Fat target: ~27% of total calories
  const fatKcal = targetCalories * 0.27;
  const fatG = Math.round(fatKcal / 9);

  // Carbs target: remaining calories
  const remainingKcal = Math.max(200, targetCalories - (proteinKcal + fatKcal));
  const carbsG = Math.round(remainingKcal / 4);

  // Fiber target: 14g per 1000 kcal
  const fiberG = Math.max(28, Math.round((targetCalories / 1000) * 14));

  // Water: ~35ml per kg of bodyweight + exercise hydration
  const waterMl = Math.round(profile.weightKg * 35 + (profile.availableTrainingDays >= 3 ? 500 : 0));

  return {
    bmr,
    tdee,
    targets: {
      calories: targetCalories,
      proteinG,
      carbsG,
      fatG,
      fiberG,
      waterMl
    }
  };
}

export function evaluateGoalGap(
  profile: UserProfile,
  targets: MacroTarget,
  consumedCalories: number,
  consumedProtein: number,
  scannedFood: { calories: number; proteinG: number; name: string }
): GoalGapAnalysis {
  const newCaloriesTotal = consumedCalories + scannedFood.calories;
  const remainingCalories = targets.calories - newCaloriesTotal;

  const newProteinTotal = consumedProtein + scannedFood.proteinG;
  const remainingProtein = targets.proteinG - newProteinTotal;

  let severity: GoalGapAnalysis['severity'] = 'on_track';
  if (remainingProtein > 45 && remainingCalories < 400) {
    severity = 'high_gap'; // Low calorie room left but big protein deficit!
  } else if (remainingProtein > 30) {
    severity = 'moderate_gap';
  } else if (remainingCalories < -150) {
    severity = 'exceeded';
  } else {
    severity = 'on_track';
  }

  let summary = '';
  if (remainingProtein <= 5 && remainingCalories >= -100 && remainingCalories <= 150) {
    summary = `Excellent alignment! With "${scannedFood.name}", you hit ${newProteinTotal}g / ${targets.proteinG}g protein target right within your calorie budget.`;
  } else if (remainingProtein > 0) {
    summary = `After adding "${scannedFood.name}", you have reached ${newProteinTotal}g of protein. You need approximately ${remainingProtein}g more protein today with ${Math.max(0, remainingCalories)} kcal remaining in your budget.`;
  } else {
    summary = `Protein target of ${targets.proteinG}g achieved (${newProteinTotal}g logged). Remaining calorie balance: ${remainingCalories} kcal.`;
  }

  // Generate food-first, allergy-safe recommendations
  const recommendations = generateRecommendations(profile, remainingProtein, remainingCalories);

  return {
    goal: profile.goal,
    targetProtein: targets.proteinG,
    currentProtein: consumedProtein,
    foodProtein: scannedFood.proteinG,
    newProteinTotal,
    remainingProtein: Math.max(0, remainingProtein),
    targetCalories: targets.calories,
    currentCalories: consumedCalories,
    foodCalories: scannedFood.calories,
    newCaloriesTotal,
    remainingCalories,
    summary,
    severity,
    recommendations
  };
}

function generateRecommendations(
  profile: UserProfile,
  neededProteinG: number,
  remainingCal: number
): RecommendationItem[] {
  const isVegan = profile.dietaryPreference === 'vegan';
  const isVeg = profile.dietaryPreference === 'vegetarian' || isVegan;
  const hasDairyAllergy = profile.allergies.some(a => a.toLowerCase().includes('dairy') || a.toLowerCase().includes('milk') || a.toLowerCase().includes('lactose'));
  const hasNutAllergy = profile.allergies.some(a => a.toLowerCase().includes('nut') || a.toLowerCase().includes('peanut'));

  const recs: RecommendationItem[] = [];

  if (neededProteinG >= 20) {
    if (!isVeg && !hasDairyAllergy) {
      recs.push({
        id: 'rec-greek-yogurt',
        type: 'food_first',
        title: 'Plain 0% Greek Yogurt (200g)',
        description: 'Dense micellar casein and whey providing 20g high biological value protein with minimal calories.',
        macroBenefit: '+21g Protein, 120 kcal, 0g Fat',
        calories: 120,
        proteinG: 21,
        allergens: ['Dairy'],
        evidenceNote: 'High leucine threshold triggering muscle protein synthesis (Phillips et al., 2016).'
      });
    }

    if (!isVeg) {
      recs.push({
        id: 'rec-chicken-breast',
        type: 'food_first',
        title: 'Grilled Herb Chicken Breast (120g)',
        description: 'Lean complete protein source optimal for dinner to reach daily target without excess saturated fat.',
        macroBenefit: '+32g Protein, 165 kcal, 3g Fat',
        calories: 165,
        proteinG: 32,
        allergens: [],
        evidenceNote: 'Complete amino acid profile with DIAAS score > 1.15.'
      });
    }

    if (isVeg || isVegan || hasDairyAllergy) {
      recs.push({
        id: 'rec-edamame-tofu',
        type: 'food_first',
        title: 'Steamed Edamame & Seared Firm Tofu',
        description: 'Naturally complete plant protein rich in isoflavones, iron, and slow-digesting dietary fiber.',
        macroBenefit: '+24g Protein, 190 kcal, 8g Fiber',
        calories: 190,
        proteinG: 24,
        allergens: ['Soy'],
        evidenceNote: 'Soy protein isolate exhibits PDCAAS of 1.0, matching animal protein for MPS (Messina et al., 2021).'
      });
    }

    if (!hasDairyAllergy && !isVegan) {
      recs.push({
        id: 'rec-cottage-cheese',
        type: 'pantry_swap',
        title: 'Low-Fat Cottage Cheese with Cinnamon',
        description: 'Slow-digesting casein protein that sustains amino acid elevation throughout the evening.',
        macroBenefit: '+28g Protein, 160 kcal, 2g Fat',
        calories: 160,
        proteinG: 28,
        allergens: ['Dairy'],
        evidenceNote: 'Casein ingestion prior to sleep increases overnight muscle protein synthesis rates (Snijders et al., 2015).'
      });
    }
  } else if (neededProteinG > 0) {
    if (!hasNutAllergy) {
      recs.push({
        id: 'rec-pumpkin-seeds',
        type: 'snack_action',
        title: 'Roasted Pumpkin Seeds (30g)',
        description: 'Quick mineral-dense topper rich in magnesium, zinc, and plant-based protein.',
        macroBenefit: '+9g Protein, 160 kcal, 4g Fiber',
        calories: 160,
        proteinG: 9,
        allergens: [],
        evidenceNote: 'Magnesium contributes to normal muscle function and electrolyte balance (EFSA, 2010).'
      });
    }

    recs.push({
      id: 'rec-boiled-eggs',
      type: 'food_first',
      title: '2 Soft-Boiled Pasture-Raised Eggs',
      description: 'Golden standard bioavailable protein with choline, lutein, and fat-soluble vitamins.',
      macroBenefit: '+13g Protein, 140 kcal, 10g Healthy Fat',
      calories: 140,
      proteinG: 13,
      allergens: ['Egg'],
      evidenceNote: 'Whole eggs stimulate post-exercise myofibrillar protein synthesis more effectively than egg whites alone (van Vliet et al., 2017).'
    });
  } else {
    recs.push({
      id: 'rec-hydration-recovery',
      type: 'snack_action',
      title: 'Target Reached: Hydration & Micronutrients',
      description: 'Your protein target is secured. Focus on hydration and mineral replenishment.',
      macroBenefit: '+500ml Water with Citrus, 0 kcal',
      calories: 0,
      proteinG: 0,
      allergens: [],
      evidenceNote: 'Optimal cellular hydration optimizes muscle glycogen retention and recovery.'
    });
  }

  // Filter out any allergens that match user profile
  return recs.filter(r => !r.allergens.some(a => profile.allergies.includes(a)));
}
