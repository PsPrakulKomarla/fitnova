import React, { useState } from 'react';
import {
  Cpu,
  GitCompare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Calendar,
  History,
  ShieldCheck,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { Plan, PlanVersion, ProposedPlanAdaptation } from '../types/index.js';

interface AdaptiveAgentViewProps {
  plan: Plan | null;
  versions: PlanVersion[];
  adaptations: ProposedPlanAdaptation[];
  onActionAdaptation: (id: string, action: 'approved' | 'rejected') => Promise<void>;
  onTriggerWeeklyReview: () => Promise<void>;
}

export const AdaptiveAgentView: React.FC<AdaptiveAgentViewProps> = ({
  plan,
  versions,
  adaptations,
  onActionAdaptation,
  onTriggerWeeklyReview
}) => {
  const [acting, setActing] = useState(false);
  const [triggeringReview, setTriggeringReview] = useState(false);

  const pendingAdaptation = adaptations.find(a => a.status === 'pending_user_approval');

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!pendingAdaptation) return;
    setActing(true);
    try {
      await onActionAdaptation(pendingAdaptation.id, action);
    } finally {
      setActing(false);
    }
  };

  const handleTriggerReview = async () => {
    setTriggeringReview(true);
    try {
      await onTriggerWeeklyReview();
    } finally {
      setTriggeringReview(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Continuous Adaptation Engine
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">Autonomous Diagnostic Loop</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Adaptive Agent & Schedule Recalibration
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              "The AI doesn't stop after generating your plan. It remains active, monitors the gap between expectations and real-world behavior, and proposes human-approved adaptations."
            </p>
          </div>

          <button
            onClick={handleTriggerReview}
            disabled={triggeringReview}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{triggeringReview ? 'Diagnosing...' : 'Run Weekly Adherence Review'}</span>
          </button>
        </div>
      </div>

      {/* PENDING HUMAN-IN-THE-LOOP ADAPTATION PROPOSAL */}
      {pendingAdaptation ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 rounded-3xl border-2 border-amber-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    Action Required: Proposed Plan Recalibration
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    Human-In-The-Loop Approval
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pendingAdaptation.triggerEvent}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-500">
              v{pendingAdaptation.currentPlanVersion} → v{pendingAdaptation.proposedPlanVersion}
            </span>
          </div>

          {/* Root Cause Analysis from Agent */}
          <div className="my-5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-400" />
              Agent Diagnostic & Observed Real-World Friction
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">
              {pendingAdaptation.rootCauseAnalysis}
            </p>
          </div>

          {/* Side-by-Side Plan Diff */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
            {/* Current Plan */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-bold uppercase">
                <span>Current Plan (Version {pendingAdaptation.currentPlanVersion})</span>
                <span className="text-slate-500">Underperforming</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                  <span>Training Frequency:</span>
                  <span className="font-bold text-white">4 Days / Week</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-300">
                  <span>Daily Calorie Target:</span>
                  <span className="font-bold text-white">{plan?.dailyTargets.calories || 2750} kcal</span>
                </div>
                <div className="flex justify-between py-1 text-slate-300">
                  <span>Daily Protein Target:</span>
                  <span className="font-bold text-white">{plan?.dailyTargets.proteinG || 156}g (2.0g/kg)</span>
                </div>
              </div>
            </div>

            {/* Proposed Plan */}
            <div className="bg-emerald-950/20 p-5 rounded-2xl border border-emerald-500/40">
              <div className="flex items-center justify-between mb-3 text-xs text-emerald-400 font-bold uppercase">
                <span>Proposed Plan (Version {pendingAdaptation.proposedPlanVersion})</span>
                <span className="text-emerald-400 font-semibold">High Adherence Yield</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-200">
                  <span>Training Frequency:</span>
                  <span className="font-extrabold text-emerald-400">
                    {pendingAdaptation.proposedChanges.newWorkoutDays} Days / Week ({pendingAdaptation.proposedChanges.workoutDaysDelta} day)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60 text-slate-200">
                  <span>Daily Calorie Target:</span>
                  <span className="font-extrabold text-emerald-400">
                    {pendingAdaptation.proposedChanges.newCalories} kcal ({pendingAdaptation.proposedChanges.calorieTargetDelta} kcal)
                  </span>
                </div>
                <div className="flex justify-between py-1 text-slate-200">
                  <span>Daily Protein Target:</span>
                  <span className="font-extrabold text-emerald-400">
                    {pendingAdaptation.proposedChanges.newProtein}g (Sustainable 1.85g/kg)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl text-xs text-slate-400 mb-6">
            <strong>Schedule Adaptation Rationale: </strong>
            {pendingAdaptation.proposedChanges.scheduleSummary}
          </div>

          {/* Action Decision Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => handleAction('rejected')}
              disabled={acting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all disabled:opacity-50"
            >
              Keep Existing Plan (Dismiss)
            </button>

            <button
              onClick={() => handleAction('approved')}
              disabled={acting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{acting ? 'Activating Plan...' : 'Approve & Activate Plan Version 2'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 text-center py-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            Plan Version {plan?.version || 1} Is Currently Active & In Effect
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            No pending plan changes required right now. The agent continues observing your logged meals and workouts to identify when friction emerges.
          </p>
        </div>
      )}

      {/* VERSION HISTORY & AUDIT TRAIL */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Plan Version History & Provenance Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable changelog of plan modifications approved by you.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{versions.length} versions</span>
        </div>

        <div className="space-y-3">
          {versions.map((ver) => (
            <div
              key={ver.version}
              className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Version {ver.version}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {ver.changeSummary}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {ver.agentRationale}
                </p>
              </div>

              <div className="text-right text-xs font-mono text-slate-400 shrink-0">
                <div className="text-emerald-400 font-semibold">
                  {ver.targets.calories} kcal • {ver.targets.proteinG}g protein
                </div>
                <div className="text-[11px] text-slate-500">
                  {new Date(ver.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
