import {
  DailyProgressData,
  FoodItemData,
  FoodLogEntry,
  NotificationLog,
  Plan,
  PlanVersion,
  ProposedPlanAdaptation,
  UserProfile,
  WorkflowExecutionLog,
  WorkoutScheduleItem
} from '../src/types/index.js';
import { calculateTargets } from './calculator.js';
import { fallbackFoodAnalysis } from './geminiVision.js';

class InMemoryDatabase {
  users: Map<string, { id: string; email: string; name: string }> = new Map();
  profiles: Map<string, UserProfile> = new Map();
  plans: Map<string, Plan> = new Map();
  planVersions: Map<string, PlanVersion[]> = new Map();
  foodItems: Map<string, FoodItemData> = new Map();
  foodLogs: FoodLogEntry[] = [];
  dailyProgress: Map<string, DailyProgressData> = new Map(); // key: userId_date
  workoutLogs: { id: string; userId: string; date: string; title: string; completed: boolean; rpe: number; durationMin: number }[] = [];
  proposedAdaptations: ProposedPlanAdaptation[] = [];
  agentEvents: { id: string; timestamp: string; eventType: string; summary: string; payload: Record<string, unknown> }[] = [];
  workflowRuns: WorkflowExecutionLog[] = [];
  notifications: NotificationLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Initial User & Profile: Alex Carter (Goal: Muscle Gain)
    const userId = 'user-alex-1';
    this.users.set(userId, {
      id: userId,
      email: 'alex.carter@emberground.dev',
      name: 'Alex Carter'
    });

    const alexProfile: UserProfile = {
      id: userId,
      name: 'Alex Carter',
      email: 'alex.carter@emberground.dev',
      age: 28,
      gender: 'male',
      heightCm: 180,
      weightKg: 78,
      activityLevel: 'moderate',
      goal: 'muscle_gain',
      dietaryPreference: 'standard',
      allergies: ['Peanuts'],
      foodPreferences: ['High protein', 'Salmon', 'Greek Yogurt', 'Rice', 'Avocado'],
      trainingExperience: 'intermediate',
      availableTrainingDays: 4,
      equipment: ['Barbell', 'Dumbbells', 'Cable machine', 'Pull-up bar'],
      healthConstraints: ['Mild left patellar tendinitis (avoid deep jumping plyometrics)'],
      safetyNotes: 'Non-clinical fitness guidance. Consult an orthopedist or certified physical therapist for persistent knee symptoms.',
      createdAt: '2026-09-01T08:00:00Z'
    };
    this.profiles.set(userId, alexProfile);

    // 2. Initial Plan & Version 1
    const { bmr, tdee, targets } = calculateTargets(alexProfile);
    const initialSchedule: WorkoutScheduleItem[] = [
      { day: 'Monday', title: 'Upper Body Power', focus: 'Chest, Back, Delts (Heavy compounds)', durationMinutes: 60, completed: true },
      { day: 'Tuesday', title: 'Lower Body Hypertrophy', focus: 'Squats, Romanian Deadlifts, Calves', durationMinutes: 65, completed: false },
      { day: 'Thursday', title: 'Upper Body Hypertrophy', focus: 'Incline bench, Rows, Arms volume', durationMinutes: 55, completed: false },
      { day: 'Saturday', title: 'Full Body & Core', focus: 'Deadlifts, Overhead press, Anti-rotation', durationMinutes: 60, completed: true }
    ];

    const planId = 'plan-alex-v1';
    const planV1: Plan = {
      id: planId,
      userId,
      version: 1,
      bmr,
      tdee,
      dailyTargets: targets,
      workoutSchedule: initialSchedule,
      rationale: 'Caloric surplus of +300 kcal (2,750 kcal) and 2.0g/kg protein (156g) paired with a 4-day Upper/Lower resistance split.',
      status: 'active',
      createdAt: '2026-09-01T08:30:00Z'
    };
    this.plans.set(userId, planV1);

    this.planVersions.set(userId, [
      {
        version: 1,
        planId,
        createdAt: '2026-09-01T08:30:00Z',
        changeSummary: 'Baseline generated plan: 4-day split, 2,750 kcal, 156g protein',
        approvedByUser: true,
        approvedAt: '2026-09-01T08:35:00Z',
        targets,
        workoutDays: 4,
        agentRationale: 'Initial calibration matching intermediate lifter profile.'
      }
    ]);

    // 3. Seed Preset Food Catalog
    const shake = fallbackFoodAnalysis('shake');
    const yogurt = fallbackFoodAnalysis('yogurt');
    const wafer = fallbackFoodAnalysis('wafer');
    const salmon = fallbackFoodAnalysis('salmon');

