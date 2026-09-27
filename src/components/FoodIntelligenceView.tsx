import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sliders,
  CheckCircle2,
  Info,
  ShieldCheck,
  Zap,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { NutriGrade } from '../types/index.js';

export const FoodIntelligenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'ingredients'>('calculator');
  const [searchQuery, setSearchQuery] = useState('');

  // Sandbox inputs for interactive Nutri-Score 2023 solid foods algorithm
  const [calories, setCalories] = useState(150);
  const [sugars, setSugars] = useState(6);
  const [satFat, setSatFat] = useState(1.2);
  const [sodium, setSodium] = useState(120);
  const [fiber, setFiber] = useState(3.5);
  const [protein, setProtein] = useState(12.0);
  const [fruitVeg, setFruitVeg] = useState(20);

  // Deterministic 2023 calculation
  const energyKj = Math.round(calories * 4.184);

  // Energy points (0-10)
  let energyPts = 0;
  if (energyKj > 3350) energyPts = 10;
  else if (energyKj > 3015) energyPts = 9;
  else if (energyKj > 2680) energyPts = 8;
  else if (energyKj > 2345) energyPts = 7;
  else if (energyKj > 2010) energyPts = 6;
  else if (energyKj > 1675) energyPts = 5;
  else if (energyKj > 1340) energyPts = 4;
  else if (energyKj > 1005) energyPts = 3;
  else if (energyKj > 670) energyPts = 2;
  else if (energyKj > 335) energyPts = 1;

  // Sugars points (0-15)
  let sugarsPts = 0;
  if (sugars > 51) sugarsPts = 15;
  else if (sugars > 48) sugarsPts = 14;
  else if (sugars > 44) sugarsPts = 13;
  else if (sugars > 41) sugarsPts = 12;
  else if (sugars > 37) sugarsPts = 11;
  else if (sugars > 34) sugarsPts = 10;
  else if (sugars > 31) sugarsPts = 9;
  else if (sugars > 27) sugarsPts = 8;
  else if (sugars > 24) sugarsPts = 7;
  else if (sugars > 20) sugarsPts = 6;
  else if (sugars > 17) sugarsPts = 5;
  else if (sugars > 14) sugarsPts = 4;
  else if (sugars > 10) sugarsPts = 3;
  else if (sugars > 6.8) sugarsPts = 2;
  else if (sugars > 3.4) sugarsPts = 1;

  // Sat Fat points (0-10)
  let satFatPts = 0;
  if (satFat > 10) satFatPts = 10;
  else if (satFat > 9) satFatPts = 9;
  else if (satFat > 8) satFatPts = 8;
  else if (satFat > 7) satFatPts = 7;
  else if (satFat > 6) satFatPts = 6;
  else if (satFat > 5) satFatPts = 5;
  else if (satFat > 4) satFatPts = 4;
  else if (satFat > 3) satFatPts = 3;
  else if (satFat > 2) satFatPts = 2;
  else if (satFat > 1) satFatPts = 1;

  // Sodium points (0-20)
  let sodiumPts = 0;
  if (sodium > 900) sodiumPts = 10;
  else if (sodium > 810) sodiumPts = 9;
  else if (sodium > 720) sodiumPts = 8;
  else if (sodium > 630) sodiumPts = 7;
  else if (sodium > 540) sodiumPts = 6;
  else if (sodium > 450) sodiumPts = 5;
  else if (sodium > 360) sodiumPts = 4;
  else if (sodium > 270) sodiumPts = 3;
  else if (sodium > 180) sodiumPts = 2;
  else if (sodium > 90) sodiumPts = 1;

  const totalN = energyPts + sugarsPts + satFatPts + sodiumPts;

  // Positive points
  let fvPts = 0;
  if (fruitVeg > 80) fvPts = 5;
  else if (fruitVeg > 60) fvPts = 2;
  else if (fruitVeg > 40) fvPts = 1;

  let fibPts = 0;
  if (fiber > 7.4) fibPts = 5;
  else if (fiber > 6.3) fibPts = 4;
  else if (fiber > 5.2) fibPts = 3;
  else if (fiber > 4.1) fibPts = 2;
  else if (fiber > 3.0) fibPts = 1;

  let rawProtPts = 0;
  if (protein > 16.8) rawProtPts = 7;
  else if (protein > 14.4) rawProtPts = 6;
  else if (protein > 12.0) rawProtPts = 5;
  else if (protein > 9.6) rawProtPts = 4;
  else if (protein > 7.2) rawProtPts = 3;
  else if (protein > 4.8) rawProtPts = 2;
  else if (protein > 2.4) rawProtPts = 1;

  const proteinExcluded = totalN >= 11 && fvPts < 5;
  const effectiveProtPts = proteinExcluded ? 0 : rawProtPts;

  const totalP = fvPts + fibPts + effectiveProtPts;
  const netScore = totalN - totalP;

  let grade: NutriGrade = 'A';
  if (netScore <= -1) grade = 'A';
  else if (netScore <= 2) grade = 'B';
  else if (netScore <= 10) grade = 'C';
  else if (netScore <= 18) grade = 'D';
  else grade = 'E';

  const ingredientCatalog = [
    {
      name: 'Whey Protein Isolate',
      eNumber: null,
      category: 'Macronutrient / Functional Protein',
      regulatory: 'FDA GRAS / EFSA Approved',
      role: 'Rapid leucine spike stimulating mTOR complex 1 and muscle protein synthesis.',
      evidence: 'High',
      citation: 'Morton et al., Br J Sports Med 2018'
    },
    {
      name: 'Carrageenan',
      eNumber: 'E407',
      category: 'Gelling Agent / Stabilizer',
      regulatory: 'FDA GRAS / EFSA ADI 75 mg/kg bw',
      role: 'Derived from red seaweed; provides suspension without caloric absorption. Food-grade molecular weight regulated.',
      evidence: 'Moderate',
      citation: 'EFSA Journal 2018 (ANS Panel)'
    },
    {
      name: 'Sucralose',
      eNumber: 'E955',
      category: 'High-Intensity Non-Nutritive Sweetener',
      regulatory: 'FDA Approved / EFSA ADI 15 mg/kg bw',
      role: 'Chlorinated sucrose derivative ~600x sweeter than sugar; zero glycemic impact.',
      evidence: 'High',
      citation: 'Magnuson et al., Food Chem Toxicol 2017'
    },
    {
      name: 'Sunflower Lecithin',
      eNumber: 'E322',
      category: 'Natural Emulsifier / Phospholipid',
      regulatory: 'FDA GRAS / EFSA Quantum Satis',
      role: 'Source of phosphatidylcholine supporting cell membranes and fat dispersion.',
      evidence: 'High',
      citation: 'EFSA Journal 2020: Re-evaluation of lecithins'
    },
    {
      name: 'Monosodium Glutamate',
      eNumber: 'E621',
      category: 'Umami Flavor Enhancer',
      regulatory: 'FDA GRAS / EFSA ADI 30 mg/kg bw',
      role: 'Sodium salt of glutamic acid stimulating T1R1/T1R3 umami receptors; enables up to 40% reduction in table salt.',
      evidence: 'High',
      citation: 'Geha et al., J Allergy Clin Immunol 2000 (RCT)'
    },
    {
      name: 'Creatine Monohydrate',
      eNumber: null,
      category: 'Bioenergetic Precursor',
      regulatory: 'FDA GRAS / EFSA Article 13.1 Claim',
      role: 'Increases phosphocreatine reserves to resynthesize ATP during high-intensity muscular contractions.',
      evidence: 'High',
      citation: 'Kreider et al., JISSN 2017 (Position Stand)'
    }
  ];

  const filteredIngredients = ingredientCatalog.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.eNumber && item.eNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Scientific Intelligence & Methodology
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Food Intelligence & Nutri-Score Sandbox
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Inspect the official Santé Publique France 2023 algorithm, explore E-number regulatory facts, and run interactive scoring simulations.
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Interactive Nutri-Score
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'ingredients'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Additive Registry
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'calculator' ? (
        /* INTERACTIVE 2023 NUTRI-SCORE SANDBOX */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders Input Panel */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Input Nutrition Facts (per 100g Solid Food)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Official 2023 Standard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="flex justify-between text-slate-300 mb-1">
                  <span>Calories (kcal):</span>
                  <span className="font-bold text-white">{calories} kcal ({energyKj} kJ)</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="900"
                  value={calories}
                  onChange={(e) => setCalories(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-slate-300 mb-1">
                  <span>Sugars (g):</span>
                  <span className="font-bold text-rose-400">{sugars}g</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="0.5"
                  value={sugars}
                  onChange={(e) => setSugars(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-slate-300 mb-1">
                  <span>Saturated Fat (g):</span>
                  <span className="font-bold text-rose-400">{satFat}g</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="35"
                  step="0.2"
                  value={satFat}
                  onChange={(e) => setSatFat(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-slate-300 mb-1">
                  <span>Sodium (mg):</span>
                  <span className="font-bold text-rose-400">{sodium}mg</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="10"
                  value={sodium}
                  onChange={(e) => setSodium(parseFloat(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-slate-300 mb-1">
                  <span>Protein (g):</span>
                  <span className="font-bold text-emerald-400">{protein}g</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.5"
                  value={protein}
                  onChange={(e) => setProtein(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-slate-300 mb-1">
                  <span>Dietary Fiber (g):</span>
                  <span className="font-bold text-emerald-400">{fiber}g</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.2"
                  value={fiber}
                  onChange={(e) => setFiber(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex justify-between text-slate-300 mb-1">
                  <span>Fruits, Vegetables, Legumes, Nuts (%):</span>
                  <span className="font-bold text-emerald-400">{fruitVeg}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={fruitVeg}
                  onChange={(e) => setFruitVeg(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Real-Time Result Gauge Card */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 block mb-2">
                Computed 2023 Grade
              </span>
              <div className="flex items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl ${
                  grade === 'A' ? 'bg-emerald-600' :
                  grade === 'B' ? 'bg-lime-500 text-slate-950' :
                  grade === 'C' ? 'bg-yellow-400 text-slate-950' :
                  grade === 'D' ? 'bg-orange-500' : 'bg-rose-600'
                }`}>
                  {grade}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-100">
                    Net Score: {netScore}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    N ({totalN}) - P ({totalP})
                  </div>
                </div>
              </div>

              {/* Point Breakdown Details */}
              <div className="mt-6 space-y-2 text-xs border-t border-slate-800 pt-4">
                <div className="flex justify-between text-rose-400">
                  <span>Negative Points (N):</span>
                  <span className="font-mono font-bold">+{totalN} pts</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Positive Points (P):</span>
                  <span className="font-mono font-bold">-{totalP} pts</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Protein Counted:</span>
                  <span className="font-semibold text-slate-200">
                    {proteinExcluded ? 'Excluded (Anti-Masking)' : `+${effectiveProtPts} pts`}
                  </span>
                </div>
              </div>
            </div>

            {proteinExcluded && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300">
                <strong>Anti-Masking Rule Active:</strong> Because total negative points reached 11+ and fruit/veg content was &lt;80%, protein points are excluded to prevent high sugar/fat junk foods from appearing healthy.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ADDITIVE & INGREDIENT REGISTRY */
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800">
            <Search className="w-5 h-5 text-slate-500 ml-2" />
            <input
              type="text"
              placeholder="Search ingredient or E-number (e.g. Sucralose, E407, MSG, Creatine)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIngredients.map((item, i) => (
              <div
                key={i}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-base font-bold text-white">
                      {item.name}
                    </h4>
                    {item.eNumber && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                        {item.eNumber}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mb-2">
                    Category: <strong className="text-slate-300">{item.category}</strong>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {item.role}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-400 font-semibold">{item.regulatory}</span>
                  <span className="truncate max-w-[180px] text-slate-500 italic">{item.citation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
