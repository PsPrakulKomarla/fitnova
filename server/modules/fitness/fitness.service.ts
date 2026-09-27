import { Exercise, ProgressiveOverloadRecommendation, WorkoutSessionLog, WorkoutSet } from './fitness.models.js';
import { EXERCISE_DATABASE, findExerciseById, getSubstitutionsForExercise } from './exercise.database.js';
import { database } from '../../core/database.js';
import { db } from '../../db.js';

export class FitnessService {
  private workoutLogs: WorkoutSessionLog[] = [];

  constructor() {
    this.seedHistoricalWorkouts();
  }

  private seedHistoricalWorkouts() {
    // Seed realistic 7-day workout history for Alex Carter (demonstrating completed and skipped sessions)
    const today = new Date();
    const dMinus6 = new Date(today.getTime() - 6 * 86400000).toISOString().split('T')[0];
    const dMinus4 = new Date(today.getTime() - 4 * 86400000).toISOString().split('T')[0];
    const dMinus1 = new Date(today.getTime() - 1 * 86400000).toISOString().split('T')[0];

    this.workoutLogs.push(
      {
        id: 'ws-alex-001',
        userId: 'user-alex-1',
        date: dMinus6,
        title: 'Upper Body Power A',
        focus: 'Chest, Back, Shoulders heavy compound focus',
        durationMinutes: 58,
        totalVolumeKg: 4620,
        overallRpe: 8,
        notes: 'Great bar speed on bench press. Maintained tight back arch.',
        completedAt: `${dMinus6}T18:45:00Z`,
        exercises: [
          {
            exerciseId: 'ex-bench-press',
            exerciseName: 'Barbell Flat Bench Press',
            targetSets: 3,
            notes: 'Target 3x8 at 75kg',
            sets: [
              { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 75, rpe: 7.5, rir: 2, restSeconds: 150, completed: true },
              { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 75, rpe: 8.0, rir: 2, restSeconds: 150, completed: true },
              { setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 75, rpe: 8.5, rir: 1, restSeconds: 180, completed: true }
            ]
          },
          {
            exerciseId: 'ex-barbell-row',
            exerciseName: 'Bent-Over Barbell Row',
            targetSets: 3,
            notes: 'Torso locked at 45 degrees',
            sets: [
              { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 70, rpe: 8.0, rir: 2, restSeconds: 120, completed: true },
              { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 70, rpe: 8.0, rir: 2, restSeconds: 120, completed: true },
              { setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 70, rpe: 8.5, rir: 1, restSeconds: 120, completed: true }
            ]
          }
        ]
      },
      {
        id: 'ws-alex-002',
        userId: 'user-alex-1',
        date: dMinus4,
        title: 'Lower Body Strength',
        focus: 'Quads, Posterior Chain (Knee-friendly cadence)',
        durationMinutes: 62,
        totalVolumeKg: 5840,
        overallRpe: 8.5,
        notes: 'Used leg press instead of deep back squat due to mild left patellar sensitivity.',
        completedAt: `${dMinus4}T19:10:00Z`,
        exercises: [
          {
            exerciseId: 'ex-leg-press',
            exerciseName: '45-Degree Incline Leg Press',
            targetSets: 3,
            notes: 'Substituted for Barbell Back Squat',
            sets: [
              { setNumber: 1, targetReps: 10, actualReps: 10, weightKg: 180, rpe: 8.0, rir: 2, restSeconds: 120, completed: true },
              { setNumber: 2, targetReps: 10, actualReps: 10, weightKg: 180, rpe: 8.5, rir: 1, restSeconds: 120, completed: true },
              { setNumber: 3, targetReps: 10, actualReps: 10, weightKg: 180, rpe: 8.5, rir: 1, restSeconds: 150, completed: true }
            ]
          },
          {
            exerciseId: 'ex-romanian-deadlift',
            exerciseName: 'Barbell Romanian Deadlift (RDL)',
            targetSets: 3,
            notes: 'Deep hamstring hinge',
            sets: [
              { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 95, rpe: 7.5, rir: 2, restSeconds: 120, completed: true },
              { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 95, rpe: 8.0, rir: 2, restSeconds: 120, completed: true },
              { setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 95, rpe: 8.5, rir: 1, restSeconds: 150, completed: true }
            ]
          }
        ]
      },
      {
        id: 'ws-alex-003',
        userId: 'user-alex-1',
        date: dMinus1,
        title: 'Upper Body Hypertrophy B',
        focus: 'Overhead Press, Pull-ups, Accessory Arms',
        durationMinutes: 52,
        totalVolumeKg: 3950,
        overallRpe: 8.0,
        notes: 'Hit all overhead press sets with good control.',
        completedAt: `${dMinus1}T18:30:00Z`,
        exercises: [
          {
            exerciseId: 'ex-overhead-press',
            exerciseName: 'Standing Barbell Overhead Press (OHP)',
            targetSets: 3,
            notes: 'Strict vertical bar path',
            sets: [
              { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 47.5, rpe: 8.0, rir: 2, restSeconds: 120, completed: true },
              { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 47.5, rpe: 8.0, rir: 2, restSeconds: 120, completed: true },
              { setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 47.5, rpe: 8.5, rir: 1, restSeconds: 150, completed: true }
            ]
          },
          {
            exerciseId: 'ex-pull-up',
            exerciseName: 'Overhand Pull-Up',
            targetSets: 3,
            notes: 'Bodyweight + 5kg plate',
            sets: [
              { setNumber: 1, targetReps: 6, actualReps: 6, weightKg: 83, rpe: 8.0, rir: 2, restSeconds: 120, completed: true },
              { setNumber: 2, targetReps: 6, actualReps: 6, weightKg: 83, rpe: 8.5, rir: 1, restSeconds: 120, completed: true },
              { setNumber: 3, targetReps: 6, actualReps: 6, weightKg: 83, rpe: 9.0, rir: 0, restSeconds: 150, completed: true }
            ]
          }
        ]
      }
    );
  }

