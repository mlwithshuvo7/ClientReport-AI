import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Command,
  BarChart3,
  Upload,
  Database,
  Wand2,
  PieChart,
  BrainCircuit,
  FileText,
  Save,
  MessageSquare,
  Key,
  HelpCircle,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppView } from './Navbar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onSave: () => void;
  onOpenChat: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Actions' | 'AI Assistant';
  hotkey: string;
  icon: any;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSave,
  onOpenChat,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'commands' | 'cheatsheet'>('commands');

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modLabel = isMac ? '⌘' : 'Ctrl+';

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'nav-dashboard',
        title: 'Go to Dashboard',
        subtitle: 'Overview of all active datasets and projects',
        category: 'Navigation',
        hotkey: `${modLabel}D`,
        icon: BarChart3,
        action: () => {
          onNavigate('dashboard');
          onClose();
        },
      },
      {
        id: 'nav-upload',
        title: 'Upload Dataset',
        subtitle: 'Ingest CSV or Excel spreadsheets locally',
        category: 'Navigation',
        hotkey: `${modLabel}U`,
        icon: Upload,
        action: () => {
          onNavigate('upload');
          onClose();
        },
      },
      {
        id: 'nav-templates',
        title: 'Browse Project Templates',
        subtitle: 'Ready-to-use executive templates: Marketing ROI, Financial Review, Sales Tracker',
        category: 'Navigation',
        hotkey: 'Alt+T',
        icon: Sparkles,
        action: () => {
          onNavigate('templates');
          onClose();
        },
      },
      {
        id: 'nav-explorer',
        title: 'Open Data Explorer',
        subtitle: 'View paginated raw records and column statistics',
        category: 'Navigation',
        hotkey: `${modLabel}E`,
        icon: Database,
        action: () => {
          onNavigate('explorer');
          onClose();
        },
      },
      {
        id: 'nav-cleaning',
        title: 'Open Cleaning Studio',
        subtitle: 'Deduplicate, trim strings, impute missing values, filter outliers',
        category: 'Navigation',
        hotkey: 'Alt+C',
        icon: Wand2,
        action: () => {
          onNavigate('cleaning');
          onClose();
        },
      },
      {
        id: 'nav-analytics',
        title: 'Open Analytics Studio',
        subtitle: 'Descriptive stats, Pearson correlation, and business KPIs',
        category: 'Navigation',
        hotkey: 'Alt+A',
        icon: BarChart3,
        action: () => {
          onNavigate('analytics');
          onClose();
        },
      },
      {
        id: 'nav-charts',
        title: 'Open Visualization Studio',
        subtitle: 'Build interactive Recharts bar, line, area, and pie charts',
        category: 'Navigation',
        hotkey: 'Alt+V',
        icon: PieChart,
        action: () => {
          onNavigate('visualizations');
          onClose();
        },
      },
      {
        id: 'nav-insights',
        title: 'Open AI Insights Studio',
        subtitle: 'Synthesize executive summaries with Gemini 3.8 Flash',
        category: 'Navigation',
        hotkey: 'Alt+I',
        icon: BrainCircuit,
        action: () => {
          onNavigate('ai-insights');
          onClose();
        },
      },
      {
        id: 'nav-reports',
        title: 'Open Report Builder',
        subtitle: 'Configure branding and export multi-page vector PDF',
        category: 'Navigation',
        hotkey: 'Alt+R',
        icon: FileText,
        action: () => {
          onNavigate('report-builder');
          onClose();
        },
      },
      {
        id: 'act-save',
        title: 'Save Project & Download Report',
        subtitle: 'Persist project configuration and trigger PDF export',
        category: 'Actions',
        hotkey: `${modLabel}S`,
        icon: Save,
        action: () => {
          onSave();
          onClose();
        },
      },
      {
        id: 'act-chat',
        title: 'Ask Gemini AI Analyst',
        subtitle: 'Multi-turn conversation with grounding in your dataset',
        category: 'AI Assistant',
        hotkey: `${modLabel}J`,
        icon: MessageSquare,
        action: () => {
          onOpenChat();
          onClose();
        },
      },
      {
        id: 'act-export-zip',
        title: 'Export Full Codebase (ZIP)',
        subtitle: 'Download complete source code archive (.zip) of the project',
        category: 'Actions',
        hotkey: 'ZIP',
        icon: FileText,
        action: () => {
          window.location.href = '/api/export-zip';
          onClose();
        },
      },
    ],
    [modLabel, onNavigate, onSave, onOpenChat, onClose]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.hotkey.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation in palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to studio... (or press Esc to close)"
            className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Quick Actions vs Shortcuts Cheat Sheet */}
        <div className="flex border-b border-slate-100 px-4 text-xs font-semibold bg-slate-50/50">
          <button
            onClick={() => setActiveTab('commands')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'commands'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Command Actions ({filtered.length})
          </button>
          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'cheatsheet'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Hotkeys Cheat Sheet
          </button>
        </div>

        {activeTab === 'commands' ? (
          /* Commands list */
          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 italic">
                No matching actions found for "{query}"
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-sky-50/80 text-sky-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                        {item.hotkey}
                      </span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-sky-500' : 'text-slate-300'}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          /* Hotkeys Reference Cheat Sheet */
          <div className="p-5 max-h-96 overflow-y-auto space-y-5 text-xs">
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2 text-sky-700">
                Core Navigation
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Dashboard</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    {modLabel}D
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Upload Dataset</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    {modLabel}U
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Data Explorer</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    {modLabel}E
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Cleaning Studio</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    Alt+C
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Analytics Studio</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    Alt+A
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Visualization Studio</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    Alt+V
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Report Builder</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    Alt+R
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">AI Insights</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    Alt+I
                  </kbd>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider mb-2 text-indigo-700">
                AI & Fast Actions
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Toggle Gemini AI Analyst</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    {modLabel}J
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Save Project / Export PDF</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    {modLabel}S
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Undo Data Cleaning</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    {modLabel}Z
                  </kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-700 font-medium">Redo Data Cleaning</span>
                  <kbd className="px-2 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px] font-bold">
                    {modLabel}Y
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer tip */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="font-medium text-slate-600">ClientReport AI Power Tools</span>
        </div>
      </div>
    </div>
  );
};
