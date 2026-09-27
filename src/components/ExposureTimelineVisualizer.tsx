import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Calculator, BookOpen } from 'lucide-react';
import { ExposureHorizon } from '../types/index.js';

interface ExposureTimelineProps {
  scenarios: ExposureHorizon[];
}

export const ExposureTimelineVisualizer: React.FC<ExposureTimelineProps> = ({ scenarios }) => {
  const [selectedHorizonIndex, setSelectedHorizonIndex] = useState<number>(0);

  const currentScenario = scenarios[selectedHorizonIndex] || scenarios[0];

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Exposure Timeline & Cumulative Projection
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Calculation vs. Evidence
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mathematical cumulative intake over time contrasted against epidemiological evidence.
          </p>
        </div>
      </div>

      {/* Horizon Slider / Button Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
        {scenarios.map((sc, idx) => {
          const isSelected = selectedHorizonIndex === idx;
          return (
            <button
              key={sc.horizon}
              onClick={() => setSelectedHorizonIndex(idx)}
              className={`py-2 px-3 rounded-lg font-medium transition-all text-center ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="font-bold">{sc.horizon}</div>
              <div className="text-[10px] text-slate-400 opacity-80 truncate">{sc.intakeAmount.split('(')[0]}</div>
            </button>
          );
        })}
      </div>

      {/* Two Types of Truth Display: Deterministic Math vs Epidemiological Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {/* Column 1: Calculation Truth (Strict Arithmetic) */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4" />
              Calculation Truth (Deterministic Math)
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Exact arithmetic calculation if this item was consumed consistently for <strong>{currentScenario.horizon}</strong>:
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-sm font-medium text-slate-200 leading-relaxed">
              {currentScenario.mathematicalAccumulation}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Assumes regular frequency without portion variation.</span>
          </div>
        </div>

        {/* Column 2: Scientific Truth (Cohort Evidence) */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              Scientific Truth (Evidence Base)
            </div>
            <p className="text-xs text-slate-400 mb-2">
              What nutritional science and long-term cohort studies report about this exposure range:
            </p>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {currentScenario.evidenceContext}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Based on peer-reviewed meta-analyses & nutritional guidelines.</span>
          </div>
        </div>
      </div>

      {/* Uncertainty & Limitation Box */}
      <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-xs text-amber-300/90">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Model Limitation & Assumptions: </span>
          <span>{currentScenario.uncertaintyNotes} Individual physiology, physical exercise stimulus, and genetic variations modulate how cumulative intakes are metabolized.</span>
        </div>
      </div>
    </div>
  );
};
