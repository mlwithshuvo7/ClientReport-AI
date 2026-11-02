import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Lock,
  User,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Building,
  Key,
  HardDrive,
} from 'lucide-react';
import { UserProfile, LicenseInfo } from '../types';

interface SettingsStudioProps {
  user: UserProfile;
  license: LicenseInfo | null;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onClearAllLocalData: () => void;
  onDeleteAccount: () => void;
}

export const SettingsStudio: React.FC<SettingsStudioProps> = ({
  user,
  license,
  onUpdateProfile,
  onClearAllLocalData,
  onDeleteAccount,
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [company, setCompany] = useState(user.company);
  const [role, setRole] = useState(user.role);
  const [enableCloudAi, setEnableCloudAi] = useState(true);
  const [autoPurgeOnClose, setAutoPurgeOnClose] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ fullName, company, role });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Settings & Data Privacy</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure analyst profile information, zero-cloud data policies, and workspace retention.
        </p>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Settings successfully saved.
        </div>
      )}

      {/* User Profile Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-4 h-4 text-sky-500" />
          Analyst Profile & Firm Details
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Firm / Organization</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Professional Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Update Profile
          </button>
        </form>
      </div>

      {/* Privacy & Governance Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Zero-Cloud Data Governance & AI Controls
        </h3>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">External AI Insights (Gemini 3.8 Flash)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When enabled, high-level aggregate KPI summaries are sent to Gemini. Raw customer spreadsheet rows are
                never transmitted. When disabled, ClientReport AI uses only deterministic offline rule engines.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={enableCloudAi}
                onChange={(e) => setEnableCloudAi(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Automatic In-Memory Buffer Purge</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Instantly clear temporary spreadsheet row caches from browser storage when the current browser session
                terminates.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={autoPurgeOnClose}
                onChange={(e) => setAutoPurgeOnClose(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Codebase Export Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-sky-500" />
              Export Full Codebase (ZIP)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Download the complete full-stack source code archive for deployment or local execution.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
            ZIP Archive
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">clientreport-ai-source.zip</p>
            <p className="text-[11px] text-slate-500">
              Includes all React frontend studios, Express server, Drizzle ORM schemas, Firebase Auth integration, and analytics engines.
            </p>
          </div>
          <a
            href="/api/export-zip"
            download="clientreport-ai-source.zip"
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Download ZIP Archive</span>
          </a>
        </div>
      </div>

      {/* Danger Zone: Cache Purge & Account Deletion */}
      <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-200 space-y-4">
        <h3 className="font-bold text-sm text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          Data Erasure & Account Termination
        </h3>
        <p className="text-xs text-slate-600">
          In compliance with GDPR and OWASP data retention principles, you can purge all local project configurations
          or permanently delete your account.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to purge all local cached projects and datasets?')) {
                onClearAllLocalData();
              }
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Purge Local Workspace Cache
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Delete Account Permanently
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="p-4 rounded-xl bg-white border border-rose-300 space-y-3">
            <p className="text-xs font-bold text-rose-900">
              Confirm Account Deletion: This will permanently remove your profile, projects, and active license ties.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onDeleteAccount}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
