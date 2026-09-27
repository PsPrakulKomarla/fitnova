import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Barcode,
  Info,
  CheckCircle2,
  HelpCircle,
  FileText,
  Clock,
  Layers,
  Sparkles,
  ArrowRight,
  Upload
} from 'lucide-react';
import { FoodScanJob } from '../../server/modules/food/food.models.js';

interface Phase3FoodResultViewProps {
  scanJob: FoodScanJob;
  onScanAnother: () => void;
  onUploadAdditionalLabel: () => void;
}

export const Phase3FoodResultView: React.FC<Phase3FoodResultViewProps> = ({
  scanJob,
  onScanAnother,
  onUploadAdditionalLabel
}) => {
  const p = scanJob.reconciledProduct;

  if (!p) {
    return (
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-base font-bold text-white">No structured product extracted</h3>
        <p className="text-xs text-slate-400 mt-1">Please try uploading a clearer photo of the food packaging.</p>
        <button
          onClick={onScanAnother}
          className="mt-4 px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
        >
          Scan Again
        </button>
      </div>
    );
  }

  const getVerificationBadge = (state: string) => {
    switch (state) {
      case 'VERIFIED':
        return { label: 'Verified GS1 Product', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'OBSERVED':
        return { label: 'Observed from Packaging Label', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'CONFLICT':
        return { label: 'Observation Conflict Detected', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
      case 'UNVERIFIED':
      default:
        return { label: 'Incomplete / Missing Nutrition Label', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
  };

  const verBadge = getVerificationBadge(p.verificationState);

  const formatNutritionVal = (val: number | null | undefined, unit: string) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-500 font-mono">— (Missing)</span>;
    }
    return <span className="font-bold text-slate-100">{val}{unit}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. PRODUCT TRUTH HEADER */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${verBadge.bg}`}>
                {verBadge.label}
              </span>
              {p.brand && (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Brand: {p.brand}
                </span>
              )}
              {p.barcode && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                  <Barcode className="w-3 h-3" />
                  {p.barcode}
                </span>
              )}
              <span className="text-[11px] font-mono text-slate-500">
                Match: {p.matchStatus}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {p.name || 'Unidentified Food Item'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Serving Size: <strong>{p.servingSize || 'Not specified on observed label'}</strong> • Based on {scanJob.observations.length} image observation{scanJob.observations.length > 1 ? 's' : ''}
            </p>
          </div>

          <button
            onClick={onScanAnother}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 self-start sm:self-auto"
          >
            Scan Another Item
          </button>
        </div>

        {/* Conflict Alert Banner if multi-image discrepancy detected */}
        {p.conflicts && p.conflicts.length > 0 && (
          <div className="mt-4 p-4 bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-300">
                Label Discrepancy / Observation Conflict Detected
              </h4>
              <p className="text-xs text-rose-200/90 mt-1">
                The uploaded images contain contradictory nutrition numbers. Values have been preserved alongside discrepancy notes rather than silently averaged.
              </p>
              <div className="mt-2 space-y-1 text-[11px] text-rose-300 font-mono">
                {p.conflicts.map((c, idx) => (
                  <div key={idx}>• {c.field}: {c.resolutionNotes}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Missing Information Alert Banner */}
        {p.missingFields && p.missingFields.length > 0 && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-300">
                  Nutrition Information Incomplete ({p.missingFields.length} unobserved fields)
                </h4>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  We identified this product, but the official nutrition table has not been fully verified from the uploaded image. We do not fabricate or guess missing values.
                </p>
              </div>
            </div>

            <button
              onClick={onUploadAdditionalLabel}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Nutrition Table</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. STRUCTURED NUTRITION TABLE (Explicit Missing Values) */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Extracted Nutrition Facts
            </h3>
            <p className="text-xs text-slate-400">
              Exact values extracted from packaging OCR ({p.nutrition.basis.replace('_', ' ')}).
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            Phase 3 Structured Schema
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Energy:</span>
            <div className="text-base">{formatNutritionVal(p.nutrition.energyKcal, ' kcal')}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Protein:</span>
            <div className="text-base">{formatNutritionVal(p.nutrition.proteinG, 'g')}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Carbohydrates:</span>
            <div className="text-base">{formatNutritionVal(p.nutrition.carbohydratesG, 'g')}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Sugars:</span>
            <div className="text-base">{formatNutritionVal(p.nutrition.sugarsG, 'g')}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Total Fat:</span>
            <div className="text-base">{formatNutritionVal(p.nutrition.fatG, 'g')}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Saturated Fat:</span>
            <div className="text-base">{formatNutritionVal(p.nutrition.saturatedFatG, 'g')}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Dietary Fiber:</span>
            <div className="text-base">{formatNutritionVal(p.nutrition.fiberG, 'g')}</div>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Sodium:</span>
            <div className="text-base">{formatNutritionVal(p.nutrition.sodiumMg, ' mg')}</div>
          </div>
        </div>
      </div>

      {/* 3. INGREDIENTS LIST & RAW LABEL PROVENANCE */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Observed Ingredients
            </h3>
            <p className="text-xs text-slate-400">
              Verbatim label wording preserved alongside parsed tokens.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {p.ingredients.length} items parsed
          </span>
        </div>

        {p.ingredientsRaw ? (
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
              Verbatim Raw Text from Label:
            </span>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
              "{p.ingredientsRaw}"
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950/60 rounded-xl text-xs text-slate-500">
            No ingredient text legible on this image.
          </div>
        )}

        {/* Parsed Ingredient Badges */}
        {p.ingredients && p.ingredients.length > 0 && (
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500 block mb-2">
              Parsed Components:
            </span>
            <div className="flex flex-wrap gap-2">
              {p.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2"
                >
                  <span className="text-slate-200 font-medium">{ing.canonicalName}</span>
                  {ing.eNumber && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {ing.eNumber}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. PROVENANCE & AUDIT TRAIL */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Provenance & Evidence Traceability
            </h3>
            <p className="text-xs text-slate-400">
              Every value is traced back to its specific source observation image.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {p.provenance.length} traced entries
          </span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {p.provenance.map((prov, i) => (
            <div
              key={i}
              className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">{prov.field}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">"{String(prov.observedValue).substring(0, 35)}"</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {prov.source}
                </span>
                <span>conf: {(prov.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
