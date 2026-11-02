import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { LicenseInfo } from '../types';
import { PRICING_TIERS, DEMO_LICENSE_KEYS, getClientDeviceId } from '../lib/licensing';

interface LicenseManagerProps {
  license: LicenseInfo | null;
  onActivateKey: (key: string) => Promise<boolean>;
  onDeactivate: () => void;
  onSelectTier: (tier: string) => void;
}

export const LicenseManager: React.FC<LicenseManagerProps> = ({
  license,
  onActivateKey,
  onDeactivate,
  onSelectTier,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const deviceId = getClientDeviceId();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;

    setLoading(true);
    setMsg(null);

    const success = await onActivateKey(keyInput.trim());
    setLoading(false);

    if (success) {
      setMsg({ type: 'success', text: 'Software license verified and activated successfully!' });
      setKeyInput('');
    } else {
      setMsg({ type: 'error', text: 'Invalid license key or activation limit reached.' });
    }
  };

  const handleQuickSandboxKey = async (demoKey: string) => {
    setKeyInput(demoKey);
    setLoading(true);
    setMsg(null);
    const success = await onActivateKey(demoKey);
    setLoading(false);
    if (success) {
      setMsg({ type: 'success', text: `Activated ${demoKey} in sandbox mode.` });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Software License & Devices</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your lifetime software license, device activations, and unlocked features.
        </p>
      </div>

      {/* Active License Overview Card */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active License Status</span>
              {license ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {license.tier} Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Unlicensed Trial
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-1">
              {license ? `${license.tier.toUpperCase()} Lifetime License` : 'Trial Mode'}
            </h3>
          </div>

          {license && (
            <button
              onClick={onDeactivate}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Deactivate This Device
            </button>
          )}
        </div>

        {license ? (
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Licensed Key</span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-1 select-all">{license.key}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Active Devices</span>
              <div className="flex items-center gap-2 mt-1">
                <Laptop className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-slate-800">
                  {license.activatedDevices} of {license.maxDevices} devices used
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">License Validity</span>
              <p className="text-xs font-bold text-emerald-600 mt-1">Lifetime Access (v1.x Series)</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Operating in Evaluation Mode</p>
              <p className="mt-0.5 text-amber-800">
                Activate a license key below or select one of the sandbox keys to unlock full agency capabilities and
                higher row limits.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* License Key Activation Form */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs space-y-6">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">Activate or Upgrade License</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter the 16-character license key sent to your email after checkout.
          </p>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleActivate} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="e.g. CR-PRO-7749-DEMO"
              className="w-full pl-10 pr-4 py-2.5 text-xs font-mono rounded-xl border border-slate-200 uppercase focus:outline-none focus:border-sky-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {loading ? 'Verifying...' : 'Activate License'}
          </button>
        </form>

        {/* Sandbox Test Keys Helper */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Instant Test Sandbox Keys (Click to test any tier)
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickSandboxKey('CR-START-8821-DEMO')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 text-xs font-mono font-semibold text-slate-700 transition-colors"
            >
              CR-START-8821-DEMO (Starter • $19)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSandboxKey('CR-PRO-7749-DEMO')}
              className="px-3 py-1.5 rounded-lg border border-emerald-200 hover:border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 text-xs font-mono font-semibold text-emerald-800 transition-colors"
            >
              CR-PRO-7749-DEMO (Pro • $39)
            </button>
            <button
              type="button"
              onClick={() => handleQuickSandboxKey('CR-AGNC-9912-DEMO')}
              className="px-3 py-1.5 rounded-lg border border-purple-200 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 text-xs font-mono font-semibold text-purple-800 transition-colors"
            >
              CR-AGNC-9912-DEMO (Agency • $79)
            </button>
          </div>
        </div>
      </div>

      {/* Lifetime Terms & Disclosures */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
        <h4 className="font-bold text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          License Terms & Customer Commitments
        </h4>
        <div className="grid sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div>
            <p className="font-bold text-white">What Lifetime Means:</p>
            <p className="mt-1">
              Your software license remains permanently active with no recurring monthly billing or software expiration.
            </p>
          </div>
          <div>
            <p className="font-bold text-white">Updates Included:</p>
            <p className="mt-1">
              Includes all bug fixes, security updates, and feature upgrades throughout the v1.x series.
            </p>
          </div>
          <div>
            <p className="font-bold text-white">Device Deactivations:</p>
            <p className="mt-1">
              Moving to a new laptop? Simply deactivate your previous device to immediately free up an activation slot.
            </p>
          </div>
          <div>
            <p className="font-bold text-white">Commercial Rights:</p>
            <p className="mt-1">
              Professional and Agency tiers grant full commercial rights to prepare and sell reports to third-party clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
