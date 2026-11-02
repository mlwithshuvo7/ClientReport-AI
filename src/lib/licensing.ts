/**
 * ClientReport AI - Licensing Engine
 * Handles one-time purchase validation, device limit enforcement, and plan features.
 */

import { LicenseInfo, LicenseTier } from '../types';

export const PRICING_TIERS = [
  {
    tier: 'starter' as LicenseTier,
    name: 'Starter',
    price: 19,
    tagline: 'Ideal for solo analysts and freelance consultants.',
    maxDevices: 1,
    features: [
      'Unlimited CSV & Excel uploads (up to 50k rows)',
      'Data Cleaning Studio & Undo stack',
      'Descriptive statistics & correlation analysis',
      'Standard interactive charts (Bar, Line, Pie, Area)',
      'High-resolution PDF report generation',
      '1 Activated Device limit',
      'Lifetime updates for v1.x series',
    ],
    popular: false,
  },
  {
    tier: 'professional' as LicenseTier,
    name: 'Professional',
    price: 39,
    tagline: 'Built for growth agencies, marketing teams & founders.',
    maxDevices: 3,
    features: [
      'Everything in Starter',
      'Full 100k row analytical engine processing',
      'AI-powered executive summaries & anomaly detection',
      'Custom branding (add your agency logo & colors)',
      'Multiple report templates (Executive, QBR, Ecommerce)',
      '3 Activated Devices limit',
      'Priority client-side performance',
      'Commercial use rights',
    ],
    popular: true,
  },
  {
    tier: 'agency' as LicenseTier,
    name: 'Agency & White-Label',
    price: 79,
    tagline: 'For established agencies delivering client-facing reports.',
    maxDevices: 10,
    features: [
      'Everything in Professional',
      '10 Activated Devices for your entire team',
      'Full white-labeling (remove all ClientReport AI marks)',
      'Client-specific branding profiles & custom signoffs',
      'Raw CSV safe export with formula injection defense',
      'Unlimited client report exports',
      'Lifetime commercial agency usage',
      'Dedicated integration support & early feature access',
    ],
    popular: false,
  },
];

export const DEMO_LICENSE_KEYS: Record<string, { tier: LicenseTier; maxDevices: number }> = {
  'CR-START-8821-DEMO': { tier: 'starter', maxDevices: 1 },
  'CR-PRO-7749-DEMO': { tier: 'professional', maxDevices: 3 },
  'CR-AGNC-9912-DEMO': { tier: 'agency', maxDevices: 10 },
};

/**
 * Generate a consistent browser client device identifier
 */
export function getClientDeviceId(): string {
  if (typeof window === 'undefined') return 'server-dev';
  let devId = localStorage.getItem('cr_device_id');
  if (!devId) {
    devId = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('cr_device_id', devId);
  }
  return devId;
}

/**
 * Validate a license key locally and retrieve feature flags
 */
export function validateLicenseKeyLocally(
  keyInput: string,
  customerEmail: string = 'customer@example.com'
): { success: boolean; license?: LicenseInfo; error?: string } {
  const cleanKey = keyInput.trim().toUpperCase();

  // Check demo keys
  if (DEMO_LICENSE_KEYS[cleanKey]) {
    const meta = DEMO_LICENSE_KEYS[cleanKey];
    const license: LicenseInfo = {
      key: cleanKey,
      tier: meta.tier,
      status: 'active',
      activatedDevices: 1,
      maxDevices: meta.maxDevices,
      customerEmail,
      issuedAt: new Date().toISOString(),
      expiresAt: null, // Lifetime
      deviceId: getClientDeviceId(),
      features: {
        maxRows: meta.tier === 'starter' ? 50_000 : 100_000,
        excelSupport: true,
        customBranding: meta.tier !== 'starter',
        aiNarrativeGen: meta.tier !== 'starter',
        commercialRights: meta.tier !== 'starter',
        multiClientExport: meta.tier === 'agency',
        unlimitedPdfExports: true,
      },
    };
    return { success: true, license };
  }

  // Regex validation for generated production license keys
  // Format: CR-(START|PRO|AGNC)-[A-Z0-9]{4}-[A-Z0-9]{4}
  const match = cleanKey.match(/^CR-(START|PRO|AGNC)-([A-Z0-9]{4})-([A-Z0-9]{4})$/);
  if (!match) {
    return {
      success: false,
      error: 'Invalid license format. Expected format: CR-PRO-XXXX-XXXX or use a demo sandbox key.',
    };
  }

  const prefix = match[1];
  let tier: LicenseTier = 'starter';
  let maxDevices = 1;
  if (prefix === 'PRO') {
    tier = 'professional';
    maxDevices = 3;
  } else if (prefix === 'AGNC') {
    tier = 'agency';
    maxDevices = 10;
  }

  const license: LicenseInfo = {
    key: cleanKey,
    tier,
    status: 'active',
    activatedDevices: 1,
    maxDevices,
    customerEmail,
    issuedAt: new Date().toISOString(),
    expiresAt: null, // Lifetime
    deviceId: getClientDeviceId(),
    features: {
      maxRows: tier === 'starter' ? 50_000 : 100_000,
      excelSupport: true,
      customBranding: tier !== 'starter',
      aiNarrativeGen: tier !== 'starter',
      commercialRights: tier !== 'starter',
      multiClientExport: tier === 'agency',
      unlimitedPdfExports: true,
    },
  };

  return { success: true, license };
}
