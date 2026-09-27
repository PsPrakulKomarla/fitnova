import { Router, Request, Response, NextFunction } from 'express';
import { progressService } from './progress.service.js';
import { ValidationError } from '../../core/errors.js';

export const progressRouter = Router();

// GET /api/v1/progress/trends/:userId
progressRouter.get('/trends/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const period = (req.query.period as '7_days' | '30_days') || '7_days';
  const trends = progressService.calculateTrends(userId, period);
  return res.json(trends);
});

// GET /api/v1/progress/patterns/:userId
progressRouter.get('/patterns/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const patterns = progressService.detectPatterns(userId);
  return res.json(patterns);
});

// GET /api/v1/progress/weekly-review/:userId
progressRouter.get('/weekly-review/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const review = progressService.generateWeeklyReview(userId);
  return res.json(review);
});

// GET /api/v1/progress/benchmarks/:userId
progressRouter.get('/benchmarks/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const benchmarks = progressService.getStrengthBenchmarks(userId);
  return res.json(benchmarks);
});

// GET /api/v1/progress/change-log/:userId
progressRouter.get('/change-log/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const logs = progressService.getPlanChangeLogs(userId);
  return res.json(logs);
});

// POST /api/v1/progress/change-log
progressRouter.post('/change-log', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, changeType, previousValue, newValue, reason, triggeredBy = 'USER_MANUAL_EDIT' } = req.body;
    if (!userId || !changeType || !previousValue || !newValue || !reason) {
      throw new ValidationError('All change log fields are required');
    }
    const log = progressService.logPlanChange({
      userId,
      date: new Date().toISOString().split('T')[0],
      changeType,
      previousValue,
      newValue,
      reason,
      triggeredBy
    });
    return res.status(201).json(log);
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/progress/wearables
progressRouter.get('/wearables', (_req: Request, res: Response) => {
  const wearables = progressService.getWearableSyncState();
  return res.json(wearables);
});
