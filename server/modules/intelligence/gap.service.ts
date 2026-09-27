import { GoalType, MacroTarget, UserProfile } from '../../../src/types/index.js';
import { ifctProvider } from '../../integrations/food_data/ifct.provider.js';

export interface RecommendationCandidate {
  id: string;
  name: string;
  category: 'food_first' | 'meal_modification' | 'snack_action';
  macroBenefit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  allergens: string[];
  whyExplanation: string;
  evidenceCitation: string;
  sourceDataset: string;
}

export interface MealImprovementSuggestion {
  currentMealName: string;
  identifiedGaps: string[];
  suggestedAdditions: Array<{ food: string; reason: string; macroImpact: string }>;
  modifiedMealSummary: string;
}

export interface MacroGapReport {
  userId: string;
  goal: GoalType;
  targets: MacroTarget;
  currentConsumed: { calories: number; proteinG: number; carbsG: number; fatG: number };
  mealNutrients: { calories: number; proteinG: number; carbsG: number; fatG: number };
  newTotal: { calories: number; proteinG: number; carbsG: number; fatG: number };
  remaining: { calories: number; proteinG: number; carbsG: number; fatG: number };
  priorityGaps: string[];
  severity: 'on_track' | 'moderate_gap' | 'high_gap' | 'exceeded';
  allergyExclusionsApplied: string[];
  recommendations: RecommendationCandidate[];
  mealImprovement?: MealImprovementSuggestion;
}

export class NutritionGapEngine {
  evaluateGap(params: {
    profile: UserProfile;
    targets: MacroTarget;
    currentConsumed: { calories: number; proteinG: number; carbsG: number; fatG: number };
    mealNutrients: { calories: number; proteinG: number; carbsG: number; fatG: number; name: string };
  }): MacroGapReport {
    const { profile, targets, currentConsumed, mealNutrients } = params;

    const newCal = currentConsumed.calories + mealNutrients.calories;
    const newProt = currentConsumed.proteinG + mealNutrients.proteinG;
    const newCarb = currentConsumed.carbsG + mealNutrients.carbsG;
    const newFat = currentConsumed.fatG + mealNutrients.fatG;

    const remCal = targets.calories - newCal;
    const remProt = targets.proteinG - newProt;
    const remCarb = targets.carbsG - newCarb;
    const remFat = targets.fatG - newFat;

    const priorityGaps: string[] = [];
    if (remProt > 20) priorityGaps.push(`Protein deficit: ${Math.round(remProt)}g remaining`);
    if (remCal < 200 && remProt > 30) priorityGaps.push('Low calorie budget remaining relative to high protein deficit');
    if (newCal > targets.calories) priorityGaps.push(`Calorie target exceeded by ${newCal - targets.calories} kcal`);

    let severity: MacroGapReport['severity'] = 'on_track';
    if (remProt > 40 && remCal < 400) severity = 'high_gap';
    else if (remProt > 25) severity = 'moderate_gap';
    else if (remCal < -200) severity = 'exceeded';

    // Allergy Safety Filter (Section 10)
    // Filter out candidates containing any user allergies before generating suggestions
    const userAllergies = (profile.allergies || []).map((a) => a.toLowerCase().trim());
    const recommendations = this.generateAllergySafeRecommendations(profile, remProt, remCal, userAllergies);

    // Personalized Meal Improvement (Section 16)
    const mealImprovement = this.generateMealImprovement(mealNutrients.name, mealNutrients.proteinG, remProt, userAllergies);

    return {
      userId: profile.id,
      goal: profile.goal,
      targets,
      currentConsumed,
      mealNutrients: {
        calories: mealNutrients.calories,
        proteinG: mealNutrients.proteinG,
        carbsG: mealNutrients.carbsG,
        fatG: mealNutrients.fatG
      },
      newTotal: { calories: newCal, proteinG: newProt, carbsG: newCarb, fatG: newFat },
      remaining: {
        calories: remCal,
        proteinG: Math.max(0, remProt),
        carbsG: Math.max(0, remCarb),
        fatG: Math.max(0, remFat)
      },
      priorityGaps,
      severity,
      allergyExclusionsApplied: profile.allergies,
      recommendations,
      mealImprovement
    };
  }

