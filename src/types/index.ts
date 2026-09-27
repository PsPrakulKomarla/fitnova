export type GoalType = 'muscle_gain' | 'fat_loss' | 'maintenance' | 'recomposition';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';
export type DietaryPreference = 'standard' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo';
export type EvidenceLevel = 'High' | 'Moderate' | 'Emerging' | 'Insufficient';
export type NutriGrade = 'A' | 'B' | 'C' | 'D' | 'E';
export type ConfidenceLevel = 'VERIFIED' | 'HIGH' | 'ESTIMATED' | 'PARTIAL' | 'UNVERIFIED';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: GoalType;
  dietaryPreference: DietaryPreference;
  allergies: string[];
  foodPreferences: string[];
  trainingExperience: 'beginner' | 'intermediate' | 'advanced';
  availableTrainingDays: number;
  equipment: string[];
  healthConstraints: string[];
  safetyNotes: string;
  createdAt: string;
}

export interface MacroTarget {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  waterMl: number;
}

export interface WorkoutScheduleItem {
  day: string;
  title: string;
  focus: string;
  durationMinutes: number;
  completed?: boolean;
}

export interface Plan {
  id: string;
  userId: string;
  version: number;
  bmr: number;
  tdee: number;
  dailyTargets: MacroTarget;
  workoutSchedule: WorkoutScheduleItem[];
  rationale: string;
  status: 'active' | 'archived' | 'superseded';
  createdAt: string;
}

export interface PlanVersion {
  version: number;
  planId: string;
  createdAt: string;
  changeSummary: string;
  approvedByUser: boolean;
  approvedAt?: string;
  targets: MacroTarget;
  workoutDays: number;
  agentRationale: string;
}

export interface NutriScoreBreakdown {
  score: number;
  grade: NutriGrade;
  methodology: string;
  negativePoints: {
    energyKj: number;
    energyPoints: number;
    sugarsG: number;
    sugarsPoints: number;
    saturatedFatG: number;
    saturatedFatPoints: number;
    sodiumMg: number;
    sodiumPoints: number;
    totalNegative: number;
  };
  positivePoints: {
    fruitVegPercent: number;
    fruitVegPoints: number;
    fiberG: number;
    fiberPoints: number;
    proteinG: number;
    proteinPoints: number;
    totalPositive: number;
  };
  proteinExcluded: boolean;
  limitations: string[];
}

export interface IngredientDetail {
  originalText: string;
  canonicalName: string;
  eNumber?: string;
  functionCategory: string;
  regulatoryStatus: string;
  evidenceLevel: EvidenceLevel;
  physiologicalRole: string;
  safetyConsideration: string;
  scientificCitations: string[];
}

export interface BodySystemPathway {
  system: 'muscular' | 'digestive' | 'cardiovascular' | 'metabolic';
  nutrient: string;
  physiologicalRole: string;
  mechanism: string;
  evidenceStrength: EvidenceLevel;
  citation: string;
}

export interface ExposureHorizon {
  horizon: 'Today' | '30 Days' | '1 Year' | '5 Years' | '10 Years';
  intakeAmount: string;
  mathematicalAccumulation: string;
  evidenceContext: string;
  uncertaintyNotes: string;
}

export interface FoodItemData {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSizeG: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  saturatedFatG: number;
  sugarsG: number;
  fiberG: number;
  sodiumMg: number;
  fruitVegPercent: number;
  nutriScore: NutriScoreBreakdown;
  confidence: ConfidenceLevel;
  provenance: string;
  rawLabelIngredients: string;
  ingredients: IngredientDetail[];
  bodyPathways: BodySystemPathway[];
  exposureScenarios: ExposureHorizon[];
}

export interface GoalGapAnalysis {
  goal: GoalType;
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

  summary: string;
  severity: 'on_track' | 'moderate_gap' | 'high_gap' | 'exceeded';
  recommendations: RecommendationItem[];
}

export interface RecommendationItem {
  id: string;
  type: 'food_first' | 'pantry_swap' | 'snack_action';
  title: string;
  description: string;
  macroBenefit: string;
  calories: number;
  proteinG: number;
  allergens: string[];
  evidenceNote: string;
}

export interface FoodLogEntry {
  id: string;
  userId: string;
  foodItemId: string;
  foodName: string;
  timestamp: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  nutriGrade: NutriGrade;
  confidence: ConfidenceLevel;
  source: 'camera' | 'barcode' | 'manual' | 'preset';
}

export interface DailyProgressData {
  date: string;
  userId: string;
  targetCalories: number;
  consumedCalories: number;
  targetProtein: number;
  consumedProtein: number;
  targetCarbs: number;
  consumedCarbs: number;
  targetFat: number;
  consumedFat: number;
  waterConsumedMl: number;
  workoutsCompleted: number;
  adherencePercentage: number;
  logs: FoodLogEntry[];
}

export interface ProposedPlanAdaptation {
  id: string;
  userId: string;
  status: 'pending_user_approval' | 'approved' | 'rejected';
  createdAt: string;
  currentPlanVersion: number;
  proposedPlanVersion: number;
  triggerEvent: string;
  rootCauseAnalysis: string;
  proposedChanges: {
    calorieTargetDelta: number;
    newCalories: number;
    proteinTargetDelta: number;
    newProtein: number;
    workoutDaysDelta: number;
    newWorkoutDays: number;
    scheduleSummary: string;
  };
  humanActionRequired: string;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: 'food_event' | 'daily_review' | 'weekly_adaptation';
  workflowName: string;
  triggeredAt: string;
  status: 'success' | 'running' | 'failed';
  durationMs: number;
  triggerSource: string;
  inputPayload: Record<string, unknown>;
  outputPayload: Record<string, unknown>;
  stepsExecuted: {
    nodeId: string;
    nodeName: string;
    durationMs: number;
    status: 'success' | 'failed';
  }[];
}

export interface NotificationLog {
  id: string;
  recipientEmail: string;
  channel: 'email' | 'in_app';
  template: 'daily_gap' | 'weekly_review' | 'adaptation_proposal' | 'onboarding';
  subject: string;
  bodyPreview: string;
  sentAt: string;
  status: 'delivered' | 'bounced' | 'suppressed';
}
