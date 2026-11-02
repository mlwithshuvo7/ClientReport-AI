import React, { useState } from 'react';
import { X, Mail, Lock, User, Key, CheckCircle2, Shield, ArrowRight, Database } from 'lucide-react';
import { UserProfile, LicenseInfo } from '../types';
import { validateLicenseKeyLocally } from '../lib/licensing';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile, license?: LicenseInfo) => void;
  initialMode?: 'login' | 'register' | 'license';
  initialTier?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  initialTier,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'license'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [licenseKey, setLicenseKey] = useState(
    initialTier === 'agency'
      ? 'CR-AGNC-9912-DEMO'
      : initialTier === 'professional'
      ? 'CR-PRO-7749-DEMO'
      : 'CR-START-8821-DEMO'
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Sync user record to PostgreSQL database
  const syncToDatabase = async (userPayload: {
    uid: string;
    email: string;
    fullName: string;
    company: string;
    role: string;
  }) => {
    try {
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        return data.user;
      }
    } catch (e) {
      console.warn('Backend database sync notice:', e);
    }
    return userPayload;
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;

      let license: LicenseInfo | undefined = undefined;
      if (licenseKey.trim()) {
        const valRes = validateLicenseKeyLocally(licenseKey, firebaseUser.email || '');
        if (valRes.success && valRes.license) {
          license = valRes.license;
        }
      }

      // Sync account to PostgreSQL database
      const synced = await syncToDatabase({
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'analyst@clientreport.ai',
        fullName: firebaseUser.displayName || 'Google Analyst',
        company: company.trim() || 'Enterprise Analytics',
        role: 'Lead Business Analyst',
      });

      const profile: UserProfile = {
        id: synced.id || `usr-${firebaseUser.uid}`,
        email: synced.email,
        fullName: synced.fullName,
        company: synced.company,
        role: synced.role,
        createdAt: synced.createdAt || new Date().toISOString(),
        license,
      };

      onSuccess(profile, license);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-in Error:', err);
      setError(err?.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const userEmail = email.trim() || 'analyst@clientreport.ai';
    const userName = fullName.trim() || (email ? email.split('@')[0] : 'Data Analyst');
    const userUid = `usr-gen-${Math.random().toString(36).substring(2, 9)}`;

    let license: LicenseInfo | undefined = undefined;
    if (licenseKey.trim()) {
      const valRes = validateLicenseKeyLocally(licenseKey, userEmail);
      if (valRes.success && valRes.license) {
        license = valRes.license;
      } else if (mode === 'license') {
        setLoading(false);
        setError(valRes.error || 'Invalid license key.');
        return;
      }
    }

    // Sync account to database
    const synced = await syncToDatabase({
      uid: userUid,
      email: userEmail,
      fullName: userName,
      company: company.trim() || 'Analytics Studio',
      role: 'Lead Business Analyst',
    });

    const profile: UserProfile = {
      id: synced.id || userUid,
      email: synced.email,
      fullName: synced.fullName,
      company: synced.company,
      role: synced.role,
      createdAt: synced.createdAt || new Date().toISOString(),
      license,
    };

    setLoading(false);
    onSuccess(profile, license);
    onClose();
  };

  const handleInstantDemo = () => {
    const valRes = validateLicenseKeyLocally('CR-PRO-7749-DEMO', 'guest.analyst@clientreport.ai');
    const profile: UserProfile = {
      id: `usr-demo-${Date.now()}`,
      email: 'guest.analyst@clientreport.ai',
      fullName: 'Alex Vance',
      company: 'Growth Advisory Group',
      role: 'Principal Consultant',
      createdAt: new Date().toISOString(),
      license: valRes.license,
    };
    onSuccess(profile, valRes.license);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Activate Software License'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Database className="w-2.5 h-2.5" />
                Cloud SQL
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'license'
                ? 'Enter your one-time purchase license key'
                : 'Access your persistent database workspace'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-center transition-colors ${
              mode === 'login' ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-center transition-colors ${
              mode === 'register' ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => setMode('license')}
            className={`flex-1 py-2.5 text-center transition-colors ${
              mode === 'license' ? 'text-sky-600 border-b-2 border-sky-500 bg-sky-50/40' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            License Key
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Google Sign-in Provider Button */}
          {mode !== 'license' && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          )}

          {mode !== 'license' && (
            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[10px] text-slate-400 uppercase font-semibold">Or with email</span>
              <div className="grow border-t border-slate-200"></div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jordan Reed"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Analytics (Optional)"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@domain.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {mode !== 'license' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Software License Key{' '}
                <span className="text-slate-400 font-normal">
                  {mode === 'license' ? '(Required)' : '(Optional)'}
                </span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required={mode === 'license'}
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="CR-PRO-XXXX-XXXX"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {loading
                ? 'Connecting to Database...'
                : mode === 'login'
                ? 'Sign In & Load Workspace'
                : mode === 'register'
                ? 'Create Account in Database'
                : 'Activate License'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Quick Demo Access Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Want to test without signing up?</span>
          <button
            type="button"
            onClick={handleInstantDemo}
            className="text-[11px] font-bold text-sky-600 hover:text-sky-800 transition-colors"
          >
            1-Click Pro Guest Access →
          </button>
        </div>
      </div>
    </div>
  );
};
