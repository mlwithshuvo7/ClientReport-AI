import React from 'react';
import {
  BarChart3,
  Database,
  Wand2,
  PieChart,
  BrainCircuit,
  FileText,
  Key,
  Settings,
  Upload,
  Sparkles,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { LicenseInfo, UserProfile, Project } from '../types';

export type AppView =
  | 'dashboard'
  | 'templates'
  | 'upload'
  | 'explorer'
  | 'cleaning'
  | 'analytics'
  | 'visualizations'
  | 'ai-insights'
  | 'report-builder'
  | 'license'
  | 'settings';

interface NavbarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  user: UserProfile | null;
  license: LicenseInfo | null;
  activeProject: Project | null;
  allProjects: Project[];
  onSelectProject: (p: Project) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
  isLandingMode: boolean;
  onToggleLanding: () => void;
  onOpenPalette: () => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  user,
  license,
  activeProject,
  allProjects,
  onSelectProject,
  onLogout,
  onOpenAuthModal,
  isLandingMode,
  onToggleLanding,
  onOpenPalette,
  onOpenChat,
}) => {
  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modLabel = isMac ? '⌘' : 'Ctrl+';
  const getTierBadge = () => {
    if (!license) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Trial Mode
        </span>
      );
    }
    const colors: Record<string, string> = {
      starter: 'bg-blue-100 text-blue-800 border-blue-200',
      professional: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      agency: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
          colors[license.tier] || 'bg-slate-100 text-slate-800'
        }`}
      >
        <Key className="w-3 h-3" />
        {license.tier}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!user) onToggleLanding();
                else onSelectView('dashboard');
              }}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-sky-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-sky-200 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
                  ClientReport <span className="text-sky-500">AI</span>
                </span>
                <span className="hidden sm:block text-[10px] font-medium tracking-wide text-slate-500 uppercase">
                  Turn Spreadsheets Into BI
                </span>
              </div>
            </button>

            {/* Project Switcher (When Authenticated) */}
            {user && activeProject && !isLandingMode && (
              <div className="hidden md:flex items-center pl-4 border-l border-slate-200">
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors">
                    <Layers className="w-3.5 h-3.5 text-sky-500" />
                    <span className="max-w-[140px] truncate">{activeProject.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                  {allProjects.length > 1 && (
                    <div className="absolute left-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 hidden group-hover:block z-50">
                      <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        My Projects ({allProjects.length})
                      </div>
                      {allProjects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => onSelectProject(p)}
                          className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between ${
                            p.id === activeProject.id
                              ? 'bg-sky-50 text-sky-700 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-400">{p.workingDataset.rowCount} rows</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Center Navigation (In App Mode) */}
          {user && !isLandingMode ? (
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => onSelectView('dashboard')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'dashboard'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <button
                onClick={() => onSelectView('templates')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'templates'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                Templates
              </button>
              <button
                onClick={() => onSelectView('upload')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'upload'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
              <button
                onClick={() => onSelectView('explorer')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'explorer'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Data Explorer
              </button>
              <button
                onClick={() => onSelectView('cleaning')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'cleaning'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                Cleaning Studio
              </button>
              <button
                onClick={() => onSelectView('analytics')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'analytics'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analytics
              </button>
              <button
                onClick={() => onSelectView('visualizations')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'visualizations'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                Charts
              </button>
              <button
                onClick={() => onSelectView('ai-insights')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'ai-insights'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
                AI Insights
              </button>
              <button
                onClick={() => onSelectView('report-builder')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'report-builder'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Report Builder
              </button>
            </nav>
          ) : (
            /* Public Landing Nav */
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button
                onClick={() => {
                  if (user) onToggleLanding();
                  else onSelectView('dashboard');
                }}
                className="hover:text-slate-900 transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => {
                  if (user) onToggleLanding();
                  else onSelectView('dashboard');
                }}
                className="hover:text-slate-900 transition-colors"
              >
                Live Interactive Demo
              </button>
              <button
                onClick={() => onSelectView('license')}
                className="hover:text-slate-900 transition-colors"
              >
                Pricing & Licensing
              </button>
              <button
                onClick={() => onSelectView('settings')}
                className="hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Privacy & Security
              </button>
            </nav>
          )}

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2.5">
            {/* Command Palette Hotkey Trigger */}
            <button
              onClick={onOpenPalette}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
              title="Open Command Palette & Shortcuts"
            >
              <span>Commands</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-mono font-bold text-slate-500">
                {modLabel}K
              </kbd>
            </button>

            {/* Ask AI Assistant Drawer Trigger */}
            {user && (
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                title="Ask Gemini AI Analyst (Ctrl+J)"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden md:inline">Ask AI</span>
                <kbd className="hidden lg:inline px-1.5 py-0.2 rounded bg-indigo-200/60 text-[9px] font-mono font-bold text-indigo-800">
                  {modLabel}J
                </kbd>
              </button>
            )}

            {user ? (
              <>
                <button
                  onClick={() => onSelectView('license')}
                  className="cursor-pointer transition-transform hover:scale-105"
                  title="View License Status"
                >
                  {getTierBadge()}
                </button>

                {isLandingMode ? (
                  <button
                    onClick={onToggleLanding}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 text-white font-semibold text-xs shadow-xs hover:bg-sky-600 transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Enter App
                  </button>
                ) : (
                  <button
                    onClick={onToggleLanding}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded"
                    title="View Public Marketing Site"
                  >
                    Public Site
                  </button>
                )}

                <button
                  onClick={() => onSelectView('settings')}
                  className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors ${
                    currentView === 'settings' ? 'bg-slate-100 text-slate-800' : ''
                  }`}
                  title="Settings & Privacy"
                >
                  <Settings className="w-4 h-4" />
                </button>

                <div className="h-5 w-px bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <button
                    onClick={onLogout}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenAuthModal}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenAuthModal}
                  className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  Get ClientReport AI
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
