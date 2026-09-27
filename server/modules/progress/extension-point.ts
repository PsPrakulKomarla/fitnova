/**
 * Extension Point: Progress Domain (Phase 8)
 * 
 * Separates current state (Profile weight) from historical state (Progress records).
 * 
 * Future entities:
 * - WeightRecord
 * - WorkoutProgress
 * - NutritionProgress
 * - GoalProgress
 * - PersonalRecord
 * - ProgressSnapshot
 */
export interface IProgressDomainService {
  recordWeight(userId: string, weightKg: number, recordedAt: string): Promise<unknown>;
  getWeightHistory(userId: string, timeRange: string): Promise<unknown[]>;
  computeAdherenceScore(userId: string, days: number): Promise<number>;
}

export const PROGRESS_DOMAIN_VERSION = 'v1-draft';
