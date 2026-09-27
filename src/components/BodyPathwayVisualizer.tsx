import React, { useState } from 'react';
import { Dumbbell, Heart, Flame, Sparkles, BookOpen, ExternalLink, Info } from 'lucide-react';
import { BodySystemPathway } from '../types/index.js';

interface BodyPathwayVisualizerProps {
  pathways: BodySystemPathway[];
  foodName: string;
}

export const BodyPathwayVisualizer: React.FC<BodyPathwayVisualizerProps> = ({ pathways, foodName }) => {
  const [selectedSystem, setSelectedSystem] = useState<'muscular' | 'digestive' | 'metabolic' | 'cardiovascular'>('muscular');

  const systemMeta = {
    muscular: {
      label: 'Muscular System',
      icon: Dumbbell,
      color: 'from-amber-500 to-orange-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      badge: 'Protein & Hypertrophy'
    },
    digestive: {
      label: 'Digestive Tract',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      badge: 'Microbiome & Motility'
    },
    metabolic: {
      label: 'Metabolic & Hepatic',
      icon: Flame,
      color: 'from-blue-500 to-indigo-500',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      badge: 'Glycemic & Mitochondrial'
    },
    cardiovascular: {
      label: 'Cardiovascular System',
      icon: Heart,
      color: 'from-rose-500 to-pink-500',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      badge: 'Endothelial & Electrolytes'
    }
  };

  const activePathway = pathways.find(p => p.system === selectedSystem) || pathways[0];
  const activeMeta = systemMeta[selectedSystem];
  const ActiveIcon = activeMeta.icon;

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Food → Body Physiological Mapping
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Evidence-Grounded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic biological journey of nutrients from <strong className="text-slate-200">{foodName}</strong> to target organs. No fake medical certainty.
          </p>
        </div>

        {/* System Tab Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['muscular', 'digestive', 'metabolic', 'cardiovascular'] as const).map(sys => {
            const Meta = systemMeta[sys];
            const Icon = Meta.icon;
            const isSelected = selectedSystem === sys;
            return (
              <button
                key={sys}
                onClick={() => setSelectedSystem(sys)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  isSelected
                    ? `${Meta.bgColor} ${Meta.textColor} ${Meta.borderColor} border shadow-sm`
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="capitalize">{sys}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Pathway Diagram Flow */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-5 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {/* Step 1: Ingested Nutrient */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 block mb-1">
                1. Scanned Nutrient
              </span>
              <p className="text-sm font-semibold text-slate-200">
                {activePathway?.nutrient || 'Dietary Component'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              Ingested via food matrix
            </div>
          </div>

          {/* Step 2: Physiological Target */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500 block mb-1">
                2. Physiological Role
              </span>
              <p className="text-sm font-semibold text-slate-200">
                {activePathway?.physiologicalRole || 'Biological Activity'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
              Biochemical function
            </div>
          </div>

          {/* Step 3: Cellular Mechanism */}
          <div className={`${activeMeta.bgColor} rounded-xl p-3.5 border ${activeMeta.borderColor} flex flex-col justify-between md:col-span-2`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-mono tracking-wider uppercase ${activeMeta.textColor}`}>
                  3. Systemic Mechanism & Tissue Response
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900/80 text-slate-300">
                  Strength: {activePathway?.evidenceStrength || 'High'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                {activePathway?.mechanism || 'Nutrient interaction within physiological pathways.'}
              </p>
            </div>

            {/* Citation reference */}
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 truncate">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{activePathway?.citation}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium shrink-0 ml-2">Peer Reviewed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Principle Reminder */}
      <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Strict Scientific Boundary:</strong> Nutritional biochemistry explains physiological processes and pathways. Population-level research reflects statistical associations, not individual medical diagnoses or disease predictions.
        </span>
      </div>
    </div>
  );
};
