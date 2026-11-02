import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Building,
  User,
  Palette,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart3,
  BrainCircuit,
  Plus,
  Trash2,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Project, CalculatedKPI, ReportConfig, LicenseInfo } from '../types';
import { generateReportPdf } from '../lib/pdfGenerator';
import { exportToSafeCsv } from '../lib/fileProcessor';

interface ReportBuilderProps {
  project: Project;
  kpis: CalculatedKPI[];
  license: LicenseInfo | null;
  onUpdateReportConfig: (config: ReportConfig) => void;
  onOpenLicense: () => void;
}

const TEMPLATES: Record<string, { title: string; subtitle: string; summary: string }> = {
  executive: {
    title: 'Executive Business Intelligence Report',
    subtitle: 'Strategic Performance Summary & Data Audit',
    summary:
      'This executive report synthesizes key performance indicators and statistical distributions derived from verified operational data. Overall performance indicates healthy throughput with opportunities for margin expansion across leading segments.',
  },
  quarterly_business_review: {
    title: 'Quarterly Business Review (QBR)',
    subtitle: 'Comprehensive Operational & Growth Assessment',
    summary:
      'A holistic review of operational performance, cohort activity, and financial metrics across the reporting period. Primary objectives remain on track with localized areas targeted for efficiency improvements.',
  },
  marketing_roi: {
    title: 'Marketing Campaign ROI & Attribution Report',
    subtitle: 'Channel Efficiency, Acquisition Cost & Revenue Yield',
    summary:
      'Analysis of omnichannel marketing performance reveals strong attribution in high-intent cohorts, with blended ROAS exceeding target baselines. Reallocating budget to top-performing channels will optimize CAC.',
  },
  ecommerce_deepdive: {
    title: 'Ecommerce Sales & Profitability Analysis',
    subtitle: 'Category Margins, Order Velocity & Regional Demand',
    summary:
      'Detailed audit of transactional order logs, basket size, discount elasticity, and net profitability by product category and geography.',
  },
};

