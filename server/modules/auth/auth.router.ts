import { Router, Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

authRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.query.userId as string) || 'user-alex-1';
    const user = await authService.getCurrentUser(userId);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});
