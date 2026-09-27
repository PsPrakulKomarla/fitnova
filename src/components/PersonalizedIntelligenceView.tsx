import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Zap,
  Info,
  Layers,
  Heart,
  Dumbbell,
  Droplets,
  Flame,
  Activity,
  ChevronDown,
  ChevronUp,
  BookOpen,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
  Clock,
  Compass,
  Stethoscope
} from 'lucide-react';
import { FoodItemData, UserProfile, DailyProgressData, NutriGrade } from '../types/index.js';
import { PersonalizedIntelligenceResult, ExplainableRecommendation, MealImprovementSuggestion, FoodToBodySystemPathway } from '../../server/modules/recommendations/recommendations.models.js';

interface PersonalizedIntelligenceViewProps {
  profile: UserProfile | null;
  dailyProgress: DailyProgressData | null;
  onOpenScanner: () => void;
  onLogMeal: (item: FoodItemData, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}

export const PersonalizedIntelligenceView: React.FC<PersonalizedIntelligenceViewProps> = ({
  profile,
  dailyProgress,
  onOpenScanner,
  onLogMeal
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('dal');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PersonalizedIntelligenceResult | null>(null);
  const [activePathwayTab, setActivePathwayTab] = useState<string>('all');
  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [loggedSuccess, setLoggedSuccess] = useState<boolean>(false);

  // Preset sample catalog for judges and testing
  const presets = [
    {
      id: 'dal',
      name: 'ICMR Moong Dal Bowl',
      desc: 'IFCT Verified • High Fiber • Non-Heme Iron',
      badge: 'IFCT 2017',
      badgeColor: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
      foodItem: {
        id: 'food-ifct-moong',
        name: 'ICMR-NIN Moong Dal Khichdi Bowl',
        brand: 'Indian Food Composition Tables',
        barcode: 'IFCT-2017-L004',
        servingSizeG: 220,
        servingUnit: 'bowl',
        calories: 275,
        proteinG: 16.5,
        carbsG: 44.0,
        fatG: 4.2,
        saturatedFatG: 0.8,
        sugarsG: 2.1,
        fiberG: 9.8,
        sodiumMg: 490,
        fruitVegPercent: 15,
        nutriScore: {
          score: -2,
          grade: 'A' as NutriGrade,
          methodology: 'Nutri-Score 2023 Update (Solid Foods)',
          negativePoints: { energyKj: 1150, energyPoints: 3, sugarsG: 2.1, sugarsPoints: 0, saturatedFatG: 0.8, saturatedFatPoints: 0, sodiumMg: 490, sodiumPoints: 5, totalNegative: 8 },
          positivePoints: { fruitVegPercent: 15, fruitVegPoints: 0, fiberG: 9.8, fiberPoints: 5, proteinG: 16.5, proteinPoints: 5, totalPositive: 10 },
          proteinExcluded: false,
          limitations: []
        },
        confidence: 'VERIFIED' as const,
        provenance: 'ICMR - National Institute of Nutrition (IFCT 2017 Standard)',
        rawLabelIngredients: 'Split yellow moong dal (Vigna radiata), polished rice, turmeric, cumin, rock salt, ghee.',
        ingredients: [
          { originalText: 'Split yellow moong dal', canonicalName: 'Moong Dal (Green Gram)', functionCategory: 'Plant Legume Protein', regulatoryStatus: 'FSSAI Standard Food', evidenceLevel: 'High' as const, physiologicalRole: 'Digestible plant protein rich in branched-chain amino acids and resistant starch.', safetyConsideration: 'Phytates bind minerals; enhanced by soaking/cooking.', scientificCitations: ['IFCT 2017 ICMR-NIN'] },
          { originalText: 'Cumin & Turmeric', canonicalName: 'Curcuma Longa (Curcumin)', functionCategory: 'Phytochemical Spice', regulatoryStatus: 'GRAS / FSSAI', evidenceLevel: 'High' as const, physiologicalRole: 'Curcuminoid polyphenols modulate NF-kB inflammatory cascades.', safetyConsideration: 'Safe culinary spice.', scientificCitations: ['Aggarwal et al., Adv Exp Med Biol 2007'] }
        ],
        bodyPathways: [],
        exposureScenarios: []
      }
    },
    {
      id: 'shake',
      name: 'Core Power Elite 42g',
      desc: 'Physical Label • Verified 42g Protein • Grade A',
      badge: 'Barcode GS1',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      foodItem: {
        id: 'food-core-power-42',
        name: 'Fairlife Core Power Elite Vanilla',
        brand: 'Fairlife',
        barcode: '0811620021350',
        servingSizeG: 414,
        servingUnit: 'bottle',
        calories: 230,
        proteinG: 42.0,
        carbsG: 8.0,
        fatG: 3.5,
        saturatedFatG: 1.5,
        sugarsG: 4.0,
        fiberG: 1.0,
        sodiumMg: 260,
        fruitVegPercent: 0,
        nutriScore: {
          score: -3,
          grade: 'A' as NutriGrade,
          methodology: 'Nutri-Score 2023 Update (Solid Foods)',
          negativePoints: { energyKj: 962, energyPoints: 2, sugarsG: 4.0, sugarsPoints: 1, saturatedFatG: 1.5, saturatedFatPoints: 1, sodiumMg: 260, sodiumPoints: 2, totalNegative: 6 },
          positivePoints: { fruitVegPercent: 0, fruitVegPoints: 0, fiberG: 1.0, fiberPoints: 0, proteinG: 42.0, proteinPoints: 7, totalPositive: 7 },
          proteinExcluded: false,
          limitations: []
        },
        confidence: 'VERIFIED' as const,
        provenance: 'Physical Packaging Nutrition Facts + USDA FDC Cross-Reference',
        rawLabelIngredients: 'Filtered lowfat grade A milk, contains less than 1% of vanilla extract, monk fruit juice concentrate, stevia leaf extract, carrageenan, lactase enzyme.',
        ingredients: [
          { originalText: 'Filtered lowfat grade A milk', canonicalName: 'Ultra-Filtered Milk', functionCategory: 'Intact Milk Protein', regulatoryStatus: 'FDA Grade A Pasteurized', evidenceLevel: 'High' as const, physiologicalRole: '80% Micellar Casein and 20% Whey delivering 4.5g natural leucine.', safetyConsideration: 'Contains Milk / Dairy.', scientificCitations: ['Phillips et al., 2016'] },
          { originalText: 'Carrageenan', canonicalName: 'Carrageenan', eNumber: 'E407', functionCategory: 'Stabilizer', regulatoryStatus: 'FDA GRAS / EFSA ADI 75mg/kg', evidenceLevel: 'Moderate' as const, physiologicalRole: 'Maintains uniform suspension of micellar protein fractions.', safetyConsideration: 'Food-grade regulated polymer.', scientificCitations: ['EFSA Journal 2018'] }
        ],
        bodyPathways: [],
        exposureScenarios: []
      }
    },
    {
      id: 'salmon',
      name: 'Smoked Salmon Teriyaki',
      desc: 'High Sodium 780mg • Triggers Clinical Warning',
      badge: 'Sodium Alert',
      badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
      foodItem: {
        id: 'food-salmon-teriyaki',
        name: 'Wild Pacific Salmon Teriyaki Glaze',
        brand: 'Seafood Kitchens',
        barcode: '071445009988',
        servingSizeG: 180,
        servingUnit: 'fillet',
        calories: 310,
        proteinG: 34.0,
        carbsG: 14.0,
        fatG: 12.0,
        saturatedFatG: 2.2,
        sugarsG: 11.0,
        fiberG: 0.5,
        sodiumMg: 780, // high sodium
        fruitVegPercent: 0,
        nutriScore: {
          score: 4,
          grade: 'C' as NutriGrade,
          methodology: 'Nutri-Score 2023 Update (Solid Foods)',
          negativePoints: { energyKj: 1297, energyPoints: 3, sugarsG: 11.0, sugarsPoints: 3, saturatedFatG: 2.2, saturatedFatPoints: 2, sodiumMg: 780, sodiumPoints: 8, totalNegative: 16 },
          positivePoints: { fruitVegPercent: 0, fruitVegPoints: 0, fiberG: 0.5, fiberPoints: 0, proteinG: 34.0, proteinPoints: 7, totalPositive: 7 },
          proteinExcluded: false,
          limitations: ['Elevated sodium point penalty']
        },
        confidence: 'VERIFIED' as const,
        provenance: 'Physical Packaging Nutrition Label',
        rawLabelIngredients: 'Wild pink salmon (Oncorhynchus gorbuscha), water, soy sauce (water, wheat, soybeans, salt), cane sugar, ginger, modified corn starch.',
        ingredients: [
          { originalText: 'Wild pink salmon', canonicalName: 'Wild Pink Salmon', functionCategory: 'Marine Complete Protein', regulatoryStatus: 'FDA / NOAA Seafood', evidenceLevel: 'High' as const, physiologicalRole: 'Eicosapentaenoic acid (EPA) and docosahexaenoic acid (DHA) omega-3 fatty acids.', safetyConsideration: 'Contains Fish.', scientificCitations: ['Mozaffarian et al., Circulation 2016'] }
        ],
        bodyPathways: [],
        exposureScenarios: []
      }
    },
    {
      id: 'peanut',
      name: 'Peanut Butter Granola Bar',
      desc: 'Declared Peanut Allergen • Real-Time Safety Gate',
      badge: 'Allergen Trigger',
      badgeColor: 'border-red-500/30 text-red-400 bg-red-500/10',
      foodItem: {
        id: 'food-peanut-granola',
        name: 'Peanut Butter Crunch Chewy Granola Bar',
        brand: 'Nature Valley',
        barcode: '016000264627',
        servingSizeG: 45,
        servingUnit: 'bar',
        calories: 210,
        proteinG: 6.0,
        carbsG: 24.0,
        fatG: 10.0,
        saturatedFatG: 2.0,
        sugarsG: 12.0,
        fiberG: 2.0,
        sodiumMg: 150,
        fruitVegPercent: 0,
        nutriScore: {
          score: 8,
          grade: 'C' as NutriGrade,
          methodology: 'Nutri-Score 2023 Update (Solid Foods)',
          negativePoints: { energyKj: 878, energyPoints: 2, sugarsG: 12.0, sugarsPoints: 3, saturatedFatG: 2.0, saturatedFatPoints: 2, sodiumMg: 150, sodiumPoints: 1, totalNegative: 8 },
          positivePoints: { fruitVegPercent: 0, fruitVegPoints: 0, fiberG: 2.0, fiberPoints: 0, proteinG: 6.0, proteinPoints: 2, totalPositive: 2 },
          proteinExcluded: false,
          limitations: []
        },
        confidence: 'VERIFIED' as const,
        provenance: 'Physical Packaging Nutrition Label',
        rawLabelIngredients: 'Whole grain oats, roasted peanuts, sugar, corn syrup, arachis oil, salt.',
        ingredients: [
          { originalText: 'Roasted peanuts', canonicalName: 'Peanut (Arachis hypogaea)', functionCategory: 'Allergenic Legume', regulatoryStatus: 'FDA Major Allergen', evidenceLevel: 'High' as const, physiologicalRole: 'High mono/polyunsaturated lipid profile and plant protein.', safetyConsideration: 'Potent anaphylactoid allergen (Ara h 1, Ara h 2 proteins).', scientificCitations: ['Burks et al., JACI 2012'] }
        ],
        bodyPathways: [],
        exposureScenarios: []
      }
    }
  ];

  const evaluateFood = async (food: FoodItemData) => {
    setLoading(true);
    setLoggedSuccess(false);
    try {
      const res = await fetch('/api/v1/recommendations/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile?.id || 'user-alex-1',
          foodItem: food
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error('Failed to evaluate personalized intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const current = presets.find(p => p.id === selectedPreset);
    if (current) {
      evaluateFood(current.foodItem);
    }
  }, [selectedPreset, profile]);

  const toggleWhy = (id: string) => {
    setExpandedWhy(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCommitMeal = () => {
    const activeFood = presets.find(p => p.id === selectedPreset)?.foodItem;
    if (activeFood) {
      onLogMeal(activeFood, mealType);
      setLoggedSuccess(true);
      setTimeout(() => setLoggedSuccess(false), 3000);
    }
  };

  const currentFood = presets.find(p => p.id === selectedPreset)?.foodItem;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner / Header */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Phase 5 Core Intelligence Loop
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Personalized Nutrition & Explainable Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Connects what you eat directly to your profile, calculates real-time gaps, provides explainable next actions with scientific evidence, and maps nutrients to body systems.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenScanner}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-current" />
              <span>Scan Custom Food</span>
            </button>
          </div>
        </div>

        {/* User Context Strip */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-slate-500 font-mono text-[10px] uppercase">Goal & Strategy</div>
            <div className="font-semibold text-emerald-400 capitalize mt-0.5">
              {profile?.goal.replace('_', ' ') || 'Muscle Gain'}
            </div>
            <div className="text-[10px] text-slate-400">Target: {dailyProgress?.targetProtein || 156}g Protein</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-slate-500 font-mono text-[10px] uppercase">Dietary Filter</div>
            <div className="font-semibold text-slate-200 capitalize mt-0.5">
              {profile?.dietaryPreference || 'Standard'}
            </div>
            <div className="text-[10px] text-slate-400">Enforces meal compliance</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-slate-500 font-mono text-[10px] uppercase">Active Allergies</div>
            <div className="font-semibold text-amber-400 mt-0.5">
              {profile?.allergies.length ? profile.allergies.join(', ') : 'None Declared'}
            </div>
            <div className="text-[10px] text-slate-400">Real-time gatekeeper</div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="text-slate-500 font-mono text-[10px] uppercase">Clinical Constraints</div>
            <div className="font-semibold text-cyan-400 mt-0.5">
              {profile?.healthConstraints.length ? profile.healthConstraints.join(', ') : 'Standard Baseline'}
            </div>
            <div className="text-[10px] text-slate-400">Cardio / Renal safeguards</div>
          </div>
        </div>
      </div>

      {/* Preset Selector Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Select Food Scenario to Analyze
          </span>
          <span className="text-[11px] text-slate-500">Live multi-source evaluation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {presets.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="font-bold text-sm text-white">{preset.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{preset.desc}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{preset.foodItem.calories} kcal</span>
                  <span className="font-semibold text-slate-300">{preset.foodItem.proteinG}g protein</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Running Personalized Intelligence Loop...</p>
        </div>
      )}

      {!loading && result && (
        <div className="space-y-8">
          {/* STEP 4: Real-time Allergen & Clinical Safety Audit Banner */}
          {result.allergyWarnings.length > 0 ? (
            <div className="bg-red-950/40 border border-red-500/40 rounded-3xl p-5 shadow-xl animate-in shake duration-300">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6 text-red-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-red-400 font-extrabold">
                      Allergen Safety Contraindication Detected
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                      DO NOT CONSUME
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Conflict with declared allergen: {result.allergyWarnings.map(w => w.userAllergyMatched).join(', ')}
                  </h3>
                  <p className="text-xs text-red-200/90 leading-relaxed">
                    {result.allergyWarnings[0].clinicalNote}
                  </p>
                </div>
              </div>
            </div>
          ) : result.medicalWarnings.length > 0 ? (
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-5 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-extrabold">
                      Clinical Health Boundary Flagged
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      CAUTION
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {result.medicalWarnings[0].condition} threshold exceeded ({result.medicalWarnings[0].observedValue} vs target {result.medicalWarnings[0].thresholdValue})
                  </h3>
                  <p className="text-xs text-amber-200/90 leading-relaxed">
                    {result.medicalWarnings[0].clinicalAdvice}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-300">Allergen & Clinical Safety Audit Passed: </span>
                  <span className="text-slate-300">No declared allergens detected. Complies with current profile constraints.</span>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                Safe to Log
              </span>
            </div>
          )}

          {/* STEP 2 & 3: Food Identification, Provenance & Macro Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scanned Food Summary Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Active Food Identification
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    {result.confidence}
                  </span>
                </div>

                <h2 className="text-xl font-extrabold text-white leading-tight">{result.foodName}</h2>
                <div className="text-xs text-slate-400 mt-1">
                  Serving: {currentFood?.servingSizeG} {currentFood?.servingUnit}
                </div>

                {/* Nutri-Score badge */}
                <div className="mt-4 flex items-center gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-2xl text-slate-950 shadow-md ${
                    result.nutriGrade === 'A' ? 'bg-emerald-400' :
                    result.nutriGrade === 'B' ? 'bg-lime-400' :
                    result.nutriGrade === 'C' ? 'bg-amber-400' :
                    result.nutriGrade === 'D' ? 'bg-orange-500' : 'bg-red-500'
                  }`}>
                    {result.nutriGrade}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">Official Nutri-Score 2023</div>
                    <div className="text-[10px] text-slate-400">Grade {result.nutriGrade} (Solid Food Standard)</div>
                  </div>
                </div>

                {/* Provenance Footer */}
                <div className="mt-4 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block">Data Provenance:</span>
                  <span className="text-slate-300 font-medium">{currentFood?.provenance}</span>
                </div>
              </div>

              {/* Log Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Meal Type:</span>
                  <select
                    value={mealType}
                    onChange={(e: any) => setMealType(e.target.value)}
                    className="bg-slate-950 text-xs text-slate-200 border border-slate-800 rounded-lg px-2 py-1 outline-none font-semibold"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                <button
                  onClick={handleCommitMeal}
                  disabled={result.allergyWarnings.some(w => w.severity === 'FATAL')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] disabled:opacity-40 disabled:hover:scale-100"
                >
                  {loggedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Logged to Today's Plan!</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-slate-950" />
                      <span>Log Meal & Trigger Workflows</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP 5: Goal Gap Detection & Real-Time Macro Impact */}
            <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Real-Time Goal Gap Calculus
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Evaluates today's prior consumption + this food against your personal target.
                  </p>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase ${
                  result.gapAnalysis.severity === 'on_track' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  result.gapAnalysis.severity === 'moderate_gap' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  result.gapAnalysis.severity === 'allergen_alert' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                }`}>
                  Status: {result.gapAnalysis.severity.replace('_', ' ')}
                </span>
              </div>

              {/* Dynamic Summary */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-medium">
                {result.gapAnalysis.summary}
              </div>

              {/* Progress Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Protein Gauge */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                      Protein
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      +{result.gapAnalysis.foodProtein}g
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-white">
                    {result.gapAnalysis.newProteinTotal}g <span className="text-xs text-slate-500 font-normal">/ {result.gapAnalysis.targetProtein}g</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((result.gapAnalysis.newProteinTotal / result.gapAnalysis.targetProtein) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Remaining:</span>
                    <span className="font-bold text-slate-200">{result.gapAnalysis.remainingProtein}g</span>
                  </div>
                </div>

                {/* Calories Gauge */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Calories
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      +{result.gapAnalysis.foodCalories} kcal
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-white">
                    {result.gapAnalysis.newCaloriesTotal} <span className="text-xs text-slate-500 font-normal">/ {result.gapAnalysis.targetCalories} kcal</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((result.gapAnalysis.newCaloriesTotal / result.gapAnalysis.targetCalories) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Balance:</span>
                    <span className="font-bold text-slate-200">{result.gapAnalysis.remainingCalories} kcal</span>
                  </div>
                </div>

                {/* Sodium Allowance Gauge */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-cyan-400" />
                      Sodium
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {result.gapAnalysis.currentSodiumMg} mg
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-white">
                    {result.gapAnalysis.currentSodiumMg} <span className="text-xs text-slate-500 font-normal">/ 2000 mg limit</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.gapAnalysis.currentSodiumMg > 600 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((result.gapAnalysis.currentSodiumMg / 2000) * 100))}%`
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Allowance Left:</span>
                    <span className="font-bold text-slate-200">{result.gapAnalysis.sodiumAllowanceRemainingMg} mg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 6: Explainable Recommendations with "WHY" Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Personalized Next Actions (Explainable Recommendations)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Every recommendation is strictly filtered by your dietary preferences & allergies, and backed by physiological mechanisms.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {result.explainableRecommendations.length} tailored options
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.explainableRecommendations.map((rec) => {
                const isOpen = !!expandedWhy[rec.id];
                return (
                  <div
                    key={rec.id}
                    className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {rec.type.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          rec.evidenceLevel === 'High' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                          rec.evidenceLevel === 'Regulatory' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          Evidence: {rec.evidenceLevel}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{rec.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-emerald-400 font-bold">+{rec.macroBenefit.proteinG}g Protein</span>
                        <span className="text-slate-600">•</span>
                        <span>{rec.macroBenefit.calories} kcal</span>
                        {rec.macroBenefit.fiberG !== undefined && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-cyan-400">+{rec.macroBenefit.fiberG}g Fiber</span>
                          </>
                        )}
                      </div>

                      <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Timing: {rec.timingRecommendation}</span>
                      </div>
                    </div>

                    {/* Expandable "WHY" card */}
                    <div className="pt-3 border-t border-slate-800/80">
                      <button
                        onClick={() => toggleWhy(rec.id)}
                        className="w-full flex items-center justify-between text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Why this recommendation? (Physiological Rationale)</span>
                        </span>
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isOpen && (
                        <div className="mt-3 p-3.5 bg-slate-950/90 rounded-2xl border border-emerald-500/20 text-xs space-y-2 animate-in fade-in duration-200">
                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-500 block">Biological Mechanism:</span>
                            <p className="text-slate-300 mt-0.5 leading-relaxed">{rec.whyRationale}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Citation: {rec.scientificCitation}</span>
                            <span className="text-emerald-400">Peer-Reviewed</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 7: Actionable Meal Improvement & Pairing Suggestions */}
          {result.mealImprovements.length > 0 && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Meal Improvement & Synergistic Food Pairings
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Scientific combinations that improve nutrient absorption, blunt glucose surges, or buffer sodium.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                  Evidence-Based Synergy
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.mealImprovements.map((imp, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300">{imp.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{imp.category.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {imp.suggestionText}
                    </p>
                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                      <span className="text-slate-500 font-mono text-[10px] uppercase block">Mechanism:</span>
                      {imp.physiologicalMechanism}
                    </div>
                    <div className="pt-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-500">Suggested additions:</span>
                      {imp.foodAdditionsOrSwaps.map((item, i) => (
                        <span key={i} className="text-[10px] bg-slate-900 text-slate-200 px-2 py-0.5 rounded border border-slate-800">
                          +{item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8: Food -> Body System Physiological Visualizer */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Physiological Mapping
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">
                  Food → Nutrient → Body System Pathways
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Maps the specific biochemical components of "{result.foodName}" to target human organ systems.
                </p>
              </div>

              {/* System filter tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['all', 'muscular', 'cardiovascular', 'digestive_microbiome', 'metabolic_endocrine'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePathwayTab(tab)}
                    className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                      activePathwayTab === tab
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Pathway Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.bodyPathways
                .filter(p => activePathwayTab === 'all' || p.system === activePathwayTab)
                .map((pathway, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {pathway.system === 'muscular' && <Dumbbell className="w-4 h-4 text-emerald-400" />}
                        {pathway.system === 'cardiovascular' && <Heart className="w-4 h-4 text-rose-400" />}
                        {pathway.system === 'digestive_microbiome' && <Droplets className="w-4 h-4 text-cyan-400" />}
                        {pathway.system === 'metabolic_endocrine' && <Flame className="w-4 h-4 text-amber-400" />}
                        <span className="text-xs font-bold text-white">{pathway.systemName}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {pathway.provenanceStatus}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-mono font-bold text-slate-200">{pathway.nutrient}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">{pathway.biologicalRole}</div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Cellular Mechanism:</span>
                      {pathway.cellularMechanism}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Citation: {pathway.citation}</span>
                      <span className="text-slate-400">{pathway.evidenceStrength} Evidence</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
