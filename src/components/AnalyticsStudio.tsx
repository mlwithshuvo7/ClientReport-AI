import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Hash,
  Layers,
  Sparkles,
  Info,
  AlertCircle,
  Calculator,
  ArrowRight,
  Percent,
} from 'lucide-react';
import { Dataset, CalculatedKPI, NumericalStats, CategoricalStats, CorrelationPair } from '../types';
import {
  calculateNumericalStats,
  calculateCategoricalStats,
  calculatePearsonCorrelation,
  generateSmartKPIs,
} from '../lib/analytics';

interface AnalyticsStudioProps {
  dataset: Dataset;
  kpis: CalculatedKPI[];
  onSelectKpiForReport?: (kpi: CalculatedKPI) => void;
}

export const AnalyticsStudio: React.FC<AnalyticsStudioProps> = ({ dataset, kpis }) => {
  const [selectedNumCol, setSelectedNumCol] = useState<string>(
    dataset.columns.find((c) => c.type === 'number')?.name || ''
  );
  const [selectedCatCol, setSelectedCatCol] = useState<string>(
    dataset.columns.find((c) => c.type === 'string')?.name || ''
  );

  const numCols = useMemo(() => dataset.columns.filter((c) => c.type === 'number'), [dataset.columns]);
  const catCols = useMemo(() => dataset.columns.filter((c) => c.type === 'string'), [dataset.columns]);

  // Numerical stats for selected column
  const activeNumericalStats: NumericalStats | null = useMemo(() => {
    if (!selectedNumCol) return null;
    return calculateNumericalStats(dataset.rows, selectedNumCol);
  }, [dataset.rows, selectedNumCol]);

  // Categorical stats for selected column
  const activeCategoricalStats: CategoricalStats | null = useMemo(() => {
    if (!selectedCatCol) return null;
    return calculateCategoricalStats(dataset.rows, selectedCatCol);
  }, [dataset.rows, selectedCatCol]);

  // Correlation matrix among top numerical columns
  const correlations: CorrelationPair[] = useMemo(() => {
    const pairs: CorrelationPair[] = [];
    const cols = numCols.slice(0, 6);
    for (let i = 0; i < cols.length; i++) {
      for (let j = i + 1; j < cols.length; j++) {
        const pair = calculatePearsonCorrelation(dataset.rows, cols[i].name, cols[j].name);
        if (pair) pairs.push(pair);
      }
    }
    return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  }, [dataset.rows, numCols]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Studio Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Analytics & Statistical Engine</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Mathematically sound descriptive statistics, Pearson correlations, and discovered business KPIs.
        </p>
      </div>

      {/* Discovered KPIs Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            Auto-Discovered Business KPIs ({kpis.length})
          </h3>
          <span className="text-[11px] text-slate-400">Derived strictly from active verified rows</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-sky-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {kpi.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {kpi.sourceColumn}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.formattedValue}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{kpi.description}</p>
              <p className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 truncate">
                Formula: {kpi.formula}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Deep Numerical Descriptive Stats Table */}
      {numCols.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-500" />
                Descriptive Statistical Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect central tendency, sample dispersion, and percentile spread.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Metric Column:</span>
              <select
                value={selectedNumCol}
                onChange={(e) => setSelectedNumCol(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 font-semibold bg-slate-50 text-slate-800 focus:outline-none focus:border-sky-500"
              >
                {numCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeNumericalStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Arithmetic Mean</span>
                <p className="text-lg font-black text-slate-900 mt-1">{activeNumericalStats.mean.toLocaleString()}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Median (p50)</span>
                <p className="text-lg font-black text-slate-900 mt-1">{activeNumericalStats.median.toLocaleString()}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sample Std Deviation</span>
                <p className="text-lg font-black text-slate-900 mt-1">{activeNumericalStats.stdDev.toLocaleString()}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sample Variance</span>
                <p className="text-lg font-black text-slate-900 mt-1">{activeNumericalStats.variance.toLocaleString()}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Min / Max</span>
                <p className="text-sm font-black text-slate-900 mt-1 font-mono">
                  {activeNumericalStats.min} / {activeNumericalStats.max}
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Interquartile (IQR)</span>
                <p className="text-lg font-black text-slate-900 mt-1">{activeNumericalStats.iqr.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Percentile Distribution Bar */}
          {activeNumericalStats && (
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Quartile & Percentile Distribution
              </span>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">25th Percentile</span>
                  <span className="font-black text-slate-800">{activeNumericalStats.p25.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">50th Percentile (Median)</span>
                  <span className="font-black text-sky-600">{activeNumericalStats.median.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">75th Percentile</span>
                  <span className="font-black text-slate-800">{activeNumericalStats.p75.toLocaleString()}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">90th Percentile</span>
                  <span className="font-black text-slate-800">{activeNumericalStats.p90.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pearson Correlation Matrix & Categorical Frequency */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Correlation Matrix */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Pearson Correlation Matrix
            </h3>
            <span className="text-[10px] font-mono text-slate-400">(-1 to +1)</span>
          </div>

          <p className="text-xs text-slate-500">
            Measures linear relationships between numerical dimensions. Helps detect business drivers.
          </p>

          {correlations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 italic">
              Need at least 2 numerical columns to compute correlations.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {correlations.slice(0, 6).map((pair, idx) => {
                const isPositive = pair.correlation > 0;
                const badgeColor =
                  pair.strength === 'very_strong'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : pair.strength === 'strong'
                    ? 'bg-sky-50 text-sky-700 border-sky-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200';

                return (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-800">
                        {pair.col1} <span className="text-slate-400 font-normal">vs</span> {pair.col2}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold mt-1 inline-block ${badgeColor}`}>
                        {pair.strength.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-black font-mono ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {pair.correlation > 0 ? `+${pair.correlation}` : pair.correlation}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Categorical Distribution Analysis */}
        {catCols.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                Categorical Frequencies
              </h3>

              <select
                value={selectedCatCol}
                onChange={(e) => setSelectedCatCol(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 font-semibold bg-slate-50"
              >
                {catCols.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {activeCategoricalStats && (
              <div className="space-y-3 pt-1">
                <div className="text-xs text-slate-500 flex justify-between">
                  <span>Unique Values: {activeCategoricalStats.uniqueCount}</span>
                  <span>Missing: {activeCategoricalStats.missingCount}</span>
                </div>

                <div className="space-y-2">
                  {activeCategoricalStats.topCategories.slice(0, 5).map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[200px]">{cat.label || '(Blank)'}</span>
                        <span>
                          {cat.count.toLocaleString()} ({cat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-sky-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(4, cat.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
