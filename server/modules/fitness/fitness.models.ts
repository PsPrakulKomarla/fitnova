export type MovementPattern = 
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'carry'
  | 'isolation';

export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  exerciseId: string;
  name: string;
  muscleGroups: string[];
  equipment: string[];
  movementPattern: MovementPattern;
  difficulty: ExerciseDifficulty;
  instructions: string[];
  safetyNotes: string;
  substitutions: string[];
  contraindications: string[]; // e.g. 'patellar_tendinitis', 'shoulder_impingement', 'lower_back'
}

export interface WorkoutSet {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  rpe: number; // 1-10
  rir: number; // Reps in reserve
  restSeconds: number;
  completed: boolean;
}

export interface WorkoutExerciseLog {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  sets: WorkoutSet[];
  notes?: string;
}

export interface WorkoutSessionLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string;
  focus: string;
  durationMinutes: number;
  exercises: WorkoutExerciseLog[];
  totalVolumeKg: number;
  overallRpe: number;
  notes?: string;
  completedAt: string;
}

export type OverloadAction = 
  | 'INCREASE_WEIGHT'
  | 'INCREASE_REPS'
  | 'MAINTAIN_WEIGHT'
  | 'REDUCE_VOLUME'
  | 'DELOAD';

export interface ProgressiveOverloadRecommendation {
  exerciseId: string;
  exerciseName: string;
  previousPerformance: {
    weightKg: number;
    reps: number;
    sets: number;
    avgRpe: number;
  };
  currentPerformance: {
    weightKg: number;
    reps: number;
    sets: number;
    avgRpe: number;
  };
  action: OverloadAction;
  suggestedAdjustment: string;
  rationale: string;
  confidence: 'VERIFIED' | 'HIGH' | 'ESTIMATED';
  safeBoundaryCheck: boolean;
}
