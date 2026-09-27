import { EvidenceLevel, NutriGrade, ConfidenceLevel } from '../../../src/types/index.js';

export type RecommendationType = 
  | 'food_first'
  | 'pantry_swap'
  | 'snack_action'
  | 'meal_improvement'
  | 'hydration_action'
  | 'allergen_warning';

export type SystemTarget = 
  | 'muscular'
  | 'cardiovascular'
  | 'digestive_microbiome'
  | 'metabolic_endocrine'
  | 'skeletal_bone';

export interface AllergyWarning {
  hasAllergen: boolean;
  allergenDetected: string;
  userAllergyMatched: string;
  severity: 'FATAL' | 'WARNING' | 'SAFE';
  clinicalNote: string;
}

export interface MedicalConstraintWarning {
  condition: string;
  triggeredParameter: string;
  thresholdValue: string;
  observedValue: string;
  clinicalAdvice: string;
}

export interface ExplainableRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  macroBenefit: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
    sodiumMg?: number;
  };
  whyRationale: string;
  evidenceLevel: EvidenceLevel | 'Regulatory';
  scientificCitation: string;
  timingRecommendation: string;
  dietaryFit: string[];
}

export interface MealImprovementSuggestion {
  category: 'sodium_mitigation' | 'iron_bioavailability' | 'glycemic_blunting' | 'protein_optimization' | 'fiber_enrichment';
  title: string;
  suggestionText: string;
  targetNutrient: string;
  physiologicalMechanism: string;
  foodAdditionsOrSwaps: string[];
  evidenceLevel: EvidenceLevel | 'Regulatory';
}

export interface FoodToBodySystemPathway {
  system: SystemTarget;
  systemName: string;
  nutrient: string;
  biologicalRole: string;
  cellularMechanism: string;
  evidenceStrength: EvidenceLevel | 'Regulatory';
  citation: string;
  provenanceStatus: ConfidenceLevel;
}

export interface PersonalizedIntelligenceResult {
  userId: string;
  foodName: string;
  confidence: ConfidenceLevel;
  allergyWarnings: AllergyWarning[];
  medicalWarnings: MedicalConstraintWarning[];
  nutriGrade: NutriGrade;
  gapAnalysis: {
    targetProtein: number;
    currentProtein: number;
    foodProtein: number;
    newProteinTotal: number;
    remainingProtein: number;

    targetCalories: number;
    currentCalories: number;
    foodCalories: number;
    newCaloriesTotal: number;
    remainingCalories: number;

    remainingFiber: number;
    currentSodiumMg: number;
    sodiumAllowanceRemainingMg: number;

    severity: 'on_track' | 'moderate_gap' | 'high_gap' | 'exceeded' | 'allergen_alert' | 'medical_boundary';
    summary: string;
  };
  explainableRecommendations: ExplainableRecommendation[];
  mealImprovements: MealImprovementSuggestion[];
  bodyPathways: FoodToBodySystemPathway[];
  evaluatedAt: string;
}
