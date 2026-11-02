import React from 'react';
import {
  Upload,
  BarChart3,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  Database,
  Layers,
  Wand2,
  Trash2,
  Copy,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { Project, UserProfile, LicenseInfo } from '../types';

interface DashboardProps {
  user: UserProfile;
  license: LicenseInfo | null;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onNewUpload: () => void;
  onLoadSample: (type: 'saas' | 'ecommerce' | 'marketing') => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (p: Project) => void;
  onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  license,
  projects,
  activeProject,
  onSelectProject,
  onNewUpload,
  onLoadSample,
  onDeleteProject,
  onDuplicateProject,
  onNavigate,
}) => {
  const totalRowsCleaned = projects.reduce((acc, p) => acc + p.workingDataset.rowCount, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-sky-400 border border-slate-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Workspace Active • {license ? `${license.tier.toUpperCase()} License` : 'Evaluation Mode'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Welcome back, {user.fullName.split(' ')[0]} 👋
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Upload raw spreadsheets to clean datasets, discover mathematical KPIs, and generate publication-grade PDF
            reports for clients in minutes.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onNewUpload}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload New Spreadsheet
            </button>
            <button
              onClick={() => onNavigate('templates')}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-900/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-sky-200" />
              Browse Project Templates
            </button>
            <button
              onClick={() => onNavigate('report-builder')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-sky-400" />
              Go to Report Builder
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{projects.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Rows Verified</span>
          <p className="text-2xl font-black text-sky-600 mt-1">{totalRowsCleaned.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Dataset</span>
          <p className="text-sm font-black text-slate-800 mt-2 truncate">
            {activeProject ? activeProject.name : 'None selected'}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Security Profile</span>
          <p className="text-sm font-black text-emerald-600 mt-2 flex items-center gap-1">
            <span>In-Memory Local</span>
          </p>
        </div>
      </div>

      {/* Projects Management List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Your Projects</h3>
            <p className="text-xs text-slate-500">Access and manage your ongoing reporting workspaces.</p>
          </div>

          <button
            onClick={onNewUpload}
            className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">No Projects Found</p>
              <p className="text-xs text-slate-500 mt-0.5">Upload a CSV or try one of the curated demo datasets below.</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((p) => {
              const isActive = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                    isActive
                      ? 'border-sky-500 bg-sky-50/20 shadow-xs ring-1 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {p.workingDataset.fileName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Health: {p.workingDataset.qualityScore}/100
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 truncate">{p.name}</h4>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>{p.workingDataset.rowCount.toLocaleString()} rows</span>
                      <span>{p.workingDataset.columnCount} columns</span>
                      <span>{p.charts.length} charts</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => onSelectProject(p)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      Open Workspace
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDuplicateProject(p)}
                        title="Duplicate project"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(p.id)}
                        title="Delete project"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enterprise Project Templates Banner */}
      <div className="bg-linear-to-r from-sky-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-sky-800/40 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-[10px] font-bold uppercase tracking-wider">
              <Layers className="w-3 h-3" />
              <span>Project Templates Library</span>
            </div>
            <h3 className="font-black text-lg text-white">
              Jumpstart Client Deliverables with Pre-Built Industry Templates
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Choose from executive-ready templates complete with verified datasets, smart KPIs, interactive Recharts, and automated narrative findings: Marketing ROI, Financial QBR, Sales Quota, Ecommerce Margins, and CS Churn Scorecards.
            </p>
          </div>

          <button
            onClick={() => onNavigate('templates')}
            className="self-start md:self-auto px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Explore Template Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* One-Click Demo Launchers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          Test Drive Instant Demo Datasets
        </h3>

        <div className="grid sm:grid-cols-3 gap-4">
          <button
            onClick={() => onLoadSample('saas')}
            className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 text-left transition-all space-y-1.5 cursor-pointer group"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">SaaS Recurring Revenue</span>
            <p className="font-bold text-xs text-slate-900 group-hover:text-sky-600 transition-colors">
              SaaS MRR & Churn Metrics →
            </p>
            <p className="text-[11px] text-slate-500">20 customer tiers, NPS scores, and subscription volume.</p>
          </button>

          <button
            onClick={() => onLoadSample('ecommerce')}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 text-left transition-all space-y-1.5 cursor-pointer group"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Ecommerce Margins</span>
            <p className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors">
              Sales & Profitability Deepdive →
            </p>
            <p className="text-[11px] text-slate-500">Regional sales logs, product discounts, and net profits.</p>
          </button>

          <button
            onClick={() => onLoadSample('marketing')}
            className="p-4 rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/30 text-left transition-all space-y-1.5 cursor-pointer group"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Paid Acquisition</span>
            <p className="font-bold text-xs text-slate-900 group-hover:text-purple-600 transition-colors">
              Marketing Campaign ROI →
            </p>
            <p className="text-[11px] text-slate-500">Channel spend, clicks, conversion rates, and ROAS.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
