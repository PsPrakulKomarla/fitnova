import React from 'react';
import {
  Activity,
  Flame,
  Dumbbell,
  Droplets,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { DailyProgressData, NutriGrade, Plan, UserProfile } from '../types/index.js';

interface TodayPlanViewProps {
  progress: DailyProgressData | null;
  plan: Plan | null;
  profile: UserProfile | null;
  onOpenScanner: () => void;
  onToggleWorkout?: (index: number) => void;
}

export const TodayPlanView: React.FC<TodayPlanViewProps> = ({
  progress,
  plan,
  profile,
  onOpenScanner
}) => {
  const targets = plan?.dailyTargets || {
    calories: 2750,
    proteinG: 156,
    carbsG: 310,
    fatG: 82,
    fiberG: 38,
    waterMl: 3200
  };

  const consumedCalories = progress?.consumedCalories || 0;
  const consumedProtein = progress?.consumedProtein || 0;
  const consumedCarbs = progress?.consumedCarbs || 0;
  const consumedFat = progress?.consumedFat || 0;
  const consumedWater = progress?.waterConsumedMl || 1750;

  const remCalories = targets.calories - consumedCalories;
  const remProtein = targets.proteinG - consumedProtein;

  const proteinPct = Math.min(100, Math.round((consumedProtein / targets.proteinG) * 100));
  const caloriesPct = Math.min(100, Math.round((consumedCalories / targets.calories) * 100));
  const carbsPct = Math.min(100, Math.round((consumedCarbs / targets.carbsG) * 100));
  const fatPct = Math.min(100, Math.round((consumedFat / targets.fatG) * 100));
  const waterPct = Math.min(100, Math.round((consumedWater / targets.waterMl) * 100));

  const getNutriBadgeColor = (grade: NutriGrade) => {
    switch (grade) {
      case 'A': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'B': return 'bg-lime-500/20 text-lime-400 border-lime-500/40';
      case 'C': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'D': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'E': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overview Hero Barometer */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Daily Execution Dashboard
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Today's Nutrition & Training Reality
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active Plan Version {plan?.version || 1} • Goal: <strong className="text-emerald-400 capitalize">{profile?.goal.replace('_', ' ') || 'Muscle Gain'}</strong>
            </p>
          </div>

          <button
            onClick={onOpenScanner}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Scan & Log Meal</span>
          </button>
        </div>

        {/* Macro Progress Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {/* Protein Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Protein</span>
              <span className="text-xs font-mono text-slate-400">{proteinPct}%</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white">
                {consumedProtein}g <span className="text-xs text-slate-500 font-normal">/ {targets.proteinG}g</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {remProtein > 0 ? `${remProtein}g remaining` : 'Target reached!'}
              </div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>

          {/* Calories Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Calories</span>
              <span className="text-xs font-mono text-slate-400">{caloriesPct}%</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white">
                {consumedCalories} <span className="text-xs text-slate-500 font-normal">/ {targets.calories}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {remCalories > 0 ? `${remCalories} kcal buffer` : `${Math.abs(remCalories)} kcal over target`}
              </div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${caloriesPct}%` }} />
            </div>
          </div>

          {/* Carbs Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Carbs</span>
              <span className="text-xs font-mono text-slate-400">{carbsPct}%</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white">
                {consumedCarbs}g <span className="text-xs text-slate-500 font-normal">/ {targets.carbsG}g</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {targets.carbsG - consumedCarbs}g left
              </div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: `${carbsPct}%` }} />
            </div>
          </div>

          {/* Fat Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Fat</span>
              <span className="text-xs font-mono text-slate-400">{fatPct}%</span>
            </div>
            <div className="my-2">
              <div className="text-2xl font-black text-white">
                {consumedFat}g <span className="text-xs text-slate-500 font-normal">/ {targets.fatG}g</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {targets.fatG - consumedFat}g left
              </div>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${fatPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Workout Plan vs Meal Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Logged Meals Today */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Meals Logged Today
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified intake timeline powering the persistent agent's state.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {progress?.logs.length || 0} entries
              </span>
            </div>

            {progress?.logs && progress.logs.length > 0 ? (
              <div className="space-y-3">
                {progress.logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${getNutriBadgeColor(log.nutriGrade)}`}>
                        {log.nutriGrade}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-200">
                            {log.foodName}
                          </h4>
                          <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            {log.mealType}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                          <span className="text-emerald-400 font-semibold">{log.proteinG}g protein</span>
                          <span>•</span>
                          <span>{log.calories} kcal</span>
                          <span>•</span>
                          <span className="text-slate-500 text-[11px]">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs font-mono text-slate-500">
                      via {log.source}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No food logged yet today. Use the Food Scanner to capture your first meal!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Scheduled Workouts */}
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Training Schedule
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Plan v{plan?.version || 1}
              </span>
            </div>

            <div className="space-y-3">
              {plan?.workoutSchedule.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    item.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{item.day}: {item.title}</span>
                    {item.completed ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">{item.durationMinutes} min</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {item.focus}
                  </p>
                </div>
              ))}
            </div>

            {/* Injury Safety Advisory */}
            {profile?.healthConstraints && profile.healthConstraints.length > 0 && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/90 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Constraint Active: </strong>
                  {profile.healthConstraints.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
