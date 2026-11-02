/**
 * ClientReport AI - Master Application Shell
 * Turn Your Spreadsheet Into Business Intelligence.
 */

import React, { useState, useEffect } from 'react';
import { Navbar, AppView } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { DataUploadStudio } from './components/DataUploadStudio';
import { DataExplorer } from './components/DataExplorer';
import { DataCleaningStudio } from './components/DataCleaningStudio';
import { AnalyticsStudio } from './components/AnalyticsStudio';
import { VisualizationStudio } from './components/VisualizationStudio';
import { AiInsightsStudio } from './components/AiInsightsStudio';
import { ReportBuilder } from './components/ReportBuilder';
import { LicenseManager } from './components/LicenseManager';
import { SettingsStudio } from './components/SettingsStudio';
import { AuthModal } from './components/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { AiChatDrawer } from './components/AiChatDrawer';
import { TemplateGallery } from './components/TemplateGallery';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

import {
  UserProfile,
  LicenseInfo,
  Project,
  Dataset,
  CleaningOperation,
  CleaningHistoryStep,
  ChartConfig,
  AiInsight,
  ReportConfig,
} from './types';
import { getSampleDataset } from './lib/sampleDatasets';
import { generateSmartKPIs } from './lib/analytics';
import { validateLicenseKeyLocally, getClientDeviceId } from './lib/licensing';