export const ReportBuilder: React.FC<ReportBuilderProps> = ({
  project,
  kpis,
  license,
  onUpdateReportConfig,
  onOpenLicense,
}) => {
  const report = project.reportConfig;
  const isAgency = license?.tier === 'agency';
  const isPro = license?.tier === 'professional' || isAgency;

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [newActionItem, setNewActionItem] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleTemplateChange = (templateKey: string) => {
    const tmpl = TEMPLATES[templateKey];
    if (tmpl) {
      onUpdateReportConfig({
        ...report,
        template: templateKey as any,
        title: tmpl.title,
        subtitle: tmpl.subtitle,
        executiveSummary: tmpl.summary,
      });
    }
  };

  const handleAddActionItem = () => {
    if (!newActionItem.trim()) return;
    onUpdateReportConfig({
      ...report,
      actionItems: [...(report.actionItems || []), newActionItem.trim()],
    });
    setNewActionItem('');
  };

  const handleRemoveActionItem = (index: number) => {
    const updated = [...(report.actionItems || [])];
    updated.splice(index, 1);
    onUpdateReportConfig({
      ...report,
      actionItems: updated,
    });
  };

  const handleExportPdf = () => {
    setDownloading(true);
    setTimeout(() => {
      try {
        const doc = generateReportPdf({
          project,
          kpis,
          includeBranding: isAgency,
        });
        doc.save(`${(report.title || 'ClientReport').toLowerCase().replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
        console.error('PDF generation error:', err);
      } finally {
        setDownloading(false);
      }
    }, 200);
  };

  const handleExportSafeCsv = () => {
    const csvStr = exportToSafeCsv(project.workingDataset.rows, project.workingDataset.columns);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${project.name.toLowerCase().replace(/\s+/g, '_')}_verified.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Report Builder</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Design publication-grade business intelligence reports with custom client branding and instant vector PDF export.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab(activeTab === 'editor' ? 'preview' : 'editor')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            {activeTab === 'editor' ? 'Live Preview' : 'Back to Editor'}
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer no-print"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print
          </button>

          <button
            onClick={handleExportSafeCsv}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Clean CSV
          </button>

          <button
            onClick={handleExportPdf}
            disabled={downloading}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Rendering Vector PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Report Settings & Custom Branding */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-sky-500" />
              Client & Brand Customization
            </h3>

            {/* Template Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Report Template</label>
              <select
                value={report.template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:border-sky-500"
              >
                <option value="executive">Executive Business Brief</option>
                <option value="quarterly_business_review">Quarterly Business Review (QBR)</option>
                <option value="marketing_roi">Marketing Campaign ROI & Attribution</option>
                <option value="ecommerce_deepdive">Ecommerce Sales & Profitability</option>
              </select>
            </div>

            {/* Titles */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Report Headline</label>
              <input
                type="text"
                value={report.title}
                onChange={(e) => onUpdateReportConfig({ ...report, title: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={report.subtitle}
                onChange={(e) => onUpdateReportConfig({ ...report, subtitle: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Company & Client Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Firm / Agency</label>
                <input
                  type="text"
                  value={report.companyName}
                  onChange={(e) => onUpdateReportConfig({ ...report, companyName: e.target.value })}
                  placeholder="Acme Analytics"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={report.clientName}
                  onChange={(e) => onUpdateReportConfig({ ...report, clientName: e.target.value })}
                  placeholder="Apex Corp Stakeholders"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lead Analyst / Author</label>
              <input
                type="text"
                value={report.authorName}
                onChange={(e) => onUpdateReportConfig({ ...report, authorName: e.target.value })}
                placeholder="Senior Business Analyst"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                Report Theme Accent
              </label>
              <div className="flex items-center gap-2">
                {['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#111827'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => onUpdateReportConfig({ ...report, primaryColor: hex })}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      report.primaryColor === hex ? 'scale-110 border-slate-900 ring-2 ring-slate-400' : 'border-white'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            {/* Section Inclusion Toggles */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Include Report Sections
              </span>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={report.includeDataQuality}
                  onChange={(e) => onUpdateReportConfig({ ...report, includeDataQuality: e.target.checked })}
                  className="rounded text-sky-500"
                />
                <span>Dataset Governance & Health Audit</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={report.includeAiInsights}
                  onChange={(e) => onUpdateReportConfig({ ...report, includeAiInsights: e.target.checked })}
                  className="rounded text-sky-500"
                />
                <span>AI Insights & Observations</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={report.includeRecommendations}
                  onChange={(e) => onUpdateReportConfig({ ...report, includeRecommendations: e.target.checked })}
                  className="rounded text-sky-500"
                />
                <span>Strategic Action Items & Next Steps</span>
              </label>
            </div>
          </div>

          {/* Right Column: Narrative Editor & Action Items */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Executive Business Summary</h3>
              <p className="text-xs text-slate-500 mb-3">
                Edit the primary narrative that introduces findings to stakeholders.
              </p>
              <textarea
                rows={5}
                value={report.executiveSummary}
                onChange={(e) => onUpdateReportConfig({ ...report, executiveSummary: e.target.value })}
                className="w-full p-3.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500 font-sans leading-relaxed"
                placeholder="Write executive overview..."
              />
            </div>

            {/* High-Impact Action Items */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Recommended Next Steps & Action Items</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clear directives for management and client operational teams.
                  </p>
                </div>
              </div>

              {/* List */}
              <div className="space-y-2">
                {(report.actionItems || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 font-medium">{item}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveActionItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add item */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newActionItem}
                  onChange={(e) => setNewActionItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddActionItem();
                  }}
                  placeholder="e.g. Expand retargeting spend on Top 25% revenue generating cohorts..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAddActionItem}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Quick Audit Snapshot */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>PDF Document Ready for Client Review</span>
              </div>
              <button
                onClick={handleExportPdf}
                className="text-sky-600 font-bold hover:underline"
              >
                Render & Download →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Live Document Page Preview */
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-300 shadow-xl max-w-4xl mx-auto space-y-8 font-sans">
          {/* Top Brand Stripe */}
          <div className="h-2 rounded-full" style={{ backgroundColor: report.primaryColor || '#0ea5e9' }} />

          {/* Header */}
          <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950">{report.title}</h1>
              {report.subtitle && <p className="text-sm text-slate-500 mt-1">{report.subtitle}</p>}
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500">
              <p className="font-bold text-slate-800">{report.companyName || 'Business Intelligence Unit'}</p>
              <p>Client: {report.clientName || 'General Stakeholders'}</p>
              <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>

          {/* 1. Executive Summary */}
          {report.executiveSummary && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                1. Executive Business Summary
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {report.executiveSummary}
              </p>
            </div>
          )}

          {/* 2. Governance Audit */}
          {report.includeDataQuality && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                2. Dataset Governance & Health Audit
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Verified Active Rows</span>
                  <span className="text-lg font-black text-slate-900">
                    {project.workingDataset.rowCount.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Tracked Dimensions</span>
                  <span className="text-lg font-black text-slate-900">{project.workingDataset.columnCount}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Data Quality Score</span>
                  <span className="text-lg font-black text-emerald-600">
                    {project.workingDataset.qualityScore} / 100
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Discovered KPIs Table */}
          {kpis.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                3. Business Performance Indicators (Calculated)
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">KPI Metric</th>
                      <th className="px-4 py-2.5">Calculated Value</th>
                      <th className="px-4 py-2.5">Calculation Basis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {kpis.slice(0, 8).map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-2 font-bold text-slate-800">{k.label}</td>
                        <td className="px-4 py-2 font-mono font-black text-sky-600">{k.formattedValue}</td>
                        <td className="px-4 py-2 text-slate-500 font-mono text-[11px]">{k.formula}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. Strategic Observations */}
          {report.includeAiInsights && project.insights && project.insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                4. Key Findings & Observations
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {project.insights.slice(0, 4).map((ins) => (
                  <div key={ins.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <h5 className="font-bold text-xs text-sky-700">{ins.title}</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{ins.narrative}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Recommended Next Steps */}
          {report.includeRecommendations && report.actionItems && report.actionItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                5. High-Impact Action Items
              </h3>
              <div className="space-y-2">
                {report.actionItems.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                    <span className="font-bold text-sky-600">[{idx + 1}]</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signoff */}
          <div className="pt-8 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-400">
            <span>Prepared via ClientReport AI • Proprietary and Confidential</span>
            <span>Authorized by: {report.authorName || 'Lead Analyst'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
