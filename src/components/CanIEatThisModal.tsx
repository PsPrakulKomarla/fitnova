import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Flame,
  Dumbbell,
  Heart,
  Plus,
  HelpCircle
} from 'lucide-react';
import { FoodItemData, UserProfile } from '../types/index.js';
import { GoalFitAssessment } from '../../server/modules/intelligence/unified.orchestrator.js';

interface CanIEatThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onLogMeal: (item: FoodItemData, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
  onOpenFixMeal?: (item: FoodItemData) => void;
}

export const CanIEatThisModal: React.FC<CanIEatThisModalProps> = ({
  isOpen,
  onClose,
  profile,
  onLogMeal,
  onOpenFixMeal
}) => {
  const [selectedFoodName, setSelectedFoodName] = useState('Core Power Elite 42g');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<GoalFitAssessment | null>(null);
  const [activeItem, setActiveItem] = useState<FoodItemData | null>(null);

  const sampleFoods = [
    { name: 'Core Power Elite 42g', hint: 'shake' },
    { name: 'ICMR Moong Dal Khichdi Bowl', hint: 'dal' },
    { name: 'Wild Pacific Salmon Teriyaki', hint: 'salmon' },
    { name: 'Crunchy Peanut Granola Bar', hint: 'peanut' },
    { name: 'Ultra-Processed Chocolate Wafer', hint: 'wafer' }
  ];

  const handleEvaluate = async (name: string, hint: string) => {
    setSelectedFoodName(name);
    setLoading(true);
    try {
      const res = await fetch('/api/v1/intelligence/goal-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id || 'user-alex-1',
          textHint: hint
        })
      });
      if (res.ok) {
        const data: GoalFitAssessment = await res.json();
        setAssessment(data);

        // Fetch food item data for logging
        const foodRes = await fetch('/api/food/presets');
        if (foodRes.ok) {
          const presets: FoodItemData[] = await foodRes.json();
          const match = presets.find(p => p.id === data.foodId) || presets[0];
          setActiveItem(match);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !assessment) {
      handleEvaluate(sampleFoods[0].name, sampleFoods[0].hint);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Decision Engine
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
              "Can I Eat This?"
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates if this food fits your personal goals, daily calorie budget, and health boundaries.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Sample Selector */}
        <div className="pt-4 pb-2 shrink-0">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-bold">
            Select food to evaluate:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleFoods.map((f) => (
              <button
                key={f.name}
                onClick={() => handleEvaluate(f.name, f.hint)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  selectedFoodName === f.name
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {/* Assessment Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading && (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-mono">Running Personal Goal Fit Assessment...</p>
            </div>
          )}

          {!loading && assessment && (
            <div className="space-y-4">
              {/* Verdict Card */}
              <div className={`p-5 rounded-2xl border ${
                assessment.goalFitRating === 'EXCELLENT_FIT'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : assessment.goalFitRating === 'DISCORDANT_FIT'
                  ? 'bg-red-950/30 border-red-500/40 text-red-200'
                  : assessment.goalFitRating === 'CONDITIONAL_FIT'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                    assessment.goalFitRating === 'EXCELLENT_FIT' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
                    assessment.goalFitRating === 'DISCORDANT_FIT' ? 'bg-red-500/20 border-red-500/40 text-red-300' :
                    'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  }`}>
                    {assessment.goalFitRating.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>Nutri-Score:</span>
                    <span className="font-extrabold text-white px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                      Grade {assessment.nutriScoreGrade}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-white">{assessment.goalFitHeadline}</h3>
                <p className="text-xs mt-1 text-slate-300 leading-relaxed">
                  {assessment.suggestedAction.recommendationText}
                </p>

                {assessment.suggestedAction.suggestedAdditions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400">Recommended additions:</span>
                    {assessment.suggestedAction.suggestedAdditions.map((add, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-900 text-slate-200 px-2 py-0.5 rounded border border-slate-800">
                        +{add}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Contextual Checks */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                  Contextual Evaluation Breakdown:
                </span>
                {assessment.checks.map((check, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : check.caution ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-200">{check.label}: </span>
                      <span className="text-slate-400">{check.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {activeItem && onOpenFixMeal && (
            <button
              onClick={() => {
                onClose();
                onOpenFixMeal(activeItem);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Open in "Fix My Meal"</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
            >
              Close
            </button>

            {activeItem && assessment?.suggestedAction.canInclude && (
              <button
                onClick={() => {
                  onLogMeal(activeItem, 'snack');
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Log This Meal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
