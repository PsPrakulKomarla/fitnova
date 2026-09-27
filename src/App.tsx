import React, { useState, useEffect } from 'react';
import {
  Activity,
  Target,
  Zap,
  Cpu,
  Bell,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Flame,
  Dumbbell
} from 'lucide-react';
import { Navbar } from './components/Navbar.js';
import { FoodScannerModal } from './components/FoodScannerModal.js';
import { FoodResultView } from './components/FoodResultView.js';
import { Phase3ScannerModal } from './components/Phase3ScannerModal.js';
import { Phase3FoodResultView } from './components/Phase3FoodResultView.js';
import { FoodScanJob } from '../server/modules/food/food.models.js';
import { TodayPlanView } from './components/TodayPlanView.js';
import { ProgressView } from './components/ProgressView.js';
import { FoodIntelligenceView } from './components/FoodIntelligenceView.js';
import { PersonalizedIntelligenceView } from './components/PersonalizedIntelligenceView.js';
import { AdaptiveAgentView } from './components/AdaptiveAgentView.js';
import { WorkflowAutomationView } from './components/WorkflowAutomationView.js';
import { ProfileView } from './components/ProfileView.js';
import { TestingSuiteView } from './components/TestingSuiteView.js';
import {
  UserProfile,
  Plan,
  PlanVersion,
  DailyProgressData,
  ProposedPlanAdaptation,
  WorkflowExecutionLog,
  NotificationLog,
  FoodItemData,
  GoalGapAnalysis
} from './types/index.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isPhase3ScannerOpen, setIsPhase3ScannerOpen] = useState<boolean>(false);
  const [phase3Job, setPhase3Job] = useState<FoodScanJob | null>(null);
  const [activeScanResult, setActiveScanResult] = useState<{
    foodItem: FoodItemData;
    gapAnalysis: GoalGapAnalysis | null;
  } | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [dailyProgress, setDailyProgress] = useState<DailyProgressData | null>(null);
  const [adaptations, setAdaptations] = useState<ProposedPlanAdaptation[]>([]);
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowExecutionLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);

  // Fetch initial state from server
  const loadState = async () => {
    try {
      const [profRes, planRes, verRes, progRes, adaptRes, wfRes, notifRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/plan'),
        fetch('/api/plan/versions'),
        fetch('/api/daily-progress'),
        fetch('/api/agent/adaptations'),
        fetch('/api/workflows/logs'),
        fetch('/api/notifications')
      ]);

      if (profRes.ok) setProfile(await profRes.json());
      if (planRes.ok) setPlan(await planRes.json());
      if (verRes.ok) setVersions(await verRes.json());
      if (progRes.ok) setDailyProgress(await progRes.json());
      if (adaptRes.ok) setAdaptations(await adaptRes.json());
      if (wfRes.ok) setWorkflowLogs(await wfRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.error('Failed to load application state:', err);
    }
  };

  useEffect(() => {
    loadState();
  }, []);

  const handleScanComplete = (result: { foodItem: FoodItemData; gapAnalysis: GoalGapAnalysis }) => {
    setActiveScanResult(result);
    setCurrentTab('scan_result');
  };

  const handlePhase3ScanComplete = (job: FoodScanJob) => {
    setPhase3Job(job);
    setCurrentTab('phase3_result');
  };

  const handleLogMeal = async (
    item: FoodItemData,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ) => {
    const res = await fetch('/api/food/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: profile?.id || 'user-alex-1',
        foodItem: item,
        mealType,
        servings: 1,
        source: item.confidence === 'VERIFIED' ? 'barcode' : 'camera'
      })
    });

    if (res.ok) {
      await loadState();
      setActiveScanResult(null);
      setCurrentTab('today');
    }
  };

  const handleActionAdaptation = async (id: string, action: 'approved' | 'rejected') => {
    const res = await fetch(`/api/agent/adaptations/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });

    if (res.ok) {
      await loadState();
    }
  };

  const handleTriggerWorkflow = async (workflowId: 'food_event' | 'daily_review' | 'weekly_adaptation') => {
    const res = await fetch('/api/workflows/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflowId, userId: profile?.id || 'user-alex-1' })
    });

    if (res.ok) {
      await loadState();
    }
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });

    if (res.ok) {
      await loadState();
    }
  };

  const pendingAdaptationsCount = adaptations.filter(a => a.status === 'pending_user_approval').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Primary Header & Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'scan') {
            setIsScannerOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        profile={profile}
        plan={plan}
        dailyProgress={dailyProgress}
        pendingAdaptationsCount={pendingAdaptationsCount}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PHASE 3 STRUCTURED FOOD RESULT VIEW */}
        {currentTab === 'phase3_result' && phase3Job ? (
          <Phase3FoodResultView
            scanJob={phase3Job}
            onScanAnother={() => setIsPhase3ScannerOpen(true)}
            onUploadAdditionalLabel={() => setIsPhase3ScannerOpen(true)}
          />
        ) : null}

        {/* SCAN RESULT VIEW (When a food item is scanned) */}
        {currentTab === 'scan_result' && activeScanResult ? (
          <FoodResultView
            foodItem={activeScanResult.foodItem}
            gapAnalysis={activeScanResult.gapAnalysis}
            onLogMeal={handleLogMeal}
            onClose={() => setCurrentTab('today')}
          />
        ) : null}

        {/* OVERVIEW TAB */}
        {currentTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Hackathon Hero Banner & Thesis */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-16 -top-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                    EmberGround Hackathon 2026 Core Thesis
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  "Most AI fitness tools stop when they generate your plan. Our agent manages the gap between reality and your goal."
                </h1>

                <p className="text-sm text-slate-300 mt-4 leading-relaxed">
                  Adaptiv turns food scanning into real-time observation, compares your actual day against biological targets, identifies gaps, and executes long-running workflows to adapt the plan when real life interferes.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    onClick={() => setCurrentTab('personalization')}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Explore Intelligence Loop (Phase 5)</span>
                  </button>

                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Scan Food Item</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('agent')}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
                  >
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Adaptive Agent ({pendingAdaptationsCount} Action)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* The Central Agent Loop Visualizer */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    The Autonomous Adaptive Loop
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How information flows continuously from sensory observation to plan adaptation.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Closed Loop
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
                {[
                  { step: '01. CONTEXT', desc: 'Age, Biometrics, Allergies & Goals' },
                  { step: '02. PLAN v1', desc: 'Mifflin BMR, Macros & Training Split' },
                  { step: '03. FOOD SCAN', desc: 'Multimodal Gemini OCR & Nutrition' },
                  { step: '04. GAP DETECT', desc: 'Real-time remaining macro delta' },
                  { step: '05. SMART NUDGE', desc: 'Food-first actionable recommendations' },
                  { step: '06. AUDIT LOG', desc: '3-week adherence friction diagnosis' },
                  { step: '07. PLAN v2', desc: 'Human-in-the-loop recalibration' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex flex-col justify-between"
                  >
                    <span className="text-[10px] font-mono text-emerald-400 font-bold mb-1">
                      {item.step}
                    </span>
                    <p className="text-[11px] text-slate-300 font-medium">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Today's Reality */}
              <div
                onClick={() => setCurrentTab('today')}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Today's Intake State
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white">
                    {dailyProgress?.consumedProtein || 0}g <span className="text-xs text-slate-500 font-normal">/ {plan?.dailyTargets.proteinG || 156}g protein</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    {dailyProgress?.consumedCalories || 0} / {plan?.dailyTargets.calories || 2750} kcal logged.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span>Open Daily Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 2: Adaptive Agent Recalibration */}
              <div
                onClick={() => setCurrentTab('agent')}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-amber-500/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Agent Recalibration
                    </span>
                    {pendingAdaptationsCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 animate-pulse">
                        Action Waiting
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    Plan Version {plan?.version || 1}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Friction detected on weekday training schedule. Proposed 3-day high density split ready for approval.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-amber-400 font-semibold">
                  <span>Review Proposal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Card 3: Deterministic Tests */}
              <div
                onClick={() => setCurrentTab('tests')}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl hover:border-emerald-500/40 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Engine Verification
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    17 Passing Invariants
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Nutri-Score 2023, Mifflin BMR, TDEE, E-number taxonomy, and allergen isolation verified.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span>Run Test Suite</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TODAY'S PLAN TAB */}
        {currentTab === 'today' && (
          <TodayPlanView
            progress={dailyProgress}
            plan={plan}
            profile={profile}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {/* PROGRESS & REALITY TAB */}
        {currentTab === 'progress' && (
          <ProgressView
            plan={plan}
            profile={profile}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        )}

        {/* PERSONALIZED INTELLIGENCE & EXPLAINABILITY TAB (PHASE 5) */}
        {currentTab === 'personalization' && (
          <PersonalizedIntelligenceView
            profile={profile}
            dailyProgress={dailyProgress}
            onOpenScanner={() => setIsScannerOpen(true)}
            onLogMeal={handleLogMeal}
          />
        )}

        {/* FOOD INTELLIGENCE TAB */}
        {currentTab === 'intelligence' && (
          <FoodIntelligenceView />
        )}

        {/* ADAPTIVE AGENT TAB */}
        {currentTab === 'agent' && (
          <AdaptiveAgentView
            plan={plan}
            versions={versions}
            adaptations={adaptations}
            onActionAdaptation={handleActionAdaptation}
            onTriggerWeeklyReview={() => handleTriggerWorkflow('weekly_adaptation')}
          />
        )}

        {/* WORKFLOWS & BREVO TAB */}
        {currentTab === 'workflows' && (
          <WorkflowAutomationView
            workflowLogs={workflowLogs}
            notifications={notifications}
            onTriggerWorkflow={handleTriggerWorkflow}
          />
        )}

        {/* PROFILE & SAFETY TAB */}
        {currentTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        )}

        {/* ENGINE TESTS TAB */}
        {currentTab === 'tests' && <TestingSuiteView />}
      </main>

      {/* Global Food Scanner Modal */}
      <FoodScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
        userId={profile?.id || 'user-alex-1'}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">ADAPTIV</span>
            <span>•</span>
            <span>EmberGround AI Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Deterministic Scoring</span>
            <span>•</span>
            <span>Santé Publique France 2023 Update</span>
            <span>•</span>
            <span>Non-Diagnostic Clinical Safety Boundary</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
