import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Barcode,
  Tag,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { FoodItemData, GoalGapAnalysis, NutriGrade } from '../types/index.js';
import { BodyPathwayVisualizer } from './BodyPathwayVisualizer.js';
import { ExposureTimelineVisualizer } from './ExposureTimelineVisualizer.js';

interface FoodResultViewProps {
  foodItem: FoodItemData;
  gapAnalysis: GoalGapAnalysis | null;
  onLogMeal: (item: FoodItemData, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => Promise<void>;
  onClose: () => void;
}

export const FoodResultView: React.FC<FoodResultViewProps> = ({
  foodItem,
  gapAnalysis,
  onLogMeal,
  onClose
}) => {
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [logging, setLogging] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);
  const [showMethodologyDetails, setShowMethodologyDetails] = useState(false);

  const getNutriColor = (grade: NutriGrade) => {
    switch (grade) {
      case 'A': return 'bg-emerald-600 text-white border-emerald-400';
      case 'B': return 'bg-lime-500 text-slate-950 border-lime-300';
      case 'C': return 'bg-yellow-400 text-slate-950 border-yellow-300';
      case 'D': return 'bg-orange-500 text-white border-orange-400';
      case 'E': return 'bg-rose-600 text-white border-rose-400';
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'VERIFIED':
        return { label: 'Verified Label OCR', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
      case 'HIGH':
        return { label: 'High Confidence Vision', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
      case 'ESTIMATED':
        return { label: 'Estimated Meal Portion', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'Unverified / Partial', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const confBadge = getConfidenceBadge(foodItem.confidence);

  const handleCommit = async () => {
    setLogging(true);
    try {
      await onLogMeal(foodItem, mealType);
      setLoggedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-16">
      {/* 1. FOOD PRODUCT HEADER */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${confBadge.bg}`}>
                {confBadge.label}
              </span>
              {foodItem.brand && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Brand: {foodItem.brand}
                </span>
              )}
              {foodItem.barcode && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                  <Barcode className="w-3 h-3" />
                  {foodItem.barcode}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {foodItem.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>Standard Serving: <strong>{foodItem.servingSizeG} {foodItem.servingUnit}</strong></span>
              <span>•</span>
              <span className="text-slate-500 truncate">{foodItem.provenance}</span>
            </p>
          </div>

          {/* Quick Macro Barometer */}
          <div className="grid grid-cols-4 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-center">
            <div className="px-2">
              <div className="text-[10px] uppercase font-mono text-slate-400">Calories</div>
              <div className="text-lg font-bold text-white">{foodItem.calories}</div>
              <div className="text-[10px] text-slate-400">kcal</div>
            </div>
            <div className="px-2 border-l border-slate-800">
              <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold">Protein</div>
              <div className="text-lg font-extrabold text-emerald-400">{foodItem.proteinG}g</div>
              <div className="text-[10px] text-slate-400">per serving</div>
            </div>
            <div className="px-2 border-l border-slate-800">
              <div className="text-[10px] uppercase font-mono text-cyan-400">Carbs</div>
              <div className="text-lg font-bold text-cyan-300">{foodItem.carbsG}g</div>
              <div className="text-[10px] text-slate-400">{foodItem.sugarsG}g sugar</div>
            </div>
            <div className="px-2 border-l border-slate-800">
              <div className="text-[10px] uppercase font-mono text-amber-400">Fat</div>
              <div className="text-lg font-bold text-amber-300">{foodItem.fatG}g</div>
              <div className="text-[10px] text-slate-400">{foodItem.saturatedFatG}g sat</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL NUTRI-SCORE 2023 BREAKDOWN (Calculation Truth) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Official Nutri-Score (v2023 Solid Foods Standard)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Deterministic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Santé Publique France updated algorithm calculating negative vs positive dietary components per 100g.
            </p>
          </div>

          {/* Large Nutri-Score Meter A-E */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {(['A', 'B', 'C', 'D', 'E'] as NutriGrade[]).map((grade) => {
              const isCurrent = foodItem.nutriScore.grade === grade;
              return (
                <div
                  key={grade}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                    isCurrent
                      ? `${getNutriColor(grade)} shadow-lg scale-110 ring-2 ring-white/40`
                      : 'bg-slate-800/40 text-slate-600 opacity-40'
                  }`}
                >
                  {grade}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Points Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Negative Points (N) */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-rose-400 text-xs font-bold uppercase tracking-wider">
              <span>Negative Factors (Energy, Sugar, Sat Fat, Sodium)</span>
              <span>Total N: +{foodItem.nutriScore.negativePoints.totalNegative} pts</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                <span>Energy ({foodItem.nutriScore.negativePoints.energyKj} kJ / 100g):</span>
                <span className="font-mono font-semibold text-rose-400">+{foodItem.nutriScore.negativePoints.energyPoints} pts</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                <span>Sugars ({foodItem.nutriScore.negativePoints.sugarsG}g / 100g):</span>
                <span className="font-mono font-semibold text-rose-400">+{foodItem.nutriScore.negativePoints.sugarsPoints} pts</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                <span>Saturated Fatty Acids ({foodItem.nutriScore.negativePoints.saturatedFatG}g / 100g):</span>
                <span className="font-mono font-semibold text-rose-400">+{foodItem.nutriScore.negativePoints.saturatedFatPoints} pts</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1">
                <span>Sodium ({foodItem.nutriScore.negativePoints.sodiumMg}mg / 100g):</span>
                <span className="font-mono font-semibold text-rose-400">+{foodItem.nutriScore.negativePoints.sodiumPoints} pts</span>
              </div>
            </div>
          </div>

          {/* Positive Points (P) */}
          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>Positive Factors (Fruit/Veg, Fiber, Protein)</span>
              <span>Total P: -{foodItem.nutriScore.positivePoints.totalPositive} pts</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                <span>Fruits, Veg, Legumes ({foodItem.nutriScore.positivePoints.fruitVegPercent}%):</span>
                <span className="font-mono font-semibold text-emerald-400">-{foodItem.nutriScore.positivePoints.fruitVegPoints} pts</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1 border-b border-slate-800/60">
                <span>Dietary Fiber ({foodItem.nutriScore.positivePoints.fiberG}g / 100g):</span>
                <span className="font-mono font-semibold text-emerald-400">-{foodItem.nutriScore.positivePoints.fiberPoints} pts</span>
              </div>
              <div className="flex justify-between text-slate-300 py-1">
                <span className="flex items-center gap-1.5">
                  Protein ({foodItem.nutriScore.positivePoints.proteinG}g / 100g):
                  {foodItem.nutriScore.proteinExcluded && (
                    <span className="text-[10px] text-amber-400 font-bold">(Excluded: Anti-Masking Rule)</span>
                  )}
                </span>
                <span className="font-mono font-semibold text-emerald-400">-{foodItem.nutriScore.positivePoints.proteinPoints} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Final Deterministic Score Calculation */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-slate-400">
              Calculation formula: <strong>Net Score = N ({foodItem.nutriScore.negativePoints.totalNegative}) - P ({foodItem.nutriScore.positivePoints.totalPositive}) = {foodItem.nutriScore.score}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
              Grade {foodItem.nutriScore.grade}
            </span>
          </div>

          <button
            onClick={() => setShowMethodologyDetails(!showMethodologyDetails)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs font-medium"
          >
            <span>Algorithm Limitations</span>
            {showMethodologyDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showMethodologyDetails && (
          <div className="mt-3 p-4 bg-slate-950/90 rounded-2xl border border-slate-800/80 space-y-2 text-xs text-slate-400 animate-in fade-in duration-200">
            {foodItem.nutriScore.limitations.map((lim, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                <span>{lim}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. INGREDIENT INTELLIGENCE & ADDITIVE REGULATORY KNOWLEDGE */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Ingredient Intelligence & Additive Registry
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Preserved label wording normalized to canonical identities. No irrational chemophobia.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {foodItem.ingredients.length} items parsed
          </span>
        </div>

        {/* Ingredients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {foodItem.ingredients.map((ing, i) => (
            <div
              key={i}
              className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-slate-100 text-sm">
                    {ing.canonicalName}
                  </span>
                  {ing.eNumber ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      {ing.eNumber}
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      Whole Food / Core
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 mb-2">
                  <span className="text-slate-400">Category: </span>
                  <span className="text-slate-300 font-medium">{ing.functionCategory}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {ing.physiologicalRole}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col gap-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-emerald-400 font-medium">{ing.regulatoryStatus}</span>
                  <span className="text-slate-400">Evidence: <strong>{ing.evidenceLevel}</strong></span>
                </div>
                <p className="text-slate-400 italic text-[10px] line-clamp-1">
                  Safety: {ing.safetyConsideration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FOOD -> BODY PHYSIOLOGICAL VISUALIZATION */}
      <BodyPathwayVisualizer pathways={foodItem.bodyPathways} foodName={foodItem.name} />

      {/* 5. TIME & EXPOSURE TIMELINE */}
      <ExposureTimelineVisualizer scenarios={foodItem.exposureScenarios} />

      {/* 6. PERSONAL GOAL COMPARISON & GAP ENGINE */}
      {gapAnalysis && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-lg font-bold text-white">
                  Personal Goal Alignment & Gap Detection
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Comparing this food event directly against your active <strong>{gapAnalysis.goal.replace('_', ' ')}</strong> targets.
              </p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
              gapAnalysis.severity === 'on_track'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : gapAnalysis.severity === 'moderate_gap'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {gapAnalysis.severity.replace('_', ' ')}
            </span>
          </div>

          {/* Arithmetic Comparison Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Target Daily Protein</span>
              <div className="text-2xl font-black text-white">{gapAnalysis.targetProtein}g</div>
              <div className="text-[11px] text-slate-400 mt-1">Calculated for 78kg at 2.0g/kg</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Consumed + Scanned Food</span>
              <div className="text-2xl font-black text-emerald-400">
                {gapAnalysis.currentProtein}g + {gapAnalysis.foodProtein}g = {gapAnalysis.newProteinTotal}g
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Progress towards target</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Remaining Gap Today</span>
              <div className="text-2xl font-black text-amber-400">
                {gapAnalysis.remainingProtein}g
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {gapAnalysis.remainingCalories} kcal left in budget
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
            <strong>Agent Summary: </strong>
            {gapAnalysis.summary}
          </div>

          {/* 7. WHAT TO DO NEXT / RECOMMENDATIONS */}
          <div className="mt-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Next Useful Action: Food-First Gap Closers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gapAnalysis.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-200">{rec.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                        {rec.macroBenefit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {rec.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 flex items-center gap-1">
                    <Info className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{rec.evidenceNote}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. PRIMARY COMMIT ACTION: LOG FOOD & TRIGGER N8N WORKFLOWS */}
      <div className="sticky bottom-4 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-semibold">Log as:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  mealType === type
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleCommit}
            disabled={logging || loggedSuccess}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {loggedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Logged & n8n Workflow Triggered!</span>
              </>
            ) : logging ? (
              <span>Saving & Triggering Workflows...</span>
            ) : (
              <>
                <PlusCircle className="w-4 h-4 text-slate-950" />
                <span>Log to My Day & Trigger Adaptive Workflows</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