    this.foodItems.set(shake.id, shake);
    this.foodItems.set(yogurt.id, yogurt);
    this.foodItems.set(wafer.id, wafer);
    this.foodItems.set(salmon.id, salmon);

    // 4. Seed Today's Food Logs (Shows real context: breakfast + morning snack logged, afternoon gap remaining)
    const today = new Date().toISOString().split('T')[0];
    const log1: FoodLogEntry = {
      id: 'log-1',
      userId,
      foodItemId: yogurt.id,
      foodName: yogurt.name,
      timestamp: `${today}T08:30:00Z`,
      mealType: 'breakfast',
      servings: 1,
      calories: yogurt.calories,
      proteinG: yogurt.proteinG,
      carbsG: yogurt.carbsG,
      fatG: yogurt.fatG,
      nutriGrade: yogurt.nutriScore.grade,
      confidence: yogurt.confidence,
      source: 'preset'
    };

    const log2: FoodLogEntry = {
      id: 'log-2',
      userId,
      foodItemId: shake.id,
      foodName: shake.name,
      timestamp: `${today}T11:45:00Z`,
      mealType: 'snack',
      servings: 1,
      calories: shake.calories,
      proteinG: shake.proteinG,
      carbsG: shake.carbsG,
      fatG: shake.fatG,
      nutriGrade: shake.nutriScore.grade,
      confidence: shake.confidence,
      source: 'barcode'
    };

    this.foodLogs.push(log1, log2);

    const consumedCal = log1.calories + log2.calories;
    const consumedProt = log1.proteinG + log2.proteinG;
    const consumedCarb = log1.carbsG + log2.carbsG;
    const consumedFat = log1.fatG + log2.fatG;

    this.dailyProgress.set(`${userId}_${today}`, {
      date: today,
      userId,
      targetCalories: targets.calories,
      consumedCalories: consumedCal,
      targetProtein: targets.proteinG,
      consumedProtein: consumedProt,
      targetCarbs: targets.carbsG,
      consumedCarbs: consumedCarb,
      targetFat: targets.fatG,
      consumedFat: consumedFat,
      waterConsumedMl: 1750,
      workoutsCompleted: 1,
      adherencePercentage: Math.round((consumedProt / targets.proteinG) * 100),
      logs: [log1, log2]
    });

    // 5. Seed Real-World Divergence & Pending Weekly Adaptation
    // The user's actual behavior: missed Tuesday and Thursday sessions due to late office commitments,
    // averaging 115g protein instead of 156g. The agent has observed this persistent divergence.
    const adaptation: ProposedPlanAdaptation = {
      id: 'adapt-week-1',
      userId,
      status: 'pending_user_approval',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      currentPlanVersion: 1,
      proposedPlanVersion: 2,
      triggerEvent: 'Weekly Performance Review & Schedule Friction Detection (n8n Workflow #03)',
      rootCauseAnalysis: 'Observed 3 consecutive weeks where Tuesday/Thursday weekday 60-min gym sessions had 25% adherence due to work commute friction. Furthermore, dinner intake regularly fell 35g short of target, resulting in an average daily protein of 118g vs 156g planned.',
      proposedChanges: {
        calorieTargetDelta: -150,
        newCalories: targets.calories - 150,
        proteinTargetDelta: -10,
        newProtein: 145, // realistic 1.85g/kg target that user can consistently hit
        workoutDaysDelta: -1,
        newWorkoutDays: 3,
        scheduleSummary: 'Transition from 4-day Upper/Lower to a high-density 3-day Full-Body Split (Mon / Wed / Sat) + add a convenient 25g mid-afternoon protein shake anchor.'
      },
      humanActionRequired: 'Review and approve plan recalibration. The agent will NOT silently modify your training days or calorie targets without your explicit consent.'
    };
    this.proposedAdaptations.push(adaptation);