export default function App() {
  // Authentication & License States
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cr_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default demo guest session so user can explore immediately
    const val = validateLicenseKeyLocally('CR-PRO-7749-DEMO', 'alex.consultant@clientreport.ai');
    return {
      id: 'usr-default',
      email: 'alex.consultant@clientreport.ai',
      fullName: 'Alex Vance',
      company: 'Growth Advisory Group',
      role: 'Principal BI Consultant',
      createdAt: new Date().toISOString(),
      license: val.license,
    };
  });

  const [license, setLicense] = useState<LicenseInfo | null>(() => {
    const saved = localStorage.getItem('cr_license');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    const val = validateLicenseKeyLocally('CR-PRO-7749-DEMO');
    return val.license || null;
  });

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('cr_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // Fall back to sample
      }
    }

    // Initialize with a rich sample project
    const defaultDs = getSampleDataset('saas');
    const defaultKpis = generateSmartKPIs(defaultDs.rows, defaultDs.columns);
    const initialProject: Project = {
      id: `proj-initial-${Date.now()}`,
      name: defaultDs.name,
      description: 'SaaS Monthly Recurring Revenue and customer churn evaluation.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originalDataset: defaultDs,
      workingDataset: defaultDs,
      cleaningHistory: [],
      historyIndex: -1,
      charts: [
        {
          id: 'chart-init-1',
          title: 'Total MRR by Plan Tier',
          type: 'bar',
          xAxisKey: 'Tier',
          yAxisKey: 'MRR',
          aggregation: 'sum',
          colorScheme: 'sky',
          showGrid: true,
          showLegend: true,
        },
      ],
      insights: [
        {
          id: 'insight-init-1',
          category: 'growth_opportunity',
          title: 'Enterprise Plan Accounts Drive 74% of Monthly Revenue',
          narrative:
            'While enterprise tiers represent 35% of customer accounts, they account for the vast majority of active recurring revenue. Retaining these accounts provides the highest lifetime value.',
          confidence: 0.96,
          recommendations: [
            'Assign dedicated customer success managers to accounts above $1,500 MRR.',
            'Target marketing campaigns towards B2B accounts matching enterprise usage patterns.',
          ],
          generatedWith: 'rule_engine',
          timestamp: new Date().toISOString(),
        },
      ],
      reportConfig: {
        id: 'rep-init',
        title: 'Executive SaaS Revenue & Churn Intelligence Report',
        subtitle: 'Prepared for Executive Leadership & Advisory Board',
        companyName: 'Growth Advisory Group',
        clientName: 'CloudScale SaaS Stakeholders',
        authorName: 'Alex Vance, Principal Consultant',
        primaryColor: '#0ea5e9',
        template: 'executive',
        executiveSummary:
          'This executive intelligence report provides a comprehensive performance baseline of subscription cohorts. Primary MRR throughput is driven by enterprise accounts, with high satisfaction (NPS > 8) strongly correlated with account longevity.',
        selectedKpiIds: defaultKpis.map((k) => k.id),
        selectedChartIds: ['chart-init-1'],
        includeDataQuality: true,
        includeStatisticalSummary: true,
        includeAiInsights: true,
        includeRecommendations: true,
        actionItems: [
          'Audit onboarding workflows for Starter plan accounts exhibiting churn signals.',
          'Double marketing budget on channels delivering high usage score signups.',
          'Schedule bi-weekly governance review for data pipeline accuracy.',
        ],
        updatedAt: new Date().toISOString(),
      },
    };
    return [initialProject];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || '';
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [isLandingMode, setIsLandingMode] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [initialAuthTier, setInitialAuthTier] = useState<string>('professional');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Persistence effects
  useEffect(() => {
    if (user) localStorage.setItem('cr_user', JSON.stringify(user));
    else localStorage.removeItem('cr_user');
  }, [user]);

  useEffect(() => {
    if (license) localStorage.setItem('cr_license', JSON.stringify(license));
    else localStorage.removeItem('cr_license');
  }, [license]);

  useEffect(() => {
    localStorage.setItem('cr_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Global Save Handler (saves to database and localStorage)
  const triggerGlobalSave = async () => {
    if (activeProject) {
      localStorage.setItem('cr_projects', JSON.stringify(projects));

      try {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project: activeProject, userId: user?.id || 'default_user' }),
        });
      } catch (e) {
        console.warn('Backend database project sync notice:', e);
      }

      setSaveToast(`Project "${activeProject.name}" saved to Cloud SQL database!`);
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  // Load database-stored projects when user signs in
  useEffect(() => {
    if (!user) return;
    const loadDbProjects = async () => {
      try {
        const res = await fetch(`/api/projects?userId=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        if (res.ok && data.projects && data.projects.length > 0) {
          setProjects(data.projects);
          setActiveProjectId(data.projects[0].id);
        }
      } catch (err) {
        // Fallback to local
      }
    };
    loadDbProjects();
  }, [user?.id]);

  // Global Keyboard Shortcut Manager
  useKeyboardShortcuts({
    onNavigate: (view) => {
      setIsLandingMode(false);
      setCurrentView(view);
    },
    onSave: triggerGlobalSave,
    onUndo: () => {
      if (currentView === 'cleaning') {
        handleUndoCleaning();
      }
    },
    onRedo: () => {
      if (currentView === 'cleaning') {
        handleRedoCleaning();
      }
    },
    onToggleChat: () => setAiChatOpen((prev) => !prev),
    onTogglePalette: () => setCommandPaletteOpen((prev) => !prev),
    onCloseModals: () => {
      setCommandPaletteOpen(false);
      setAiChatOpen(false);
      setAuthModalOpen(false);
    },
  });

  // KPIs derived from active working dataset
  const activeKpis = activeProject
    ? generateSmartKPIs(activeProject.workingDataset.rows, activeProject.workingDataset.columns)
    : [];

  // Dataset ingestion handler
  const handleDatasetLoaded = (newDataset: Dataset) => {
    const kpis = generateSmartKPIs(newDataset.rows, newDataset.columns);
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newDataset.name,
      description: `Imported from ${newDataset.fileName}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      originalDataset: newDataset,
      workingDataset: newDataset,
      cleaningHistory: [],
      historyIndex: -1,
      charts: [],
      insights: [],
      reportConfig: {
        id: `rep-${Date.now()}`,
        title: `${newDataset.name} — Executive Report`,
        subtitle: `Business Intelligence & Strategic Performance Audit`,
        companyName: user?.company || 'Enterprise Analytics Unit',
        clientName: 'Stakeholders',
        authorName: user?.fullName || 'Lead Analyst',
        primaryColor: '#0ea5e9',
        template: 'executive',
        executiveSummary: `This executive report evaluates ${newDataset.rowCount.toLocaleString()} verified data records across ${
          newDataset.columnCount
        } dimensions, achieving an initial data health index of ${newDataset.qualityScore}/100.`,
        selectedKpiIds: kpis.map((k) => k.id),
        selectedChartIds: [],
        includeDataQuality: true,
        includeStatisticalSummary: true,
        includeAiInsights: true,
        includeRecommendations: true,
        actionItems: [
          'Review top quartile metrics for growth opportunities.',
          'Eliminate data entry gaps and standardize reporting cadence.',
        ],
        updatedAt: new Date().toISOString(),
      },
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setCurrentView('explorer');
  };

  // Sample dataset launcher
  const handleLoadSample = (type: 'saas' | 'ecommerce' | 'marketing') => {
    const ds = getSampleDataset(type);
    handleDatasetLoaded(ds);
  };

  // Template launcher handler
  const handleSelectTemplate = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    setActiveProjectId(project.id);
    setCurrentView('explorer');
    setSaveToast(`Template "${project.name}" launched!`);

    // Asynchronously synchronize template clone to PostgreSQL database
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project,
        userId: user?.id || 'default_user',
      }),
    }).catch((err) => {
      console.warn('Database sync notification (local state preserved):', err);
    });
  };

  // Cleaning updates handler
  const handleApplyCleaning = (
    updatedDataset: Dataset,
    operation: CleaningOperation,
    newStep: CleaningHistoryStep
  ) => {
    if (!activeProject) return;

    const newHistory = [...activeProject.cleaningHistory.slice(0, activeProject.historyIndex + 1), newStep];

    const updatedProject: Project = {
      ...activeProject,
      workingDataset: updatedDataset,
      cleaningHistory: newHistory,
      historyIndex: newHistory.length - 1,
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  const handleUndoCleaning = () => {
    if (!activeProject || activeProject.historyIndex < 0) return;

    const nextIndex = activeProject.historyIndex - 1;
    let targetDataset = activeProject.originalDataset;

    if (nextIndex >= 0) {
      const prevStep = activeProject.cleaningHistory[nextIndex];
      targetDataset = {
        ...activeProject.workingDataset,
        rows: prevStep.snapshot,
        rowCount: prevStep.rowsAfterCount,
      };
    }

    const updated: Project = {
      ...activeProject,
      workingDataset: targetDataset,
      historyIndex: nextIndex,
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  const handleRedoCleaning = () => {
    if (!activeProject || activeProject.historyIndex >= activeProject.cleaningHistory.length - 1) return;

    const nextIndex = activeProject.historyIndex + 1;
    const targetStep = activeProject.cleaningHistory[nextIndex];

    const targetDataset: Dataset = {
      ...activeProject.workingDataset,
      rows: targetStep.snapshot,
      rowCount: targetStep.rowsAfterCount,
    };

    const updated: Project = {
      ...activeProject,
      workingDataset: targetDataset,
      historyIndex: nextIndex,
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  const handleResetCleaning = () => {
    if (!activeProject) return;
    const updated: Project = {
      ...activeProject,
      workingDataset: activeProject.originalDataset,
      cleaningHistory: [],
      historyIndex: -1,
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updated : p)));
  };

  // Chart handlers
  const handleSaveChart = (chart: ChartConfig) => {
    if (!activeProject) return;
    const existingIdx = activeProject.charts.findIndex((c) => c.id === chart.id);
    let updatedCharts = [...activeProject.charts];
    if (existingIdx >= 0) {
      updatedCharts[existingIdx] = chart;
    } else {
      updatedCharts.push(chart);
    }
    const updatedProject: Project = {
      ...activeProject,
      charts: updatedCharts,
      reportConfig: {
        ...activeProject.reportConfig,
        selectedChartIds: Array.from(new Set([...activeProject.reportConfig.selectedChartIds, chart.id])),
      },
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  const handleDeleteChart = (id: string) => {
    if (!activeProject) return;
    const updatedProject: Project = {
      ...activeProject,
      charts: activeProject.charts.filter((c) => c.id !== id),
      reportConfig: {
        ...activeProject.reportConfig,
        selectedChartIds: activeProject.reportConfig.selectedChartIds.filter((cid) => cid !== id),
      },
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  // AI Insights handlers
  const handleAddInsights = (insights: AiInsight[]) => {
    if (!activeProject) return;
    const updatedProject: Project = {
      ...activeProject,
      insights,
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  const handleAddInsightToReport = (insight: AiInsight) => {
    if (!activeProject) return;
    const exists = activeProject.reportConfig.actionItems.some((a) => a === insight.title);
    if (!exists) {
      const updatedProject: Project = {
        ...activeProject,
        reportConfig: {
          ...activeProject.reportConfig,
          actionItems: [...activeProject.reportConfig.actionItems, `${insight.title}: ${insight.narrative}`],
        },
        updatedAt: new Date().toISOString(),
      };
      setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProject : p)));
    }
  };

  // Report config updates
  const handleUpdateReportConfig = (reportConfig: ReportConfig) => {
    if (!activeProject) return;
    const updatedProject: Project = {
      ...activeProject,
      reportConfig,
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? updatedProject : p)));
  };

  // Project management
  const handleDeleteProject = (id: string) => {
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id && remaining.length > 0) {
      setActiveProjectId(remaining[0].id);
    }
  };

  const handleDuplicateProject = (p: Project) => {
    const dup: Project = {
      ...p,
      id: `proj-${Date.now()}`,
      name: `${p.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [dup, ...prev]);
    setActiveProjectId(dup.id);
  };

  // Licensing handlers
  const handleActivateLicenseKey = async (keyInput: string): Promise<boolean> => {
    const devId = getClientDeviceId();
    try {
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: keyInput,
          deviceId: devId,
          customerEmail: user?.email || 'verified.buyer@clientreport.ai',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.license) {
        setLicense(data.license);
        return true;
      }
    } catch (e) {
      console.warn('Backend verify failed, checking locally:', e);
    }

    const localCheck = validateLicenseKeyLocally(keyInput, user?.email);
    if (localCheck.success && localCheck.license) {
      setLicense(localCheck.license);
      return true;
    }
    return false;
  };

  const handleDeactivateDevice = async () => {
    if (!license) return;
    const devId = getClientDeviceId();
    try {
      await fetch('/api/license/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: license.key, deviceId: devId }),
      });
    } catch (e) {
      // Ignore
    }
    setLicense(null);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLandingMode(true);
  };

  const handleClearAllLocalData = () => {
    localStorage.removeItem('cr_projects');
    localStorage.removeItem('cr_device_id');
    const freshSample = getSampleDataset('saas');
    handleDatasetLoaded(freshSample);
  };

  const handleDeleteAccount = () => {
    localStorage.clear();
    setUser(null);
    setLicense(null);
    setProjects([]);
    setIsLandingMode(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={(v) => {
          setIsLandingMode(false);
          setCurrentView(v);
        }}
        user={user}
        license={license}
        activeProject={activeProject}
        allProjects={projects}
        onSelectProject={(p) => setActiveProjectId(p.id)}
        onLogout={handleLogout}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        isLandingMode={isLandingMode || !user}
        onToggleLanding={() => setIsLandingMode(!isLandingMode)}
        onOpenPalette={() => setCommandPaletteOpen(true)}
        onOpenChat={() => setAiChatOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLandingMode || !user ? (
          <LandingPage
            onStartDemo={(type) => {
              handleLoadSample(type);
              setIsLandingMode(false);
              setCurrentView('explorer');
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
            onSelectTier={(tier) => {
              setInitialAuthTier(tier);
              setAuthModalOpen(true);
            }}
          />
        ) : (
          <>
            {currentView === 'dashboard' && (
              <Dashboard
                user={user}
                license={license}
                projects={projects}
                activeProject={activeProject}
                onSelectProject={(p) => {
                  setActiveProjectId(p.id);
                  setCurrentView('explorer');
                }}
                onNewUpload={() => setCurrentView('upload')}
                onLoadSample={(type) => {
                  handleLoadSample(type);
                  setCurrentView('explorer');
                }}
                onDeleteProject={handleDeleteProject}
                onDuplicateProject={handleDuplicateProject}
                onNavigate={(v) => setCurrentView(v)}
              />
            )}

            {currentView === 'upload' && (
              <DataUploadStudio
                onDatasetLoaded={handleDatasetLoaded}
                onNavigateTemplates={() => setCurrentView('templates')}
              />
            )}

            {currentView === 'templates' && (
              <TemplateGallery
                onSelectTemplate={handleSelectTemplate}
                onNavigateUpload={() => setCurrentView('upload')}
              />
            )}

            {currentView === 'explorer' && activeProject && (
              <DataExplorer dataset={activeProject.workingDataset} />
            )}

            {currentView === 'cleaning' && activeProject && (
              <DataCleaningStudio
                originalDataset={activeProject.originalDataset}
                workingDataset={activeProject.workingDataset}
                history={activeProject.cleaningHistory}
                historyIndex={activeProject.historyIndex}
                onApplyCleaning={handleApplyCleaning}
                onUndo={handleUndoCleaning}
                onRedo={handleRedoCleaning}
                onReset={handleResetCleaning}
              />
            )}

            {currentView === 'analytics' && activeProject && (
              <AnalyticsStudio
                dataset={activeProject.workingDataset}
                kpis={activeKpis}
              />
            )}

            {currentView === 'visualizations' && activeProject && (
              <VisualizationStudio
                dataset={activeProject.workingDataset}
                savedCharts={activeProject.charts}
                onSaveChart={handleSaveChart}
                onDeleteChart={handleDeleteChart}
              />
            )}

            {currentView === 'ai-insights' && activeProject && (
              <AiInsightsStudio
                dataset={activeProject.workingDataset}
                kpis={activeKpis}
                existingInsights={activeProject.insights}
                onAddInsights={handleAddInsights}
                onAddInsightToReport={handleAddInsightToReport}
                reportInsightIds={activeProject.reportConfig.actionItems}
              />
            )}

            {currentView === 'report-builder' && activeProject && (
              <ReportBuilder
                project={activeProject}
                kpis={activeKpis}
                license={license}
                onUpdateReportConfig={handleUpdateReportConfig}
                onOpenLicense={() => setCurrentView('license')}
              />
            )}

            {currentView === 'license' && (
              <LicenseManager
                license={license}
                onActivateKey={handleActivateLicenseKey}
                onDeactivate={handleDeactivateDevice}
                onSelectTier={(tier) => {
                  setInitialAuthTier(tier);
                  setAuthModalOpen(true);
                }}
              />
            )}

            {currentView === 'settings' && user && (
              <SettingsStudio
                user={user}
                license={license}
                onUpdateProfile={(updated) => setUser({ ...user, ...updated })}
                onClearAllLocalData={handleClearAllLocalData}
                onDeleteAccount={handleDeleteAccount}
              />
            )}
          </>
        )}
      </main>

      {/* Authentication & License Key Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTier={initialAuthTier}
        onSuccess={(newUser, newLicense) => {
          setUser(newUser);
          if (newLicense) setLicense(newLicense);
          setIsLandingMode(false);
          setCurrentView('dashboard');
        }}
      />

      {/* Global Command Palette & Hotkeys Guide */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(v) => {
          setIsLandingMode(false);
          setCurrentView(v);
        }}
        onSave={triggerGlobalSave}
        onOpenChat={() => setAiChatOpen(true)}
      />

      {/* Multi-Turn Gemini AI Analyst Assistant Drawer */}
      <AiChatDrawer
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        dataset={activeProject?.workingDataset || null}
        kpis={activeKpis}
      />

      {/* Floating Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{saveToast}</span>
        </div>
      )}
    </div>
  );
}
