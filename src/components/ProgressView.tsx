import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Activity,
  Flame,
  Dumbbell,
  Target,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Plan, UserProfile } from '../types/index.js';

interface ProgressViewProps {
  plan: Plan | null;
  profile: UserProfile | null;
  onOpenScanner: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ plan, profile, onOpenScanner }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');

  // Realistic historical data demonstrating the core hackathon thesis:
  // User planned 4 workouts and 156g protein, but consistently missed Tue/Thu
  // Week 1-3 shows the real-world divergence that triggered the agent's adaptation proposal.
  const history7d = [
    { day: 'Mon', plannedProtein: 156, actualProtein: 148, plannedWorkout: true, workoutDone: true, cal: 2680 },
    { day: 'Tue', plannedProtein: 156, actualProtein: 110, plannedWorkout: true, workoutDone: false, cal: 2200 }, // Missed
    { day: 'Wed', plannedProtein: 156, actualProtein: 142, plannedWorkout: false, workoutDone: false, cal: 2550 },
    { day: 'Thu', plannedProtein: 156, actualProtein: 115, plannedWorkout: true, workoutDone: false, cal: 2150 }, // Missed
    { day: 'Fri', plannedProtein: 156, actualProtein: 125, plannedWorkout: false, workoutDone: false, cal: 2400 },
    { day: 'Sat', plannedProtein: 156, actualProtein: 155, plannedWorkout: true, workoutDone: true, cal: 2750 }, // Done
    { day: 'Sun', plannedProtein: 156, actualProtein: 130, plannedWorkout: false, workoutDone: false, cal: 2500 }
  ];

  const weeklyTrends = [
    { week: 'Week 1', plannedSessions: 4, actualSessions: 3, avgProtein: 138, adherence: 75 },
    { week: 'Week 2', plannedSessions: 4, actualSessions: 2, avgProtein: 122, adherence: 60 },
    { week: 'Week 3 (Pre-Adaptation)', plannedSessions: 4, actualSessions: 2, avgProtein: 118, adherence: 58 },
    { week: 'Week 4 (Adapted v2 Plan)', plannedSessions: 3, actualSessions: 3, avgProtein: 145, adherence: 96 }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Reality vs. Plan Diagnostics
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Behavioral Progress & Adherence Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Persistent tracking of real-world nutrition intake and workout consistency over time.
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeframe === '7d' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7-Day View
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                timeframe === '30d' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4-Week Trend
            </button>
          </div>
        </div>
      </div>

      {/* 7-DAY INTAKE & WORKOUT ADHERENCE MATRIX */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              7-Day Daily Protein Reality vs. Target (156g)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Notice the recurring drop on Tuesday and Thursday (commute days), which triggered the agent's adaptation.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Avg: 132g / day
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-6 pb-2">
          {history7d.map((item, idx) => {
            const heightPct = Math.min(100, Math.round((item.actualProtein / item.plannedProtein) * 100));
            const isFrictionDay = item.day === 'Tue' || item.day === 'Thu';
            return (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full h-44 bg-slate-950 rounded-2xl p-1.5 flex flex-col justify-end border border-slate-800 relative group">
                  {/* Target line indicator */}
                  <div className="absolute top-4 left-0 right-0 border-b border-dashed border-emerald-500/40 z-10" />

                  {/* Actual Intake Bar */}
                  <div
                    className={`w-full rounded-xl transition-all duration-500 flex flex-col items-center justify-end pb-2 ${
                      isFrictionDay
                        ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                        : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  >
                    <span className="text-[10px] font-bold text-slate-950">
                      {item.actualProtein}g
                    </span>
                  </div>
                </div>

                {/* Day Label & Workout Status */}
                <div className="mt-3 text-center">
                  <span className="text-xs font-bold text-slate-200 block">{item.day}</span>
                  {item.plannedWorkout ? (
                    item.workoutDone ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 mt-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-400 mt-1 font-semibold">
                        <XCircle className="w-3 h-3" /> Missed
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-500 mt-1 block">Rest</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-WEEK TREND & AGENT ADAPTATION IMPACT */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Weekly Adherence Progression
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrates the measurable impact of human-approved plan recalibration.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {weeklyTrends.map((wt, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border ${
                i === 3
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200">{wt.week}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  wt.adherence >= 90
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : wt.adherence >= 70
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {wt.adherence}% Adherence
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 mt-3">
                <div className="flex justify-between">
                  <span>Workouts Done:</span>
                  <span className="font-semibold text-slate-200">{wt.actualSessions} / {wt.plannedSessions} sessions</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Protein:</span>
                  <span className="font-semibold text-slate-200">{wt.avgProtein}g / day</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-500">
                {i === 3 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Plan v2 High-Yield Split Active
                  </span>
                ) : (
                  <span>Plan v1 (4-Day Split)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
