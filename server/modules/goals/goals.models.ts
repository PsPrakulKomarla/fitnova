import { GoalType, MacroTarget, WorkoutScheduleItem } from '../../../src/types/index.js';

export interface GoalEntity {
  id: string;
  userId: string;
  goalType: GoalType;
  bmr: number;
  tdee: number;
  targets: MacroTarget;
  workoutSchedule: WorkoutScheduleItem[];
  version: number;
  updatedAt: string;
}
