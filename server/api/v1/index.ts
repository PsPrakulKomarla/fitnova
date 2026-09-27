import { Router, Request, Response, NextFunction } from 'express';
import { authRouter } from '../../modules/auth/auth.router.js';
import { profileRouter } from '../../modules/profile/profile.router.js';
import { goalsRouter } from '../../modules/goals/goals.router.js';
import { foodRouter } from '../../modules/food/food.router.js';
import { intelligenceRouter } from '../../modules/intelligence/intelligence.router.js';
import { recommendationsRouter } from '../../modules/recommendations/recommendations.router.js';
import { fitnessRouter } from '../../modules/fitness/fitness.router.js';
import { progressRouter } from '../../modules/progress/progress.router.js';
import { trustRouter } from '../../modules/intelligence/trust.router.js';
import { database } from '../../core/database.js';
import { evaluateGoalGap } from '../../calculator.js';
import { fallbackFoodAnalysis } from '../../geminiVision.js';
import { getAIProvider } from '../../integrations/ai/index.js';
import { buildFoodItemData } from '../../geminiVision.js';
import { triggerFoodEventWorkflow, triggerDailyReviewWorkflow, triggerWeeklyReviewWorkflow } from '../../n8nWorkflows.js';
import { db } from '../../db.js';

export const v1Router = Router();

// Versioned Modular Routers
v1Router.use('/auth', authRouter);
v1Router.use('/profile', profileRouter);
v1Router.use('/goals', goalsRouter);
v1Router.use('/food', foodRouter);
v1Router.use('/intelligence', intelligenceRouter);
v1Router.use('/intelligence', trustRouter);
v1Router.use('/recommendations', recommendationsRouter);
v1Router.use('/fitness', fitnessRouter);
v1Router.use('/progress', progressRouter);

// Domain Module: Food (Scanner & Logging)
v1Router.post('/food/scan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageBase64, mimeType, textDescription, userId = 'user-alex-1' } = req.body;
    const aiProvider = getAIProvider();

    let rawExtraction;
    try {
      rawExtraction = await aiProvider.analyzeFood({ imageBase64, mimeType, textDescription });
    } catch (aiErr) {
      console.warn('AI Provider returned error, utilizing deterministic fallback adapter:', aiErr);
      const fallback = fallbackFoodAnalysis(textDescription || 'Greek Yogurt High Protein Bowl');
      const profile = database.profiles.get(userId);
      const plan = database.plans.get(userId);
      const today = new Date().toISOString().split('T')[0];
      const progress = db.getDailyProgress(userId, today);
      const gapAnalysis = profile && plan ? evaluateGoalGap(profile, plan.dailyTargets, progress.consumedCalories, progress.consumedProtein, fallback) : null;
      return res.json({ foodItem: fallback, gapAnalysis });
    }

    const foodData = buildFoodItemData(rawExtraction);
    const profile = database.profiles.get(userId);
    const plan = database.plans.get(userId);
    const today = new Date().toISOString().split('T')[0];
    const progress = db.getDailyProgress(userId, today);

    const gapAnalysis = profile && plan
      ? evaluateGoalGap(profile, plan.dailyTargets, progress.consumedCalories, progress.consumedProtein, {
          calories: foodData.calories,
          proteinG: foodData.proteinG,
          name: foodData.name
        })
      : null;

    return res.json({ foodItem: foodData, gapAnalysis });
  } catch (err) {
    return next(err);
  }
});

v1Router.post('/food/log', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId = 'user-alex-1', foodItem, mealType = 'snack', servings = 1, source = 'camera' } = req.body;
    const logEntry = db.addFoodLog({
      userId,
      foodItemId: foodItem.id,
      foodName: foodItem.name,
      mealType,
      servings,
      calories: Math.round(foodItem.calories * servings),
      proteinG: Math.round(foodItem.proteinG * servings * 10) / 10,
      carbsG: Math.round(foodItem.carbsG * servings * 10) / 10,
      fatG: Math.round(foodItem.fatG * servings * 10) / 10,
      nutriGrade: foodItem.nutriScore.grade,
      confidence: foodItem.confidence,
      source
    });

    await triggerFoodEventWorkflow({
      userId,
      foodName: foodItem.name,
      calories: logEntry.calories,
      proteinG: logEntry.proteinG,
      nutriGrade: logEntry.nutriGrade
    });

    const today = new Date().toISOString().split('T')[0];
    const updatedProgress = db.getDailyProgress(userId, today);

    return res.json({ success: true, logEntry, updatedProgress });
  } catch (err) {
    return next(err);
  }
});

// Domain Module: Progress
v1Router.get('/progress/daily', async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-alex-1';
  const today = (req.query.date as string) || new Date().toISOString().split('T')[0];
  const progress = db.getDailyProgress(userId, today);
  return res.json(progress);
});

// Domain Module: Adaptive Agent
v1Router.get('/agent/adaptations', async (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'user-alex-1';
  const adaptations = db.getProposedAdaptations(userId);
  return res.json(adaptations);
});

v1Router.post('/agent/adaptations/:id/action', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body;
  const updated = db.resolveAdaptation(id, action);
  return res.json({ success: true, adaptation: updated, currentPlan: db.getPlan(updated?.userId || 'user-alex-1') });
});

// Domain Module: Workflows & Integrations
v1Router.get('/workflows/logs', async (_req: Request, res: Response) => {
  return res.json(db.getWorkflowRuns());
});

v1Router.post('/workflows/trigger', async (req: Request, res: Response) => {
  const { workflowId, userId = 'user-alex-1' } = req.body;
  let result;
  if (workflowId === 'daily_review') {
    result = await triggerDailyReviewWorkflow(userId);
  } else if (workflowId === 'weekly_adaptation') {
    result = await triggerWeeklyReviewWorkflow(userId);
  } else {
    result = await triggerFoodEventWorkflow({
      userId,
      foodName: 'Quick Workout Recovery Shake',
      calories: 220,
      proteinG: 30,
      nutriGrade: 'A'
    });
  }
  return res.json({ success: true, execution: result });
});

v1Router.get('/notifications', async (_req: Request, res: Response) => {
  return res.json(db.getNotifications());
});
