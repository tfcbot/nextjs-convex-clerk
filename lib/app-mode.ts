/**
 * App Mode Detection
 * 
 * Detects whether the app is running in:
 * - DEMO mode (vibe platform preview, no auth)
 * - AUTHENTICATED mode (production, with Clerk)
 */

export type AppMode = 'demo' | 'authenticated';

/**
 * Determine current app mode based on environment
 */
export function getAppMode(): AppMode {
  // Demo mode is default for vibe platforms
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return 'demo';
  }

  // If Clerk keys are configured, use authenticated mode
  if (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  ) {
    return 'authenticated';
  }

  // Fallback to demo mode (safe default)
  return 'demo';
}

// Singleton for app mode
export const appMode = getAppMode();

/**
 * Check if running in demo mode
 */
export function isDemo(): boolean {
  return appMode === 'demo';
}

/**
 * Check if running in authenticated mode
 */
export function isAuthenticated(): boolean {
  return appMode === 'authenticated';
}

/**
 * Features available by mode
 */
export const modeFeatures = {
  demo: {
    // Demo mode features
    canPreview: true,
    canSeeAllFeatures: true,
    canModifyData: true,
    canDeleteData: true,
    persistenceType: 'ephemeral', // Cleared on refresh
    requiresAuth: false,
    requiresBackend: false,
  },
  authenticated: {
    // Production mode features
    canPreview: true,
    canSeeAllFeatures: true,
    canModifyData: true,
    canDeleteData: true,
    persistenceType: 'persistent', // Saved to database
    requiresAuth: true,
    requiresBackend: true,
  },
} as const;

/**
 * Get feature flags for current mode
 */
export function getFeatureFlags() {
  return modeFeatures[appMode];
}

/**
 * Check if a specific feature is available
 */
export function isFeatureAvailable(
  feature: keyof typeof modeFeatures.demo
): boolean {
  return modeFeatures[appMode][feature] ?? false;
}

/**
 * User messaging for mode
 */
export const modeMessages = {
  demo: {
    banner: '🎨 Demo Mode - Preview all features',
    subtitle: 'Changes are not saved. Deploy to save your work.',
    actionPrompt: 'Ready to deploy? Export your app.',
  },
  authenticated: {
    banner: '🚀 Production Mode - Your data is saved',
    subtitle: 'All changes persist to your database.',
    actionPrompt: 'Sign in to access your data.',
  },
} as const;

/**
 * Get appropriate message for current mode
 */
export function getModeMessage(messageKey: keyof typeof modeMessages.demo) {
  return modeMessages[appMode][messageKey];
}
