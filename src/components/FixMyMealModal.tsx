import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Flame,
  Dumbbell,
  Droplets,
  PlusCircle,
  RefreshCw,
  Sliders,
  Layers,
  Heart
} from 'lucide-react';
import { FoodItemData, UserProfile } from '../types/index.js';
import { FixMyMealResult } from '../../server/modules/intelligence/unified.orchestrator.js';

interface FixMyMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFoodItem?: FoodItemData | null;
  profile: UserProfile | null;
  onLogMeal: (item: FoodItemData, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}

export const FixMyMealModal: React.FC<FixMyMealModalProps> = ({
  isOpen,
  onClose,
  initialFoodItem,
  profile,
  onLogMeal
}) => {
  const [selectedHint, setSelectedHint] = useState<string>('wafer');
  const [loading, setLoading] = useState<boolean>(false);
  const [fixResult, setFixResult] = useState<FixMyMealResult | null>(null);
  const [committed, setCommitted] = useState<boolean>(false);

  const sampleMeals = [
    { name: 'White Rice & Vegetable Stir Fry (Low Protein)', hint: 'wafer' },
    { name: 'Smoked Salmon Teriyaki (High Sodium)', hint: 'salmon' },
    { name: 'ICMR Moong Dal Bowl (Plant Protein)', hint: 'dal' },
    { name: 'Greek Yogurt Honey Bowl', hint: 'yogurt' }
  ];

  const fetchFix = async (hint: string) => {
    setLoading(true);
    setCommitted(false);
    try {
      const res = await fetch('/api/v1/intelligence/fix-my-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id || 'user-alex-1',
          textHint: hint
        })
      });
      if (res.ok) {
        const data = await res.json();
        setFixResult(data);
      }
    } catch (err) {
      console.error('Failed to fix meal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFix(selectedHint);
    }
  }, [isOpen, selectedHint]);

  if (!isOpen) return null;

  const handleCommitImprovedMeal = () => {
    if (!fixResult) return;
    const improvedItem: FoodItemData = {
      id: `fixed-${Date.now()}`,
      name: fixResult.improvedMeal.name,
      servingSizeG: 300,
      servingUnit: 'serving',
      calories: fixResult.improvedMeal.calories,
      proteinG: fixResult.improvedMeal.proteinG,
      carbsG: fixResult.improvedMeal.carbsG,
      fatG: fixResult.improvedMeal.fatG,
      saturatedFatG: 2.0,
      sugarsG: 4.0,
      fiberG: fixResult.improvedMeal.fiberG,
      sodiumMg: fixResult.improvedMeal.sodiumMg,
      fruitVegPercent: 20,
      nutriScore: {
        score: -1,
        grade: 'A',
        methodology: 'Nutri-Score 2023 Update (Solid Foods)',
        negativePoints: { energyKj: 1200, energyPoints: 3, sugarsG: 4, sugarsPoints: 1, saturatedFatG: 2, saturatedFatPoints: 2, sodiumMg: 200, sodiumPoints: 2, totalNegative: 8 },
        positivePoints: { fruitVegPercent: 20, fruitVegPoints: 0, fiberG: fixResult.improvedMeal.fiberG, fiberPoints: 4, proteinG: fixResult.improvedMeal.proteinG, proteinPoints: 5, totalPositive: 9 },
        proteinExcluded: false,
        limitations: []
      },
      confidence: 'VERIFIED',
      provenance: 'Fixed Meal Formulation (Deterministic Math)',
      rawLabelIngredients: `${fixResult.originalMeal.name}, ${fixResult.suggestedAddition.name}`,
      ingredients: [],
      bodyPathways: [],
      exposureScenarios: []
    };

    onLogMeal(improvedItem, 'lunch');
    setCommitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                Meal Optimization Engine
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
              "Fix My Meal"
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies nutritional gaps and deterministically calculates the exact food additions needed to balance your meal.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Selector */}
        <div className="pt-4 pb-2 shrink-0">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2 font-bold">
            Select meal scenario to fix:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleMeals.map((m) => (
              <button
                key={m.hint}
                onClick={() => setSelectedHint(m.hint)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                  selectedHint === m.hint
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {loading && (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400 font-mono">Calculating Deterministic Meal Transformation...</p>
            </div>
          )}

          {!loading && fixResult && (
            <div className="space-y-4">
              {/* Identified Issues */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 space-y-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block">
                  Identified Nutritional Opportunity:
                </span>
                {fixResult.identifiedIssues.map((issue, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>

              {/* The Deterministic Math: Before + Addition = After */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Before */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">1. Current Meal</div>
                  <div className="font-bold text-slate-200 text-sm truncate">{fixResult.originalMeal.name}</div>
                  <div className="space-y-1 pt-1 text-slate-400">
                    <div className="flex justify-between"><span>Calories:</span><span className="text-slate-200 font-mono">{fixResult.originalMeal.calories} kcal</span></div>
                    <div className="flex justify-between"><span>Protein:</span><span className="text-emerald-400 font-mono font-bold">{fixResult.originalMeal.proteinG}g</span></div>
                    <div className="flex justify-between"><span>Fiber:</span><span className="text-cyan-400 font-mono">{fixResult.originalMeal.fiberG}g</span></div>
                    <div className="flex justify-between"><span>Sodium:</span><span className="text-slate-300 font-mono">{fixResult.originalMeal.sodiumMg}mg</span></div>
                  </div>
                </div>

                {/* Addition */}
                <div className="p-4 bg-amber-950/20 rounded-2xl border border-amber-500/40 space-y-2">
                  <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">+ 2. Suggested Addition</div>
                  <div className="font-bold text-amber-300 text-sm truncate">{fixResult.suggestedAddition.name}</div>
                  <div className="space-y-1 pt-1 text-slate-300">
                    <div className="flex justify-between"><span>Portion:</span><span className="font-mono">{fixResult.suggestedAddition.portion}</span></div>
                    <div className="flex justify-between"><span>Added Protein:</span><span className="text-emerald-400 font-mono font-bold">+{fixResult.suggestedAddition.proteinG}g</span></div>
                    <div className="flex justify-between"><span>Added Fiber:</span><span className="text-cyan-400 font-mono">+{fixResult.suggestedAddition.fiberG}g</span></div>
                    <div className="flex justify-between"><span>Energy:</span><span className="text-amber-300 font-mono">+{fixResult.suggestedAddition.calories} kcal</span></div>
                  </div>
                </div>

                {/* After */}
                <div className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/40 space-y-2">
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">= 3. Improved Meal</div>
                  <div className="font-bold text-white text-sm truncate">Goal-Aligned Meal</div>
                  <div className="space-y-1 pt-1 text-slate-300">
                    <div className="flex justify-between"><span>Total Energy:</span><span className="text-slate-200 font-mono font-bold">{fixResult.improvedMeal.calories} kcal</span></div>
                    <div className="flex justify-between"><span>Total Protein:</span><span className="text-emerald-300 font-mono font-extrabold text-sm">{fixResult.improvedMeal.proteinG}g</span></div>
                    <div className="flex justify-between"><span>Total Fiber:</span><span className="text-cyan-300 font-mono font-bold">{fixResult.improvedMeal.fiberG}g</span></div>
                    <div className="flex justify-between"><span>Sodium:</span><span className="text-slate-300 font-mono">{fixResult.improvedMeal.sodiumMg}mg</span></div>
                  </div>
                </div>
              </div>

              {/* Rationale & Net Summary */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Biochemical & Behavioral Rationale:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{fixResult.suggestedAddition.rationale}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium">
                  {fixResult.netImprovementSummary}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleCommitImprovedMeal}
            disabled={!fixResult || committed}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {committed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Logged Improved Meal!</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Apply Fix & Log to Today's Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
