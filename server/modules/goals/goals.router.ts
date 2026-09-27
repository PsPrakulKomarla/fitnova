import { Router, Request, Response, NextFunction } from 'express';
import { goalsService } from './goals.service.js';

export const goalsRouter = Router();

goalsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.query.userId as string) || 'user-alex-1';
    const plan = await goalsService.getPlan(userId);
    return res.json(plan);
  } catch (err) {
    return next(err);
  }
});

goalsRouter.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.body.userId as string) || (req.query.userId as string) || 'user-alex-1';
    const plan = await goalsService.updateGoal(userId, req.body);
    return res.json(plan);
  } catch (err) {
    return next(err);
  }
});

goalsRouter.get('/versions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.query.userId as string) || 'user-alex-1';
    const versions = await goalsService.getVersions(userId);
    return res.json(versions);
  } catch (err) {
    return next(err);
  }
});
