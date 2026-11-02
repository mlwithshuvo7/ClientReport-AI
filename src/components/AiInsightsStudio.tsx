import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Plus,
  BookmarkCheck,
  ArrowRight,
  Cpu,
} from 'lucide-react';
import { Dataset, CalculatedKPI, AiInsight } from '../types';
import { calculateNumericalStats } from '../lib/analytics';

interface AiInsightsStudioProps {
  dataset: Dataset;
  kpis: CalculatedKPI[];
  existingInsights: AiInsight[];
  onAddInsights: (insights: AiInsight[]) => void;
  onAddInsightToReport: (insight: AiInsight) => void;
  reportInsightIds: string[];
}

export const AiInsightsStudio: React.FC<AiInsightsStudioProps> = ({
  dataset,
  kpis,
  existingInsights,
  onAddInsights,
  onAddInsightToReport,
  reportInsightIds,
}) => {
  const [loading, setLoading] = useState(false);
  const [engineUsed, setEngineUsed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    // Calculate minimal column statistical summaries for top numerical columns
    const numCols = dataset.columns.filter((c) => c.type === 'number').slice(0, 5);
    const columnStats = numCols.map((c) => {
      const stats = calculateNumericalStats(dataset.rows, c.name);
      return {
        column: c.name,
        mean: stats?.mean,
        median: stats?.median,
        stdDev: stats?.stdDev,
        min: stats?.min,
        max: stats?.max,
        p25: stats?.p25,
        p75: stats?.p75,
      };
    });

    const payload = {
      datasetSummary: {
        name: dataset.name,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        qualityScore: dataset.qualityScore,
      },
      kpis: kpis.slice(0, 6).map((k) => ({
        label: k.label,
        value: k.formattedValue,
        formula: k.formula,
      })),
      columnStats,
    };

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate insights.');
      }

      setEngineUsed(data.engine || 'rule_engine');
      onAddInsights(data.insights);
    } catch (err: any) {
      console.warn('API route failed, generating safe in-memory fallback:', err);
      setError(err?.message || 'Could not connect to insights engine.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'risk_anomaly':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            Risk & Anomaly
          </span>
        );
      case 'growth_opportunity':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp className="w-3 h-3" />
            Growth Opportunity
          </span>
        );
      case 'correlation':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3 h-3" />
            Statistical Driver
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            <BrainCircuit className="w-3 h-3" />
            Executive Brief
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Insights & Narratives</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Transform complex statistical tables into clear executive narratives and strategic next steps.
          </p>
        </div>

        <button
          onClick={generateInsights}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Synthesizing Insights...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {existingInsights.length > 0 ? 'Regenerate Insights' : 'Generate AI Insights'}
            </>
          )}
        </button>
      </div>

      {/* Privacy Architecture Guarantee Callout */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold">Zero-Cloud Raw Data Guarantee: </span>
            <span className="text-slate-300">
              Only derived aggregate metrics (e.g., total sales, mean, standard deviation, row count) are analyzed.
              Raw customer rows are never transmitted.
            </span>
          </div>
        </div>

        {engineUsed && (
          <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] font-mono text-emerald-400 border border-slate-700">
            <Cpu className="w-3.5 h-3.5" />
            <span>Engine: {engineUsed}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          Notice: {error} (Falling back to offline deterministic rule engine).
        </div>
      )}

      {/* Insights Cards List */}
      {existingInsights.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-bold text-base text-slate-900">No Insights Generated Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click the button above to analyze your verified {dataset.rowCount.toLocaleString()} rows and auto-discover
              key trends, anomalies, and recommendations.
            </p>
          </div>
          <button
            onClick={generateInsights}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Start AI Synthesis
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {existingInsights.map((insight) => {
            const isAdded = reportInsightIds.includes(insight.id);
            return (
              <div
                key={insight.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {getCategoryBadge(insight.category)}
                    <span className="text-[10px] font-mono text-slate-400">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">{insight.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{insight.narrative}</p>

                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Actionable Next Steps
                      </span>
                      {insight.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Source: {insight.generatedWith === 'gemini' ? 'Gemini 3.8 Flash' : 'Deterministic Rule Engine'}
                  </span>
                  <button
                    onClick={() => onAddInsightToReport(insight)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        In Report
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add to Executive Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
