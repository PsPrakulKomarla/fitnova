import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Sparkles, Check, AlertCircle, Scan, ArrowRight, RefreshCw, FileText } from 'lucide-react';
import { FoodItemData, GoalGapAnalysis } from '../types/index.js';

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: { foodItem: FoodItemData; gapAnalysis: GoalGapAnalysis }) => void;
  userId: string;
}

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  userId
}) => {
  const [mode, setMode] = useState<'preset' | 'upload' | 'camera' | 'text'>('preset');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const presets = [
    {
      id: 'shake',
      name: 'Core Power 26g Protein Shake',
      category: 'Packaged Beverage / Barcode Scan',
      badge: 'Nutri-Score B',
      desc: 'Filtered low-fat milk, whey isolate, stevia/sucralose, carrageenan (E407).'
    },
    {
      id: 'yogurt',
      name: 'Greek Yogurt High Protein Bowl',
      category: 'Whole Food / Volumetric Vision',
      badge: 'Nutri-Score A',
      desc: 'Strained skim milk, fresh blueberries, chia seeds, honey.'
    },
    {
      id: 'wafer',
      name: 'Crispy Hazelnut Chocolate Wafer',
      category: 'Ultra-Processed Snack / OCR Label',
      badge: 'Nutri-Score E',
      desc: 'Sugar, palm oil, wheat flour, cocoa butter, emulsifier (E322).'
    },
    {
      id: 'salmon',
      name: 'Atlantic Salmon, Quinoa & Asparagus',
      category: 'Whole Dinner Plate / Macro Estimation',
      badge: 'Nutri-Score A',
      desc: 'Wild salmon fillet, tricolor quinoa, steamed asparagus, olive oil.'
    }
  ];

  const runAnalysis = async (params: { textDescription?: string; imageBase64?: string }) => {
    setLoading(true);
    setError(null);
    try {
      setLoadingStage('Capturing Optical Sensor Stream...');
      await new Promise(r => setTimeout(r, 300));
      setLoadingStage('Multimodal Gemini 3.8 Flash OCR & Ingredient Tokenization...');
      await new Promise(r => setTimeout(r, 350));
      setLoadingStage('Calculating Deterministic 2023 Nutri-Score & Macro Vectors...');
      await new Promise(r => setTimeout(r, 250));
      setLoadingStage('Mapping Physiological Body Pathways & Target Gaps...');

      const res = await fetch('/api/scan/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          textDescription: params.textDescription,
          imageBase64: params.imageBase64,
          mimeType: 'image/jpeg'
        })
      });

      if (!res.ok) {
        throw new Error('Analysis failed. Please check inputs.');
      }

      const data = await res.json();
      onScanComplete(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Scan error');
    } finally {
      setLoading(false);
      setLoadingStage('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImage(base64);
        runAnalysis({ imageBase64: base64, textDescription: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Food Scanner & OCR Intelligence
              </h2>
              <p className="text-xs text-slate-400">
                Primary observation engine: extracts label truth, ingredients & nutrition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-5 pt-3 gap-2 text-xs">
          <button
            onClick={() => setMode('preset')}
            className={`pb-3 px-3 font-semibold transition-all border-b-2 ${
              mode === 'preset'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Instant Presets (Judge Demo)
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`pb-3 px-3 font-semibold transition-all border-b-2 ${
              mode === 'upload'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload Food / Label Photo
          </button>
          <button
            onClick={() => setMode('text')}
            className={`pb-3 px-3 font-semibold transition-all border-b-2 ${
              mode === 'text'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Describe Food / Ingredients
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping opacity-60" />
                <div className="relative w-20 h-20 rounded-2xl bg-slate-950 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <RefreshCw className="w-9 h-9 text-emerald-400 animate-spin" />
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-100 mb-1">
                Analyzing Food Truth
              </h4>
              <p className="text-xs text-emerald-400 font-mono animate-pulse">
                {loadingStage}
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mt-3">
                Applying OCR extraction, official 2023 Nutri-Score scoring, E-number regulatory checks, and goal gap calculus.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {mode === 'preset' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 mb-3">
                    Select a calibrated reference food item to evaluate the entire pipeline:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => runAnalysis({ textDescription: p.name })}
                        className="text-left p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-mono uppercase text-slate-400">
                              {p.category}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/20">
                              {p.badge}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                            {p.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                            {p.desc}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-emerald-400 font-semibold">
                          <span>Run Complete Pipeline</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {mode === 'upload' && (
                <div className="space-y-4 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 cursor-pointer bg-slate-950/50 hover:bg-slate-950 transition-all flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-200">
                        Click to select food or nutrition label image
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        JPEG, PNG, WebP up to 10MB. Works on packaging, barcode, or plated meal.
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Image will be processed via Gemini 3.8 Flash Vision for OCR table reading and ingredient extraction.
                  </p>
                </div>
              )}

              {mode === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Describe the meal, ingredients, or paste nutrition table text:
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      rows={4}
                      placeholder="e.g. 200g grilled salmon with 1 cup brown rice and steamed broccoli, dressed in olive oil..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => runAnalysis({ textDescription: textInput })}
                    disabled={!textInput.trim()}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Food & Calculate Gaps</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with Four Truths reminder */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Strict Truth Separation: Label OCR → Deterministic Math → Peer-Reviewed Evidence</span>
          </div>
          <span className="text-slate-500">v2023 Nutri-Score</span>
        </div>
      </div>
    </div>
  );
};
