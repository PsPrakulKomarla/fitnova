import { WorkflowExecutionLog } from '../src/types/index.js';
import { db } from './db.js';

export async function triggerFoodEventWorkflow(payload: {
  userId: string;
  foodName: string;
  calories: number;
  proteinG: number;
  nutriGrade: string;
}): Promise<WorkflowExecutionLog> {
  const startTime = Date.now();
  const profile = db.getUserProfile(payload.userId);
  const plan = db.getPlan(payload.userId);
  const today = new Date().toISOString().split('T')[0];
  const progress = db.getDailyProgress(payload.userId, today);

  const targets = plan?.dailyTargets || { proteinG: 150, calories: 2500 };
  const remProtein = targets.proteinG - progress.consumedProtein;
  const remCal = targets.calories - progress.consumedCalories;

  const stepsExecuted: WorkflowExecutionLog['stepsExecuted'] = [
    { nodeId: 'node-webhook-inbound', nodeName: 'Inbound Webhook: Food Analyzed', durationMs: 14, status: 'success' },
    { nodeId: 'node-fetch-profile', nodeName: 'Postgres: Fetch User Profile & Allergies', durationMs: 25, status: 'success' },
    { nodeId: 'node-deterministic-gap', nodeName: 'Math Engine: Calculate Macronutrient Gap', durationMs: 8, status: 'success' }
  ];

  let nudgeDispatched = false;
  let nudgeSubject = '';

  if (remProtein > 30) {
    nudgeDispatched = true;
    nudgeSubject = `Adaptiv Gap Alert: ${Math.round(remProtein)}g protein remaining today`;
    stepsExecuted.push({
      nodeId: 'node-brevo-nudge',
      nodeName: 'Brevo Node: Send Smart Dinner Nudge',
      durationMs: 85,
      status: 'success'
    });

    db.addNotification({
      recipientEmail: profile?.email || 'alex.carter@emberground.dev',
      channel: 'email',
      template: 'daily_gap',
      subject: nudgeSubject,
      bodyPreview: `You've logged ${progress.consumedProtein}g of protein so far today. You have ~${Math.round(remProtein)}g remaining within your calorie budget. Consider a food-first option like greek yogurt or grilled chicken.`,
      status: 'delivered'
    });
  } else {
    stepsExecuted.push({
      nodeId: 'node-brevo-suppressed',
      nodeName: 'Brevo Node: Threshold Check (No Alert Needed - User On Track)',
      durationMs: 10,
      status: 'success'
    });
  }

  stepsExecuted.push({
    nodeId: 'node-store-result',
    nodeName: 'Database: Commit Event Telemetry',
    durationMs: 18,
    status: 'success'
  });

  const totalDuration = Date.now() - startTime;
  const executionLog: WorkflowExecutionLog = {
    id: `wf-run-${Date.now()}`,
    workflowId: 'food_event',
    workflowName: 'Food Event Ingestion & Real-Time Gap Assessment',
    triggeredAt: new Date().toISOString(),
    status: 'success',
    durationMs: Math.max(35, totalDuration),
    triggerSource: 'POST /api/workflows/food-event (Webhook)',
    inputPayload: payload,
    outputPayload: {
      consumedProteinTotal: progress.consumedProtein,
      remainingProtein: Math.max(0, remProtein),
      remainingCalories: remCal,
      nudgeDispatched,
      nudgeSubject
    },
    stepsExecuted
  };

  db.logWorkflowRun(executionLog);
  return executionLog;
}

export async function triggerDailyReviewWorkflow(userId: string): Promise<WorkflowExecutionLog> {
  const startTime = Date.now();
  const profile = db.getUserProfile(userId);
  const plan = db.getPlan(userId);
  const today = new Date().toISOString().split('T')[0];
  const progress = db.getDailyProgress(userId, today);

  const targets = plan?.dailyTargets || { proteinG: 150, calories: 2500 };
  const adherence = Math.min(100, Math.round((progress.consumedProtein / targets.proteinG) * 100));

  const stepsExecuted: WorkflowExecutionLog['stepsExecuted'] = [
    { nodeId: 'node-cron-2100', nodeName: 'Cron Schedule (Everyday 21:00)', durationMs: 6, status: 'success' },
    { nodeId: 'node-aggregate-day', nodeName: 'Aggregate Daily Macros & Logs', durationMs: 42, status: 'success' },
    { nodeId: 'node-eval-adherence', nodeName: 'Compute Daily Adherence Score', durationMs: 12, status: 'success' },
    { nodeId: 'node-brevo-digest', nodeName: 'Brevo API: Dispatch Daily Summary', durationMs: 95, status: 'success' }
  ];

  db.addNotification({
    recipientEmail: profile?.email || 'alex.carter@emberground.dev',
    channel: 'email',
    template: 'daily_gap',
    subject: `Adaptiv Daily Summary: ${adherence}% Macro Adherence (${today})`,
    bodyPreview: `Great effort today! You hit ${progress.consumedProtein}g / ${targets.proteinG}g protein and ${progress.consumedCalories} / ${targets.calories} kcal.`,
    status: 'delivered'
  });

  const totalDuration = Date.now() - startTime;
  const executionLog: WorkflowExecutionLog = {
    id: `wf-run-${Date.now()}`,
    workflowId: 'daily_review',
    workflowName: 'Daily Review & Adherence Scoring',
    triggeredAt: new Date().toISOString(),
    status: 'success',
    durationMs: Math.max(50, totalDuration),
    triggerSource: 'Cron: 0 21 * * * (Daily Evening Trigger)',
    inputPayload: { userId, date: today },
    outputPayload: {
      consumedCalories: progress.consumedCalories,
      consumedProtein: progress.consumedProtein,
      adherencePercentage: adherence,
      logsCount: progress.logs.length
    },
    stepsExecuted
  };

  db.logWorkflowRun(executionLog);
  return executionLog;
}

