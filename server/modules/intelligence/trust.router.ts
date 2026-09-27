import { Router, Request, Response, NextFunction } from 'express';
import { unifiedOrchestrator } from './unified.orchestrator.js';
import { fallbackFoodAnalysis } from '../../geminiVision.js';
import { ValidationError } from '../../core/errors.js';

export const trustRouter = Router();

// POST /api/v1/intelligence/goal-fit ("Can I Eat This?")
trustRouter.post('/goal-fit', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId = 'user-alex-1', foodItem, textHint } = req.body;

    let targetFood = foodItem;
    if (!targetFood && textHint) {
      targetFood = fallbackFoodAnalysis(textHint);
    }

    if (!targetFood) {
      throw new ValidationError('foodItem or textHint must be provided');
    }

    const assessment = unifiedOrchestrator.evaluateGoalFit({
      userId,
      foodItem: targetFood
    });

    return res.json(assessment);
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/intelligence/fix-my-meal ("Fix This Meal")
trustRouter.post('/fix-my-meal', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodItem, textHint, userId = 'user-alex-1' } = req.body;
    let targetFood = foodItem;
    if (!targetFood && textHint) {
      targetFood = fallbackFoodAnalysis(textHint);
    }
    if (!targetFood) {
      throw new ValidationError('foodItem or textHint required');
    }

    const result = unifiedOrchestrator.fixMyMeal(targetFood, userId);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/intelligence/substitute (Smart Substitutions)
trustRouter.post('/substitute', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodName, reason = 'Preference' } = req.body;
    if (!foodName) {
      throw new ValidationError('foodName required');
    }
    const substitutions = unifiedOrchestrator.getSubstitutions(foodName, reason);
    return res.json({ foodName, substitutions });
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/intelligence/trust-audit
trustRouter.post('/trust-audit', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodItem } = req.body;
    if (!foodItem) {
      throw new ValidationError('foodItem required');
    }
    const records = unifiedOrchestrator.generateTrustAudit(foodItem);
    return res.json({ records });
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/intelligence/user-correction
trustRouter.post('/user-correction', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodId, userId = 'user-alex-1', field, originalEstimate, userCorrection } = req.body;
    if (!foodId || !field || userCorrection === undefined) {
      throw new ValidationError('foodId, field, and userCorrection are required');
    }
    const entry = unifiedOrchestrator.logUserCorrection({
      foodId,
      userId,
      field,
      originalEstimate: originalEstimate ?? 'N/A',
      userCorrection
    });
    return res.status(201).json(entry);
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/intelligence/demo-catalog
trustRouter.get('/demo-catalog', (_req: Request, res: Response) => {
  const catalog = unifiedOrchestrator.getDemoCatalog();
  return res.json(catalog);
});