  private generateAllergySafeRecommendations(
    profile: UserProfile,
    neededProteinG: number,
    remainingCal: number,
    userAllergies: string[]
  ): RecommendationCandidate[] {
    const isVeg = profile.dietaryPreference === 'vegetarian' || profile.dietaryPreference === 'vegan';
    const isVegan = profile.dietaryPreference === 'vegan';

    const pool: RecommendationCandidate[] = [
      {
        id: 'rec-greek-yogurt',
        name: 'Plain 0% Greek Yogurt (200g)',
        category: 'food_first',
        macroBenefit: '+21g Protein, 120 kcal, 0g Fat',
        calories: 120,
        proteinG: 21,
        carbsG: 7,
        fatG: 0,
        allergens: ['dairy', 'milk', 'lactose'],
        whyExplanation: 'Provides dense micellar casein and whey protein without adding excess saturated fat, helping you close your remaining protein gap while fitting within your calorie budget.',
        evidenceCitation: 'Phillips et al., Front Nutr 2016 (Leucine kinetics & MPS stimulation)',
        sourceDataset: 'Certified USDA & Dairy Composition Table'
      },
      {
        id: 'rec-paneer-ifct',
        name: 'Fresh Cow Milk Paneer (100g seared)',
        category: 'food_first',
        macroBenefit: '+18.3g Protein, 257 kcal, 3.4g Carbs',
        calories: 257,
        proteinG: 18.3,
        carbsG: 3.4,
        fatG: 19.5,
        allergens: ['dairy', 'milk', 'lactose'],
        whyExplanation: 'Traditional Indian whole-food source rich in bioavailable dairy calcium and slow-digesting protein suitable for dinner recovery.',
        evidenceCitation: 'ICMR-NIN Indian Food Composition Tables (IFCT 2017: Item D023)',
        sourceDataset: 'ICMR-NIN IFCT 2017'
      },
      {
        id: 'rec-moong-dal-ifct',
        name: 'Sprouted Green Moong Dal Bowl (150g)',
        category: 'food_first',
        macroBenefit: '+14g Protein, 180 kcal, 8g Fiber',
        calories: 180,
        proteinG: 14,
        carbsG: 28,
        fatG: 1,
        allergens: ['legume'],
        whyExplanation: 'High-fiber plant-based protein providing steady colonic fermentation and sustained satiety without triggering dairy or nut allergies.',
        evidenceCitation: 'ICMR-NIN IFCT 2017 Pulses & Legumes Chapter; Reynolds et al., Lancet 2019',
        sourceDataset: 'ICMR-NIN IFCT 2017'
      },
      {
        id: 'rec-roasted-chicken',
        name: 'Herb-Roasted Chicken Breast (120g)',
        category: 'food_first',
        macroBenefit: '+32g Protein, 165 kcal, 3g Fat',
        calories: 165,
        proteinG: 32,
        carbsG: 0,
        fatG: 3,
        allergens: [],
        whyExplanation: 'Highest protein density per calorie (DIAAS score > 1.15). Closes large protein deficits with minimal caloric footprint.',
        evidenceCitation: 'Morton et al., Br J Sports Med 2018 (Meta-analysis of protein pacing)',
        sourceDataset: 'USDA FoodData Central #175176'
      },
      {
        id: 'rec-steamed-edamame',
        name: 'Steamed Edamame in Pods (150g)',
        category: 'snack_action',
        macroBenefit: '+17g Protein, 160 kcal, 8g Fiber',
        calories: 160,
        proteinG: 17,
        carbsG: 12,
        fatG: 6,
        allergens: ['soy'],
        whyExplanation: 'Naturally complete plant protein containing all 9 essential amino acids in optimal ratio (PDCAAS 1.0).',
        evidenceCitation: 'Messina et al., Nutrients 2021',
        sourceDataset: 'USDA FDC Reference'
      },
      {
        id: 'rec-boiled-eggs',
        name: '2 Soft-Boiled Pasture Eggs',
        category: 'food_first',
        macroBenefit: '+13g Protein, 140 kcal, 10g Fat',
        calories: 140,
        proteinG: 13,
        carbsG: 1,
        fatG: 10,
        allergens: ['egg'],
        whyExplanation: 'Optimal postprandial leucine spike with intact egg yolk lipid matrix enhancing myofibrillar muscle remodeling.',
        evidenceCitation: 'van Vliet et al., Am J Clin Nutr 2017',
        sourceDataset: 'USDA FoodData Central #175167'
      }
    ];

    // Filter strictly by user allergies and diet preference
    return pool.filter((item) => {
      // 1. Dietary preference check
      if (isVegan && item.allergens.some((a) => a === 'dairy' || a === 'milk' || a === 'egg')) return false;
      if (isVeg && item.id.includes('chicken')) return false;

      // 2. Allergen check (DO NOT RECOMMEND IF CONTAINS ALLERGEN)
      const hasAllergyConflict = item.allergens.some((allergen) =>
        userAllergies.some((userAllergy) => allergen.includes(userAllergy) || userAllergy.includes(allergen))
      );
      if (hasAllergyConflict) return false;

      return true;
    });
  }

  private generateMealImprovement(
    mealName: string,
    proteinG: number,
    neededProteinG: number,
    userAllergies: string[]
  ): MealImprovementSuggestion {
    const gaps: string[] = [];
    const suggestedAdditions: Array<{ food: string; reason: string; macroImpact: string }> = [];

    if (proteinG < 15 && neededProteinG > 20) {
      gaps.push('Low protein density in current meal');

      const canHaveDairy = !userAllergies.includes('dairy') && !userAllergies.includes('milk');
      if (canHaveDairy) {
        suggestedAdditions.push({
          food: 'Add 1 cup Spiced Dal or 80g Grilled Paneer',
          reason: 'Adds complete amino acids without needing an entirely separate meal preparation.',
          macroImpact: '+15g to +18g Protein (ICMR-NIN IFCT)'
        });
      } else {
        suggestedAdditions.push({
          food: 'Add 1 cup Sprouted Moong Dal / Chana',
          reason: 'Adds bioavailable legume protein and resistant fiber.',
          macroImpact: '+14g Protein, 8g Fiber'
        });
      }
    }

    return {
      currentMealName: mealName,
      identifiedGaps: gaps.length > 0 ? gaps : ['Meal aligns well with current macro pacing'],
      suggestedAdditions,
      modifiedMealSummary:
        suggestedAdditions.length > 0
          ? `${mealName} + ${suggestedAdditions.map((a) => a.food).join(' + ')}`
          : `${mealName} (Optimal configuration)`
    };
  }
}

export const nutritionGapEngine = new NutritionGapEngine();