    // 6. Seed Workflow Execution Traces (Demonstrating n8n pipeline integration)
    this.workflowRuns.push({
      id: 'wf-run-101',
      workflowId: 'food_event',
      workflowName: 'Food Event Ingestion & Real-Time Gap Assessment',
      triggeredAt: `${today}T11:45:05Z`,
      status: 'success',
      durationMs: 342,
      triggerSource: 'POST /api/workflows/food-event (Webhook)',
      inputPayload: {
        userId,
        event: 'FOOD_LOGGED',
        foodName: shake.name,
        calories: shake.calories,
        proteinG: shake.proteinG
      },
      outputPayload: {
        updatedProteinToday: consumedProt,
        remainingProtein: targets.proteinG - consumedProt,
        gapSeverity: 'moderate_gap',
        nudgeDispatched: false
      },
      stepsExecuted: [
        { nodeId: 'node-webhook', nodeName: 'HTTP Webhook Trigger', durationMs: 12, status: 'success' },
        { nodeId: 'node-auth', nodeName: 'Verify Bearer / Secret Signature', durationMs: 8, status: 'success' },
        { nodeId: 'node-fetch-state', nodeName: 'Fetch User Current State', durationMs: 45, status: 'success' },
        { nodeId: 'node-calc-gap', nodeName: 'Execute Deterministic Gap Calculation', durationMs: 15, status: 'success' },
        { nodeId: 'node-persist', nodeName: 'Postgres State Update', durationMs: 62, status: 'success' },
        { nodeId: 'node-brevo-check', nodeName: 'Evaluate Brevo Nudge Rules', durationMs: 200, status: 'success' }
      ]
    });

    this.workflowRuns.push({
      id: 'wf-run-102',
      workflowId: 'weekly_adaptation',
      workflowName: 'Sunday Weekly Review & Friction Diagnosis',
      triggeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'success',
      durationMs: 890,
      triggerSource: 'Cron: 0 19 * * SUN (Weekly Review Engine)',
      inputPayload: {
        userId,
        timeframe: '7_DAYS',
        targetWorkouts: 4,
        completedWorkouts: 2,
        targetProteinAvg: 156,
        actualProteinAvg: 118
      },
      outputPayload: {
        frictionIdentified: 'MIDWEEK_COMMUTE_BURNOUT',
        adaptationProposed: true,
        proposedVersion: 2,
        brevoNotificationSent: true
      },
      stepsExecuted: [
        { nodeId: 'node-cron', nodeName: 'Cron Schedule Trigger (Sunday 19:00)', durationMs: 5, status: 'success' },
        { nodeId: 'node-aggregate', nodeName: 'Aggregate 7-Day Adherence Log', durationMs: 120, status: 'success' },
        { nodeId: 'node-deviation-detect', nodeName: 'Detect Statistical Deviation (>25% miss)', durationMs: 85, status: 'success' },
        { nodeId: 'node-agent-diagnose', nodeName: 'Agent Friction Diagnosis & Proposal', durationMs: 450, status: 'success' },
        { nodeId: 'node-brevo-send', nodeName: 'Brevo API: Dispatch Review Email', durationMs: 230, status: 'success' }
      ]
    });