  public getAllExercises(): Exercise[] {
    return EXERCISE_DATABASE;
  }

  public getExercise(id: string): Exercise | undefined {
    return findExerciseById(id);
  }

  public logSession(session: Omit<WorkoutSessionLog, 'id' | 'completedAt' | 'totalVolumeKg'>): WorkoutSessionLog {
    // Calculate total volume tonnage: Sum of (weight * actualReps) across all completed sets
    let totalVolume = 0;
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (set.completed) {
          totalVolume += (set.weightKg || 0) * (set.actualReps || 0);
        }
      }
    }

    const newLog: WorkoutSessionLog = {
      ...session,
      id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      totalVolumeKg: Math.round(totalVolume),
      completedAt: new Date().toISOString()
    };

    // Store historically (never overwrite previous sessions)
    this.workoutLogs.push(newLog);

    // Update daily progress in database
    const today = session.date || new Date().toISOString().split('T')[0];
    const daily = db.getDailyProgress(session.userId, today);
    if (daily) {
      daily.workoutsCompleted += 1;
    }

    return newLog;
  }

  public getWorkoutHistory(userId: string): WorkoutSessionLog[] {
    return this.workoutLogs
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Deterministic Progressive Overload Engine
   * Calculates next training weight/volume based on historical sets vs target reps and RPE
   */
  public evaluateOverload(params: {
    exerciseId: string;
    targetReps: number;
    targetSets: number;
    currentSets: WorkoutSet[];
    previousSets?: WorkoutSet[];
  }): ProgressiveOverloadRecommendation {
    const { exerciseId, targetReps, targetSets, currentSets, previousSets } = params;
    const exercise = findExerciseById(exerciseId);
    const exerciseName = exercise?.name || exerciseId;

    const completedCurrent = currentSets.filter(s => s.completed);
    const currentWeight = completedCurrent.length > 0 ? completedCurrent[0].weightKg : 0;
    const currentRepsAvg = completedCurrent.length > 0 
      ? Math.round((completedCurrent.reduce((acc, s) => acc + s.actualReps, 0) / completedCurrent.length) * 10) / 10 
      : 0;
    const currentRpeAvg = completedCurrent.length > 0 
      ? Math.round((completedCurrent.reduce((acc, s) => acc + s.rpe, 0) / completedCurrent.length) * 10) / 10 
      : 8.0;

    const prevWeight = previousSets && previousSets.length > 0 ? previousSets[0].weightKg : currentWeight;
    const prevReps = previousSets && previousSets.length > 0 ? previousSets[0].actualReps : currentRepsAvg;
    const prevRpe = previousSets && previousSets.length > 0 ? previousSets[0].rpe : 8.0;

    const allSetsHitTarget = completedCurrent.length >= targetSets && completedCurrent.every(s => s.actualReps >= targetReps);

    const isLowerBody = exercise?.movementPattern === 'squat' || exercise?.movementPattern === 'hinge' || exercise?.movementPattern === 'lunge';
    const weightIncrement = isLowerBody ? 5.0 : 2.5;

    let action: ProgressiveOverloadRecommendation['action'] = 'MAINTAIN_WEIGHT';
    let suggestedAdjustment = 'Maintain current resistance';
    let rationale = 'Continue with current load to solidify neuromuscular movement efficiency.';

    if (allSetsHitTarget && currentRpeAvg <= 8.5) {
      action = 'INCREASE_WEIGHT';
      suggestedAdjustment = `Increase by +${weightIncrement} kg next session (${currentWeight + weightIncrement} kg total)`;
      rationale = `All ${targetSets} sets successfully completed at or above ${targetReps} reps with submaximal perceived exertion (average RPE ${currentRpeAvg} / RIR ~1.5). Progressive overload criteria met.`;
    } else if (allSetsHitTarget && currentRpeAvg > 8.5) {
      action = 'MAINTAIN_WEIGHT';
      suggestedAdjustment = `Maintain ${currentWeight} kg next session`;
      rationale = `Target repetitions achieved, but high proximity to failure (average RPE ${currentRpeAvg}). Repeat same load next session to consolidate technique before increasing resistance.`;
    } else if (!allSetsHitTarget && currentRepsAvg >= targetReps - 1) {
      action = 'INCREASE_REPS';
      suggestedAdjustment = `Aim for +1 rep on final sets at ${currentWeight} kg`;
      rationale = `Near-threshold performance. Keep resistance unchanged and focus on completing full target reps across all sets.`;
    } else {
      action = 'MAINTAIN_WEIGHT';
      suggestedAdjustment = `Consolidate at ${currentWeight} kg`;
      rationale = `Fell short of target volume by 2+ repetitions. Prioritize rest intervals (2-3 min) and repeat load.`;
    }

    return {
      exerciseId,
      exerciseName,
      previousPerformance: {
        weightKg: prevWeight,
        reps: prevReps,
        sets: previousSets?.length || targetSets,
        avgRpe: prevRpe
      },
      currentPerformance: {
        weightKg: currentWeight,
        reps: currentRepsAvg,
        sets: completedCurrent.length,
        avgRpe: currentRpeAvg
      },
      action,
      suggestedAdjustment,
      rationale,
      confidence: 'VERIFIED',
      safeBoundaryCheck: true
    };
  }

  /**
   * Screen exercises against user profile health constraints and provide safe substitutions
   */
  public screenExerciseSafety(exerciseId: string, userConstraints: string[]): {
    isSafe: boolean;
    warning?: string;
    substitutions: Exercise[];
  } {
    const exercise = findExerciseById(exerciseId);
    if (!exercise) return { isSafe: true, substitutions: [] };

    const normalizedConstraints = userConstraints.map(c => c.toLowerCase().trim().replace(/[\s-]/g, '_'));

    const conflictingContraindication = exercise.contraindications.find(contra => 
      normalizedConstraints.some(uc => uc.includes(contra) || contra.includes(uc))
    );

    if (conflictingContraindication) {
      const validSubs = getSubstitutionsForExercise(exerciseId, userConstraints);
      return {
        isSafe: false,
        warning: `Safety Guardrail: "${exercise.name}" has biomechanical load patterns contraindicated for reported constraint (${conflictingContraindication.replace('_', ' ')}).`,
        substitutions: validSubs
      };
    }

    return { isSafe: true, substitutions: [] };
  }
}

export const fitnessService = new FitnessService();
