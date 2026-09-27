import { ActivityLevel, DietaryPreference, GoalType } from '../../../src/types/index.js';

export interface ProfileEntity {
  id: string;
  userId: string;
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
  updatedAt: string;
}
