import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { PRICING_TIERS } from '../lib/licensing';
import { getSampleDataset } from '../lib/sampleDatasets';
import { generateSmartKPIs } from '../lib/analytics';
import { Dataset } from '../types';

interface LandingPageProps {
  onStartDemo: (sampleType: 'saas' | 'ecommerce' | 'marketing') => void;
  onOpenAuth: () => void;
  onSelectTier: (tier: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo, onOpenAuth, onSelectTier }) => {
  const [activeDemoTab, setActiveDemoTab] = useState<'saas' | 'ecommerce' | 'marketing'>('saas');
  const [demoDataset, setDemoDataset] = useState<Dataset>(() => getSampleDataset('saas'));
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDemoSwitch = (type: 'saas' | 'ecommerce' | 'marketing') => {
    setActiveDemoTab(type);
    setDemoDataset(getSampleDataset(type));
  };

  const sampleKpis = generateSmartKPIs(demoDataset.rows, demoDataset.columns);

  const faqs = [
    {
      q: 'Does my raw spreadsheet data ever get uploaded to your servers or cloud storage?',
      a: 'Never. ClientReport AI is built with a strict Zero-Cloud Data Privacy architecture. All parsing (CSV/XLSX), cleaning transformations, and statistical analytics execute 100% locally in your browser memory. When you opt into AI insights, only aggregated derived metrics (e.g. calculated total revenue, row counts, statistical mean) are sent—raw customer rows never leave your machine.',
    },
    {
      q: 'What does "One-Time Purchase" mean? Are there hidden monthly recurring subscriptions?',
      a: 'No recurring subscriptions. You pay once for your license tier (Starter $19, Professional $39, or Agency $79) and receive lifetime access to the version series with all included offline capabilities, future updates within the major version, and no recurring monthly fees.',
    },
    {
      q: 'Can I export clean CSVs and publication-grade PDF reports?',
      a: 'Yes. You can export vector-quality PDF reports branded with your company name, client name, and custom accent colors. Cleaned datasets can also be exported to CSV, protected with automated defenses against spreadsheet formula injection attacks (=, +, -, @).',
    },
    {
      q: 'How many devices can I activate on a single license?',
      a: 'Starter includes 1 activated device; Professional includes 3 devices for small teams; and Agency includes 10 devices for full agencies and consulting teams. You can also deactivate unused devices anytime from the License Manager.',
    },
    {
      q: 'What file formats are supported?',
      a: 'Standard Comma-Separated Values (.csv) and Microsoft Excel workbooks (.xlsx, .xls), supporting files up to 50MB and up to 100,000 rows with instant browser-side processing.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tag / Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>One-Time Purchase Software • Zero Cloud Data Risk</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
              Turn Your Spreadsheet Into <span className="text-sky-500">Business Intelligence</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Clean messy data, calculate rigorous statistics, discover automated KPIs, and generate professional PDF
              reports in minutes—without writing code.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onStartDemo('saas')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                Explore Live Demo
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
              >
                Get ClientReport AI
                <span className="text-xs text-slate-400 font-normal">($19 Lifetime)</span>
              </button>
            </div>

            {/* Security Guarantee Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% In-Browser Processing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>No Monthly Subscriptions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Formula Injection Protected</span>
              </div>
            </div>
          </div>

          {/* 2. Interactive Product Demonstration Sandbox Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
            {/* Top Toolbar / Tab Switcher */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono text-slate-300 ml-2">Interactive Preview — {demoDataset.name}</span>
              </div>

              {/* Sample Selector */}
              <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg text-xs">
                <button
                  onClick={() => handleDemoSwitch('saas')}
                  className={`px-3 py-1 rounded font-semibold transition-colors ${
                    activeDemoTab === 'saas' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SaaS MRR
                </button>
                <button
                  onClick={() => handleDemoSwitch('ecommerce')}
                  className={`px-3 py-1 rounded font-semibold transition-colors ${
                    activeDemoTab === 'ecommerce' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ecommerce Orders
                </button>
                <button
                  onClick={() => handleDemoSwitch('marketing')}
                  className={`px-3 py-1 rounded font-semibold transition-colors ${
                    activeDemoTab === 'marketing' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Marketing Ads
                </button>
              </div>
            </div>

            {/* Sandbox Content */}
            <div className="p-6 bg-slate-50/50">
              {/* Auto Discovered Real KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {sampleKpis.slice(0, 4).map((kpi) => (
                  <div key={kpi.id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide truncate">{kpi.label}</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{kpi.formattedValue}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{kpi.formula}</p>
                  </div>
                ))}
              </div>

              {/* Interactive Data Table Preview */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs mb-5">
                <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Parsed Records ({demoDataset.rowCount} rows verified)</span>
                  <span className="text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Quality: {demoDataset.qualityScore}/100
                  </span>
                </div>
                <div className="overflow-x-auto max-h-48">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                      <tr>
                        {demoDataset.columns.map((c) => (
                          <th key={c.name} className="px-4 py-2 whitespace-nowrap">
                            {c.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                      {demoDataset.rows.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          {demoDataset.columns.map((c) => (
                            <td key={c.name} className="px-4 py-2 whitespace-nowrap">
                              {String(row[c.name] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  Ready to test with your own raw CSV or XLSX spreadsheets?
                </div>
                <button
                  onClick={() => onStartDemo(activeDemoTab)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Open Full Studio with this Dataset
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem and Solution */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Professionals Ditch Manual Spreadsheet Reporting
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Spending 4 hours every Friday stitching Excel formulas into PowerPoint is unsustainable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way */}
            <div className="p-6 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-4">
              <div className="inline-flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                The Fragile Spreadsheet Nightmare
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Accidental formula edits breaking calculations silently.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Duplicate rows, dirty text casing, and hidden whitespace distorting KPIs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Uploading sensitive client customer data to untrusted cloud servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Copy-pasting screenshots into Word or Slides for unpolished client reports.</span>
                </li>
              </ul>
            </div>

            {/* The ClientReport AI Way */}
            <div className="p-6 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-4">
              <div className="inline-flex items-center gap-2 text-sky-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-sky-500" />
                The ClientReport AI Standard
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Automatic data quality audits and 1-click non-destructive cleaning with undo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Exact mathematical engine for descriptive statistics & Pearson correlation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>100% in-browser processing: raw rows never touch our backend.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">✓</span>
                  <span>Executive PDF generator with brand logos, custom colors, and narrative briefs.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for High-Precision Analytics
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Every feature is designed to eliminate busywork while maintaining 100% statistical fidelity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Drag & Drop Ingestion</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload .csv, .xlsx, or .xls files up to 50MB and 100,000 rows. Instant type inference, header trimming,
              and empty column identification.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Data Cleaning Studio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eliminate exact duplicates, normalize strings, impute missing values (mean, median, mode), and detect IQR
              outliers with full undo/redo history.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">True Statistical Rigor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No guessing or mocked math. Computes exact mean, median, sample std deviation, percentiles (p25-p90), and
              Pearson correlation matrices.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Visualization Studio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate interactive Bar, Line, Area, and Pie charts via Recharts. Customize dimensions, aggregations,
              and color palettes in real-time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Privacy-First AI Insights</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by Gemini 3.8 Flash. Analyzes ONLY high-level derived statistical KPI summaries—never your raw
              records—with rule-engine fallbacks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Executive PDF Builder</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compile branded multi-page PDFs with company logo, custom colors, action plans, and clean data tables
              ready for stakeholder signoff.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Pricing & Licensing Matrix */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              One-Time Purchase • No Subscription
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Transparent Lifetime Licensing</h2>
            <p className="text-slate-600 text-sm mt-2">
              Pay once, use forever. No unexpected recurring charges or lock-in.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.tier}
                className={`flex flex-col justify-between rounded-2xl p-7 bg-white border transition-all ${
                  tier.popular
                    ? 'border-sky-500 shadow-xl ring-2 ring-sky-500/20 relative'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{tier.tagline}</p>

                  <div className="mt-5 mb-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">${tier.price}</span>
                    <span className="text-xs font-semibold text-slate-500">one-time payment</span>
                  </div>

                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Included Capabilities</p>
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => onSelectTier(tier.tier)}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      tier.popular
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Select {tier.name} License
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2">
                    {tier.maxDevices} Device Limit • Instant Key Delivery
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Security & Local-First Architecture Guarantee */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OWASP Aligned & Privacy Guaranteed</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Enterprise Data Security Without the Cloud Risk
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              We know your business spreadsheets contain sensitive client figures, payroll data, and proprietary revenue
              metrics. That is why ClientReport AI operates with an in-memory client-side execution model.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  Local In-Memory Sandbox
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Files are parsed directly in your browser. Closing the tab removes cached dataset buffers.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
                <p className="text-xs font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  Formula Injection Sanitization
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Exported CSV files automatically escape dangerous spreadsheet triggers (=, +, -, @).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-sm mt-2">Everything you need to know about licensing, data privacy, and usage.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-20 bg-linear-to-b from-sky-50 to-white text-center border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Ready to Deliver Executive-Ready Reports?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Try the interactive sandbox or activate a lifetime license today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onStartDemo('saas')}
              className="px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-200 cursor-pointer"
            >
              Start Free Interactive Demo
            </button>
            <button
              onClick={onOpenAuth}
              className="px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md cursor-pointer"
            >
              Get License Key
            </button>
          </div>
        </div>
      </section>

      {/* 9. Professional Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
              CR
            </div>
            <span className="font-bold text-white text-sm">ClientReport AI</span>
            <span className="text-slate-500 ml-2">© {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span>Local-First Data Privacy</span>
            <span>OWASP Hardened</span>
            <span>One-Time Software License</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
