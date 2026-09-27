/**
 * Extension Point: Fitness Domain (Phase 5)
 * 
 * Future entities:
 * - Exercise
 * - WorkoutPlan
 * - WorkoutSession
 * - WorkoutSet
 * - TrainingGoal
 * - TrainingHistory
 * 
 * Future workflow:
 * USER PROFILE + GOAL + TRAINING HISTORY + AVAILABLE EQUIPMENT -> WORKOUT ENGINE -> WORKOUT PLAN -> SESSION -> PROGRESS
 */
export interface IFitnessDomainService {
  generateWorkoutPlan(userId: string): Promise<unknown>;
  logWorkoutSession(sessionData: unknown): Promise<unknown>;
  calculateVolumeLoad(history: unknown[]): number;
}

export const FITNESS_DOMAIN_VERSION = 'v1-draft';
