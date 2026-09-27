import React from 'react';
import { Target, Activity, ShieldCheck, Cpu, Bell, CheckCircle2, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { UserProfile, Plan, DailyProgressData } from '../types/index.js';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  profile: UserProfile | null;
  plan: Plan | null;
  dailyProgress: DailyProgressData | null;
  pendingAdaptationsCount: number;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  profile,
  plan,
  dailyProgress,
  pendingAdaptationsCount,
  onOpenScanner
}) => {
  const proteinConsumed = dailyProgress?.consumedProtein || 0;
  const proteinTarget = plan?.dailyTargets.proteinG || 150;
  const proteinPercent = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100));

  const navItems = [
    { id: 'overview', label: 'Home', icon: Target },
    { id: 'personalization', label: 'Intelligence Loop', icon: Sparkles, highlight: true },
    { id: 'scan', label: 'Food Scanner', icon: Zap },
    { id: 'today', label: "Today's Plan", icon: Activity },
    { id: 'progress', label: 'Progress & Reality', icon: Activity },
    { id: 'intelligence', label: 'Food Intelligence', icon: ShieldCheck },
    { id: 'agent', label: 'Adaptive Agent', icon: Cpu, badge: pendingAdaptationsCount },
    { id: 'workflows', label: 'n8n & Brevo', icon: Bell },
    { id: 'profile', label: 'Profile & Safety', icon: ShieldCheck },
    { id: 'tests', label: 'Engine Tests', icon: CheckCircle2 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Thesis */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Activity className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  ADAPTIV
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Plan v{plan?.version || 1} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">
                Persistent Adaptive Nutrition & Fitness
              </p>
            </div>
          </div>

          {/* Quick Real-Time Status Ticker */}
          <div className="hidden md:flex items-center gap-6 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Goal:</span>
              <span className="font-medium text-emerald-400 capitalize">
                {profile?.goal.replace('_', ' ') || 'Muscle Gain'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Protein:</span>
              <span className="font-semibold text-slate-100">
                {proteinConsumed}g <span className="text-slate-500">/ {proteinTarget}g</span>
              </span>
              <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Calories:</span>
              <span className="font-semibold text-slate-200">
                {dailyProgress?.consumedCalories || 0} <span className="text-slate-500">/ {plan?.dailyTargets.calories || 2500} kcal</span>
              </span>
            </div>
          </div>

          {/* Action Button: Quick Food Scan */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02]"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Scan Food</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                    {item.badge} Action
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
