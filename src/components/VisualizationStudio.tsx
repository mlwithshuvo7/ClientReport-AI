import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Layers,
  Save,
  CheckCircle2,
  Sliders,
  Palette,
} from 'lucide-react';
import { Dataset, ChartConfig, ChartType, AggregationType } from '../types';

interface VisualizationStudioProps {
  dataset: Dataset;
  savedCharts: ChartConfig[];
  onSaveChart: (chart: ChartConfig) => void;
  onDeleteChart: (id: string) => void;
}

const COLOR_PALETTES: Record<string, string[]> = {
  sky: ['#0ea5e9', '#38bdf8', '#7dd3fc', '#0284c7', '#0369a1'],
  emerald: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#047857'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9'],
  sunset: ['#f59e0b', '#fbbf24', '#f97316', '#ef4444', '#b91c1c'],
};

export const VisualizationStudio: React.FC<VisualizationStudioProps> = ({
  dataset,
  savedCharts,
  onSaveChart,
  onDeleteChart,
}) => {
  const numCols = useMemo(() => dataset.columns.filter((c) => c.type === 'number'), [dataset.columns]);
  const allCols = dataset.columns;

  // Chart configuration state
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [xAxisKey, setXAxisKey] = useState<string>(
    dataset.columns.find((c) => c.type === 'string')?.name || dataset.columns[0]?.name || ''
  );
  const [yAxisKey, setYAxisKey] = useState<string>(
    numCols[0]?.name || dataset.columns[1]?.name || dataset.columns[0]?.name || ''
  );
  const [aggregation, setAggregation] = useState<AggregationType>('sum');
  const [title, setTitle] = useState(`${yAxisKey} by ${xAxisKey}`);
  const [colorScheme, setColorScheme] = useState<string>('sky');
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  // Auto-aggregate rows based on X and Y selections
  const aggregatedData = useMemo(() => {
    if (!xAxisKey || !yAxisKey || dataset.rows.length === 0) return [];

    const groups = new Map<string, number[]>();

    for (const row of dataset.rows) {
      const rawX = row[xAxisKey];
      const key = rawX !== null && rawX !== undefined ? String(rawX).trim() : '(Blank)';
      const rawY = row[yAxisKey];
      const numY = typeof rawY === 'number' ? rawY : Number(String(rawY).replace(/[$,%]/g, ''));

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      if (Number.isFinite(numY)) {
        groups.get(key)!.push(numY);
      }
    }

    const result = Array.from(groups.entries()).map(([name, values]) => {
      let val = 0;
      if (values.length > 0) {
        if (aggregation === 'sum') val = values.reduce((a, b) => a + b, 0);
        else if (aggregation === 'avg') val = values.reduce((a, b) => a + b, 0) / values.length;
        else if (aggregation === 'count') val = values.length;
        else if (aggregation === 'min') val = Math.min(...values);
        else if (aggregation === 'max') val = Math.max(...values);
      } else {
        val = aggregation === 'count' ? 1 : 0;
      }

      return {
        name,
        value: Number(val.toFixed(2)),
      };
    });

    // Sort descending by value for high clarity, limit to top 15 categories for clean visuals
    return result.sort((a, b) => b.value - a.value).slice(0, 15);
  }, [dataset.rows, xAxisKey, yAxisKey, aggregation]);

  const colors = COLOR_PALETTES[colorScheme] || COLOR_PALETTES.sky;

  const handleSaveToProject = () => {
    const config: ChartConfig = {
      id: `chart-${Date.now()}`,
      title: title || `${yAxisKey} by ${xAxisKey}`,
      type: chartType,
      xAxisKey,
      yAxisKey,
      aggregation,
      colorScheme,
      showGrid,
      showLegend,
    };
    onSaveChart(config);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Visualization Studio</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build interactive charts powered by Recharts with dynamic dimension aggregation.
          </p>
        </div>

        <button
          onClick={handleSaveToProject}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          {savedNotice ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              Saved to Project!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Chart to Report
            </>
          )}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Config Panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-sky-500" />
            Chart Configuration
          </div>

          {/* Chart Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Visualization Type</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { type: 'bar' as ChartType, label: 'Bar', icon: BarChart3 },
                { type: 'line' as ChartType, label: 'Line', icon: LineIcon },
                { type: 'area' as ChartType, label: 'Area', icon: Layers },
                { type: 'pie' as ChartType, label: 'Pie', icon: PieIcon },
                { type: 'scatter' as ChartType, label: 'Dot', icon: BarChart3 },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setChartType(item.type)}
                  className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 border transition-all ${
                    chartType === item.type
                      ? 'bg-sky-50 border-sky-500 text-sky-700 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600 font-medium'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[10px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Chart Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chart Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-500 font-semibold"
            />
          </div>

          {/* Dimension (X-Axis) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">X-Axis / Category</label>
            <select
              value={xAxisKey}
              onChange={(e) => {
                setXAxisKey(e.target.value);
                setTitle(`${yAxisKey} by ${e.target.value}`);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none"
            >
              {allCols.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Metric (Y-Axis) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Y-Axis / Metric</label>
            <select
              value={yAxisKey}
              onChange={(e) => {
                setYAxisKey(e.target.value);
                setTitle(`${e.target.value} by ${xAxisKey}`);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none"
            >
              {allCols.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation Function */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Aggregation Math</label>
            <select
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value as AggregationType)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none"
            >
              <option value="sum">Sum of values (Total)</option>
              <option value="avg">Arithmetic Mean (Average)</option>
              <option value="count">Count of records (Frequency)</option>
              <option value="min">Minimum value</option>
              <option value="max">Maximum value</option>
            </select>
          </div>

          {/* Color Palettes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Color Theme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(COLOR_PALETTES).map((pal) => (
                <button
                  key={pal}
                  type="button"
                  onClick={() => setColorScheme(pal)}
                  className={`p-2 rounded-lg border text-center text-[10px] font-bold capitalize transition-all ${
                    colorScheme === pal
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {pal}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded border-slate-300 text-sky-500"
              />
              <span>Grid lines</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="rounded border-slate-300 text-sky-500"
              />
              <span>Legend</span>
            </label>
          </div>
        </div>

        {/* Right Preview Canvas */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{title}</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {aggregation.toUpperCase()}({yAxisKey}) grouped by {xAxisKey}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 uppercase">
                {chartType} chart
              </span>
            </div>

            {/* Recharts Canvas */}
            <div className="h-80 w-full pt-4">
              {aggregatedData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                  No data to display for the current selection.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={aggregatedData}>
                      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      {showLegend && <Legend />}
                      <Bar dataKey="value" name={yAxisKey} fill={colors[0]} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : chartType === 'line' ? (
                    <LineChart data={aggregatedData}>
                      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      {showLegend && <Legend />}
                      <Line type="monotone" dataKey="value" name={yAxisKey} stroke={colors[0]} strokeWidth={3} />
                    </LineChart>
                  ) : chartType === 'area' ? (
                    <AreaChart data={aggregatedData}>
                      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip />
                      {showLegend && <Legend />}
                      <Area type="monotone" dataKey="value" name={yAxisKey} fill={colors[0]} stroke={colors[0]} fillOpacity={0.25} />
                    </AreaChart>
                  ) : chartType === 'pie' ? (
                    <PieChart>
                      <Tooltip />
                      {showLegend && <Legend />}
                      <Pie
                        data={aggregatedData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label
                      >
                        {aggregatedData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  ) : (
                    <ScatterChart>
                      {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />}
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                      <YAxis dataKey="value" stroke="#64748b" fontSize={11} tickLine={false} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      {showLegend && <Legend />}
                      <Scatter name={yAxisKey} data={aggregatedData} fill={colors[0]} />
                    </ScatterChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Saved Charts Gallery */}
          {savedCharts.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Charts Added to Executive Report ({savedCharts.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {savedCharts.map((sc) => (
                  <div
                    key={sc.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{sc.title}</span>
                    <button
                      onClick={() => onDeleteChart(sc.id)}
                      className="text-slate-400 hover:text-rose-500 ml-1 text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
