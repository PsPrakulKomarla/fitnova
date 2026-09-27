import { Router, Request, Response, NextFunction } from 'express';
import { fitnessService } from './fitness.service.js';
import { ValidationError } from '../../core/errors.js';
import { database } from '../../core/database.js';
import { db } from '../../db.js';

export const fitnessRouter = Router();

// GET /api/v1/fitness/exercises
fitnessRouter.get('/exercises', (_req: Request, res: Response) => {
  const exercises = fitnessService.getAllExercises();
  return res.json(exercises);
});

// GET /api/v1/fitness/history/:userId
fitnessRouter.get('/history/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const history = fitnessService.getWorkoutHistory(userId);
  return res.json(history);
});

// POST /api/v1/fitness/log
fitnessRouter.post('/log', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId = 'user-alex-1', title, focus, durationMinutes, exercises, overallRpe = 8, notes, date } = req.body;

    if (!title || !exercises || !Array.isArray(exercises)) {
      throw new ValidationError('Workout log requires title and exercises array');
    }

    const session = fitnessService.logSession({
      userId,
      date: date || new Date().toISOString().split('T')[0],
      title,
      focus: focus || 'Resistance Training',
      durationMinutes: durationMinutes || 45,
      exercises,
      overallRpe,
      notes
    });

    return res.status(201).json(session);
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/fitness/overload-evaluate
fitnessRouter.post('/overload-evaluate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exerciseId, targetReps = 8, targetSets = 3, currentSets, previousSets } = req.body;
    if (!exerciseId || !currentSets) {
      throw new ValidationError('exerciseId and currentSets are required');
    }

    const recommendation = fitnessService.evaluateOverload({
      exerciseId,
      targetReps,
      targetSets,
      currentSets,
      previousSets
    });

    return res.json(recommendation);
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/fitness/screen-safety
fitnessRouter.post('/screen-safety', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exerciseId, userId = 'user-alex-1' } = req.body;
    const profile = database.profiles.get(userId) || db.getUserProfile(userId);
    const userConstraints = profile?.healthConstraints || [];

    const screening = fitnessService.screenExerciseSafety(exerciseId, userConstraints);
    return res.json(screening);
  } catch (err) {
    return next(err);
  }
});
