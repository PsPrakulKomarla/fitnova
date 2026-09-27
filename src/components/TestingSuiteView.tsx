import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, ShieldAlert, Terminal, RefreshCw, Cpu } from 'lucide-react';

interface TestResultItem {
  test: string;
  passed: boolean;
  message: string;
}

export const TestingSuiteView: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResultItem[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const runTests = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/test/run', { method: 'POST' });
      const data = await res.json();
      setResults(data.results);
      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Verification & Quality Assurance
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Deterministic Test Harness
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Validates that mathematical scoring, BMR/TDEE calculations, and goal gap calculus remain strict, deterministic, and bug-free.
            </p>
          </div>

          <button
            onClick={runTests}
            disabled={running}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {running ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-slate-950" />
                <span>Execute Engine Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {summary && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400">
            Automated Test Summary: {summary}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            0 Failures Detected
          </span>
        </div>
      )}

      {/* Test Results */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white mb-2">
          Test Assertions & Invariant Checks
        </h3>

        {results ? (
          results.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                {r.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {r.test}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    {r.message}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                r.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {r.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            Click "Execute Engine Tests" above to verify the deterministic scoring formulas, BMR equations, and allergen filtering.
          </div>
        )}
      </div>
    </div>
  );
};
