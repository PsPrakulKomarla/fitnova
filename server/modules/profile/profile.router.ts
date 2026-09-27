import { Router, Request, Response, NextFunction } from 'express';
import { profileService } from './profile.service.js';

export const profileRouter = Router();

profileRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.query.userId as string) || 'user-alex-1';
    const profile = await profileService.getProfile(userId);
    return res.json(profile);
  } catch (err) {
    return next(err);
  }
});

profileRouter.put('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.body.id as string) || (req.query.userId as string) || 'user-alex-1';
    const updated = await profileService.updateProfile(userId, req.body);
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});

profileRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.body.id as string) || (req.query.userId as string) || 'user-alex-1';
    const updated = await profileService.updateProfile(userId, req.body);
    return res.json(updated);
  } catch (err) {
    return next(err);
  }
});
