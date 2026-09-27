import { ConfidenceLevel } from '../../../src/types/index.js';

export interface TrendAnalysisResult {
  period: '7_days' | '30_days';
  avgCalories: number;
  targetCalories: number;
  calorieDelta: number;
  avgProtein: number;
  targetProtein: number;
  proteinDelta: number;
  workoutFrequency: {
    scheduled: number;
    completed: number;
    adherenceRatePercent: number;
  };
  totalVolumeTonnageKg: number;
  nutritionAdherencePercent: number;
  consistencyStreakDays: number;
  dailyDataPoints: {
    date: string;
    dayLabel: string;
    calories: number;
    protein: number;
    targetProtein: number;
    workoutCompleted: boolean;
  }[];
}

export type PatternType = 
  | 'LOW_BREAKFAST_PROTEIN'
  | 'WEEKEND_CALORIE_SURGE'
  | 'MISSED_WORKOUT_DAY'
  | 'EXERCISE_PLATEAU'
  | 'CHRONIC_FIBER_DEFICIT';

export interface DetectedPattern {
  id: string;
  patternType: PatternType;
  title: string;
  observation: string;
  occurrences: number;
  samplePeriodDays: number;
  thresholdMet: boolean;
  confidence: ConfidenceLevel;
  suggestedAdjustment: string;
  evidenceContext: string;
}

export interface WeeklyAIReview {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  summaryHeadline: string;
  whatWentWell: string[];
  whatNeedsAttention: string[];
  nextWeekFocus: string;
  metricsSummary: {
    workoutsCompleted: number;
    workoutsTarget: number;
    avgDailyProtein: number;
    targetProtein: number;
    totalTonnageKg: number;
  };
  generatedAt: string;
}

export interface PlanChangeLogEntry {
  id: string;
  userId: string;
  date: string;
  changeType: 'WORKOUT_DAYS' | 'CALORIE_TARGET' | 'PROTEIN_TARGET' | 'EXERCISE_SUBSTITUTION';
  previousValue: string;
  newValue: string;
  reason: string;
  triggeredBy: 'USER_APPROVED_ADAPTATION' | 'USER_MANUAL_EDIT';
  timestamp: string;
}

export interface StrengthBenchmark {
  exerciseId: string;
  exerciseName: string;
  userLiftKg: number;
  userRepetitions: number;
  estimated1RMKg: number;
  bodyWeightKg: number;
  bodyweightRatio: number;
  referenceDataset: {
    datasetName: string;
    authority: string;
    population: string;
    sampleSize: string;
    normalizationMethod: string;
  };
  strengthTier: 'Novice' | 'Intermediate' | 'Proficient' | 'Advanced';
  percentileRange: string;
  disclaimer: string;
}

export interface WearableSyncState {
  provider: 'apple_health' | 'google_health_connect' | 'fitbit' | 'garmin';
  connectionStatus: 'ready_for_sync' | 'connected' | 'disconnected';
  supportedMetrics: string[];
  lastSyncedAt: string | null;
  samplePayloadReady: boolean;
}
