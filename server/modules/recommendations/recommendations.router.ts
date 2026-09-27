import { Router, Request, Response, NextFunction } from 'express';
import { recommendationService } from './recommendations.service.js';
import { fallbackFoodAnalysis } from '../../geminiVision.js';
import { ValidationError } from '../../core/errors.js';

export const recommendationsRouter = Router();

// POST /api/v1/recommendations/evaluate
// Runs complete Phase 5 evaluation on scanned food or target food item
recommendationsRouter.post('/evaluate', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId = 'user-alex-1', foodItem, textHint } = req.body;

    let targetFood = foodItem;
    if (!targetFood && textHint) {
      targetFood = fallbackFoodAnalysis(textHint);
    }

    if (!targetFood) {
      throw new ValidationError('Either foodItem or textHint must be provided.');
    }

    const result = recommendationService.evaluate({
      userId,
      foodItem: targetFood
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// GET /api/v1/recommendations/user/:userId
recommendationsRouter.get('/user/:userId', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    // Evaluates with baseline daily progress
    const dummyFood = fallbackFoodAnalysis('yogurt');
    const result = recommendationService.evaluate({
      userId,
      foodItem: dummyFood
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

// POST /api/v1/recommendations/meal-improvement
recommendationsRouter.post('/meal-improvement', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { foodItem } = req.body;
    if (!foodItem) {
      throw new ValidationError('foodItem must be provided');
    }

    const suggestions = recommendationService.generateMealImprovements(foodItem, {} as any);
    return res.json({ suggestions });
  } catch (err) {
    return next(err);
  }
});
