import { GoalType, MacroTarget } from '../../../src/types/index.js';

export interface UpdateGoalDto {
  goal: GoalType;
  customCalories?: number;
  customProteinG?: number;
}

export interface GoalResponseDto {
  goal: GoalType;
  bmr: number;
  tdee: number;
  targets: MacroTarget;
  version: number;
}