    // 7. Seed Brevo Notification History
    this.notifications.push({
      id: 'notif-1',
      recipientEmail: 'alex.carter@emberground.dev',
      channel: 'email',
      template: 'adaptation_proposal',
      subject: 'Adaptiv Review: Proposed schedule recalibration based on your past 3 weeks',
      bodyPreview: 'Alex, we observed your Tuesday/Thursday workouts have encountered recurring schedule friction. We have generated a proposed 3-day high density split for your approval.',
      sentAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'delivered'
    });
  }

  getUserProfile(userId: string): UserProfile | undefined {
    return this.profiles.get(userId);
  }

  saveUserProfile(profile: UserProfile): UserProfile {
    this.profiles.set(profile.id, profile);
    const { bmr, tdee, targets } = calculateTargets(profile);
    const existingPlan = this.plans.get(profile.id);
    if (existingPlan) {
      existingPlan.bmr = bmr;
      existingPlan.tdee = tdee;
      existingPlan.dailyTargets = targets;
    }
    return profile;
  }

  getPlan(userId: string): Plan | undefined {
    return this.plans.get(userId);
  }

  getPlanVersions(userId: string): PlanVersion[] {
    return this.planVersions.get(userId) || [];
  }

  getDailyProgress(userId: string, date: string): DailyProgressData {
    let prog = this.dailyProgress.get(`${userId}_${date}`);
    if (!prog) {
      const plan = this.plans.get(userId);
      const targets = plan?.dailyTargets || {
        calories: 2500,
        proteinG: 150,
        carbsG: 280,
        fatG: 75,
        fiberG: 35,
        waterMl: 3000
      };
      prog = {
        date,
        userId,
        targetCalories: targets.calories,
        consumedCalories: 0,
        targetProtein: targets.proteinG,
        consumedProtein: 0,
        targetCarbs: targets.carbsG,
        consumedCarbs: 0,
        targetFat: targets.fatG,
        consumedFat: 0,
        waterConsumedMl: 0,
        workoutsCompleted: 0,
        adherencePercentage: 0,
        logs: []
      };
      this.dailyProgress.set(`${userId}_${date}`, prog);
    }
    return prog;
  }

  addFoodLog(entry: Omit<FoodLogEntry, 'id' | 'timestamp'>): FoodLogEntry {
    const today = new Date().toISOString().split('T')[0];
    const log: FoodLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    this.foodLogs.push(log);

    // Update Daily Progress
    const prog = this.getDailyProgress(entry.userId, today);
    prog.consumedCalories += log.calories;
    prog.consumedProtein += log.proteinG;
    prog.consumedCarbs += log.carbsG;
    prog.consumedFat += log.fatG;
    prog.logs.push(log);
    prog.adherencePercentage = Math.min(100, Math.round((prog.consumedProtein / Math.max(1, prog.targetProtein)) * 100));
    this.dailyProgress.set(`${entry.userId}_${today}`, prog);

    // Record agent event
    this.agentEvents.push({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: 'FOOD_LOGGED',
      summary: `Logged ${log.foodName} (${log.proteinG}g protein, ${log.calories} kcal). New daily total: ${prog.consumedProtein}g / ${prog.targetProtein}g protein.`,
      payload: { logId: log.id, foodName: log.foodName, calories: log.calories, proteinG: log.proteinG }
    });

    return log;
  }

  getProposedAdaptations(userId: string): ProposedPlanAdaptation[] {
    return this.proposedAdaptations.filter(a => a.userId === userId);
  }

  resolveAdaptation(adaptationId: string, action: 'approved' | 'rejected'): ProposedPlanAdaptation | undefined {
    const adapt = this.proposedAdaptations.find(a => a.id === adaptationId);
    if (!adapt) return undefined;

    adapt.status = action;

    if (action === 'approved') {
      const plan = this.plans.get(adapt.userId);
      if (plan) {
        plan.version = adapt.proposedPlanVersion;
        plan.dailyTargets.calories = adapt.proposedChanges.newCalories;
        plan.dailyTargets.proteinG = adapt.proposedChanges.newProtein;
        // Recalculate carbs/fat
        const fatKcal = plan.dailyTargets.calories * 0.27;
        plan.dailyTargets.fatG = Math.round(fatKcal / 9);
        const remKcal = plan.dailyTargets.calories - (plan.dailyTargets.proteinG * 4 + fatKcal);
        plan.dailyTargets.carbsG = Math.round(remKcal / 4);

        // Update schedule
        plan.workoutSchedule = [
          { day: 'Monday', title: 'Full Body Compound A', focus: 'Squats, Bench Press, Barbell Rows', durationMinutes: 60, completed: false },
          { day: 'Wednesday', title: 'Full Body Compound B', focus: 'Deadlifts, Overhead Press, Pull-ups', durationMinutes: 60, completed: false },
          { day: 'Saturday', title: 'Full Body Hypertrophy & Arms', focus: 'Lunges, Incline DB, Lat pulldown, Arms', durationMinutes: 60, completed: false }
        ];

        // Record Plan Version
        const versions = this.planVersions.get(adapt.userId) || [];
        versions.push({
          version: adapt.proposedPlanVersion,
          planId: plan.id,
          createdAt: new Date().toISOString(),
          changeSummary: `Recalibrated to 3-day split, ${adapt.proposedChanges.newCalories} kcal, ${adapt.proposedChanges.newProtein}g protein`,
          approvedByUser: true,
          approvedAt: new Date().toISOString(),
          targets: { ...plan.dailyTargets },
          workoutDays: adapt.proposedChanges.newWorkoutDays,
          agentRationale: adapt.rootCauseAnalysis
        });
        this.planVersions.set(adapt.userId, versions);

        // Record notification
        this.notifications.push({
          id: `notif-${Date.now()}`,
          recipientEmail: this.users.get(adapt.userId)?.email || 'user@emberground.dev',
          channel: 'email',
          template: 'weekly_review',
          subject: 'Plan Version 2 Activated: 3-Day High-Yield Split',
          bodyPreview: `Your updated plan has been successfully activated. Target calories adjusted to ${adapt.proposedChanges.newCalories} kcal, protein to ${adapt.proposedChanges.newProtein}g.`,
          sentAt: new Date().toISOString(),
          status: 'delivered'
        });
      }
    }

    return adapt;
  }

  getWorkflowRuns(): WorkflowExecutionLog[] {
    return this.workflowRuns.slice().reverse();
  }

  logWorkflowRun(run: WorkflowExecutionLog) {
    this.workflowRuns.push(run);
  }

  getNotifications(): NotificationLog[] {
    return this.notifications.slice().reverse();
  }

  addNotification(notif: Omit<NotificationLog, 'id' | 'sentAt'>): NotificationLog {
    const entry: NotificationLog = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sentAt: new Date().toISOString()
    };
    this.notifications.push(entry);
    return entry;
  }
}

export const db = new InMemoryDatabase();
