import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  BarChart3,
  FileText,
  Database,
  TrendingUp,
  Search,
  Filter,
  X,
  PieChart,
  BrainCircuit,
} from 'lucide-react';
import { PROJECT_TEMPLATES, ProjectTemplate, instantiateProjectFromTemplate } from '../lib/projectTemplates';
import { Project } from '../types';

interface TemplateGalleryProps {
  onSelectTemplate: (project: Project) => void;
  onNavigateUpload: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  onNavigateUpload,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ProjectTemplate | null>(null);

  const categories = ['All', 'Marketing', 'Finance', 'Sales', 'Ecommerce', 'Customer Success'];

  const filteredTemplates = useMemo(() => {
    return PROJECT_TEMPLATES.filter((tmpl) => {
      const matchesCategory = selectedCategory === 'All' || tmpl.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleLaunch = (tmpl: ProjectTemplate) => {
    const project = instantiateProjectFromTemplate(tmpl);
    onSelectTemplate(project);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Project Templates Gallery</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Accelerate executive reporting with battle-tested templates pre-configured with data schemas, charts, and narratives.
          </p>
        </div>

        <button
          onClick={onNavigateUpload}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Database className="w-3.5 h-3.5 text-sky-400" />
          <span>Upload Custom Spreadsheet Instead</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates, metrics, tags..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
          >
            <div className="p-6 space-y-4">
              {/* Category Badge & Primary Metric */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${tmpl.badgeColor}`}
                >
                  {tmpl.category}
                </span>

                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">{tmpl.primaryMetric.label}</span>
                  <span className="text-xs font-black text-slate-900 font-mono">{tmpl.primaryMetric.value}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-extrabold text-base text-slate-900 group-hover:text-sky-600 transition-colors leading-snug">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{tmpl.description}</p>
              </div>

              {/* Included Artifacts Pill Strip */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                  <Database className="w-3 h-3 text-sky-500" />
                  {tmpl.dataset.rowCount} Verified Rows
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                  <BarChart3 className="w-3 h-3 text-emerald-500" />
                  {tmpl.charts.length} Preset Charts
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                  <FileText className="w-3 h-3 text-purple-500" />
                  Executive Report
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {tmpl.tags.slice(0, 4).map((tag, idx) => (
                  <span key={idx} className="text-[10px] text-slate-400 font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPreviewTemplate(tmpl)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => handleLaunch(tmpl)}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Modal Preview */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${previewTemplate.badgeColor}`}
                  >
                    {previewTemplate.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {previewTemplate.dataset.fileName}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">{previewTemplate.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{previewTemplate.subtitle}</p>
              </div>

              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Dataset Scope */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Records Verified</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{previewTemplate.dataset.rowCount} rows</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Attributes / Schema</span>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{previewTemplate.dataset.columnCount} columns</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Data Health Score</span>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">{previewTemplate.dataset.qualityScore}/100</p>
                </div>
              </div>

              {/* Sample Data Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Included Data Records Sample
                </span>
                <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                      <tr>
                        {previewTemplate.dataset.columns.map((c) => (
                          <th key={c.name} className="px-3 py-1.5 whitespace-nowrap">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                      {previewTemplate.dataset.rows.slice(0, 4).map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          {previewTemplate.dataset.columns.map((c) => (
                            <td key={c.name} className="px-3 py-1.5 whitespace-nowrap">
                              {String(r[c.name] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Executive Summary Narrative Preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pre-Formatted Executive Summary
                </span>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed font-sans">
                  {previewTemplate.reportConfig.executiveSummary}
                </div>
              </div>

              {/* Action items preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Recommended Action Plan
                </span>
                <div className="space-y-1.5">
                  {previewTemplate.reportConfig.actionItems.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Instantly initializes data explorer, clean transformations, and report builder.
              </span>
              <button
                onClick={() => {
                  handleLaunch(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Project with This Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