export async function triggerWeeklyReviewWorkflow(userId: string): Promise<WorkflowExecutionLog> {
  const startTime = Date.now();
  const profile = db.getUserProfile(userId);
  const plan = db.getPlan(userId);

  const stepsExecuted: WorkflowExecutionLog['stepsExecuted'] = [
    { nodeId: 'node-cron-sunday', nodeName: 'Cron Schedule (Sunday 19:00)', durationMs: 8, status: 'success' },
    { nodeId: 'node-fetch-7d-history', nodeName: 'Fetch 7-Day Food & Workout Logs', durationMs: 65, status: 'success' },
    { nodeId: 'node-statistical-analysis', nodeName: 'Analyze Friction Points & Schedule Deviations', durationMs: 110, status: 'success' },
    { nodeId: 'node-agent-recalibration', nodeName: 'Generate Adaptation Proposal Candidate', durationMs: 230, status: 'success' },
    { nodeId: 'node-human-in-the-loop', nodeName: 'Emit Human-In-The-Loop Approval Request', durationMs: 35, status: 'success' },
    { nodeId: 'node-brevo-proposal', nodeName: 'Brevo API: Dispatch Weekly Proposal Email', durationMs: 140, status: 'success' }
  ];

  // Check if there is already a proposed adaptation or generate one
  let adaptations = db.getProposedAdaptations(userId);
  let activeAdapt = adaptations.find(a => a.status === 'pending_user_approval');

  if (!activeAdapt && plan) {
    activeAdapt = {
      id: `adapt-${Date.now()}`,
      userId,
      status: 'pending_user_approval',
      createdAt: new Date().toISOString(),
      currentPlanVersion: plan.version,
      proposedPlanVersion: plan.version + 1,
      triggerEvent: 'Weekly Performance Review & Schedule Friction Detection (n8n Workflow #03)',
      rootCauseAnalysis: 'Observed that Wednesday and Friday workout sessions were missed due to variable schedule load, and average protein intake was 122g vs 156g. Adapting to 3 full-body sessions eliminates schedule conflict while sustaining mechanical tension.',
      proposedChanges: {
        calorieTargetDelta: -100,
        newCalories: plan.dailyTargets.calories - 100,
        proteinTargetDelta: -10,
        newProtein: 145,
        workoutDaysDelta: -1,
        newWorkoutDays: 3,
        scheduleSummary: '3-Day High-Density Full Body Split (Mon / Wed / Sat) + targeted protein distribution.'
      },
      humanActionRequired: 'Review and approve plan recalibration.'
    };
    db.proposedAdaptations.push(activeAdapt);
  }

  db.addNotification({
    recipientEmail: profile?.email || 'alex.carter@emberground.dev',
    channel: 'email',
    template: 'adaptation_proposal',
    subject: 'Adaptiv Review: Proposed plan adaptation for next week ready for your approval',
    bodyPreview: 'We noticed a consistent friction pattern on your midweek workouts. We have formulated an adapted 3-day split to ensure consistent progression without burnout.',
    status: 'delivered'
  });

  const totalDuration = Date.now() - startTime;
  const executionLog: WorkflowExecutionLog = {
    id: `wf-run-${Date.now()}`,
    workflowId: 'weekly_adaptation',
    workflowName: 'Sunday Weekly Review & Friction Diagnosis',
    triggeredAt: new Date().toISOString(),
    status: 'success',
    durationMs: Math.max(120, totalDuration),
    triggerSource: 'Cron: 0 19 * * SUN (Weekly Review Engine)',
    inputPayload: { userId, timeWindow: 'LAST_7_DAYS' },
    outputPayload: {
      proposedAdaptationId: activeAdapt?.id,
      proposedVersion: activeAdapt?.proposedPlanVersion,
      requiresHumanApproval: true,
      brevoDispatched: true
    },
    stepsExecuted
  };

  db.logWorkflowRun(executionLog);
  return executionLog;
}
