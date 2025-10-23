/**
 * Micro-App Authentication & Utilities
 * 
 * Functions to help @nextjs-convex-clerk/ work as embedded micro-apps
 * within @flowslash/ while sharing Clerk authentication
 */

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

/**
 * Detects if app is running as a micro-app within @flowslash
 */
export function isMicroAppContext(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if running in iframe
  const inIframe = window.parent !== window;
  
  // Check environment flag
  const isMicroApp = process.env.NEXT_PUBLIC_MICRO_APP === 'true';
  
  return inIframe || isMicroApp;
}

/**
 * Hook to detect if micro-app is embedded and handle context sharing
 */
export function useMicroAppContext() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [isMicroApp, setIsMicroApp] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsMicroApp(isMicroAppContext());
  }, []);

  return {
    isMicroApp,
    isAuthenticated: isLoaded && isSignedIn,
    user,
    getToken,
  };
}

/**
 * Get micro-app navigation URL
 * Handles both same-domain and cross-domain setups
 */
export function getMicroAppUrl(appName: string, route: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_MICRO_APP_BASE_URL || '/apps';
  return `${baseUrl}/${appName}${route}`;
}

/**
 * Navigate to another micro-app or main app
 */
export function navigateToApp(appName: string | 'main', route: string = ''): void {
  if (appName === 'main') {
    window.location.href = '/';
  } else {
    window.location.href = getMicroAppUrl(appName, route);
  }
}

/**
 * Compose micro-app layout with proper Clerk & Convex providers
 * Use this to ensure micro-apps have all necessary context
 */
export function createMicroAppProviders(
  children: React.ReactNode,
  options?: {
    appName?: string;
    layout?: 'sidebar' | 'fullscreen';
  }
) {
  return {
    providers: [
      'ClerkProvider', // Inherited from @flowslash
      'ConvexProviderWithClerk', // Shared backend
    ],
    context: {
      isMicroApp: true,
      appName: options?.appName,
      layout: options?.layout || 'sidebar',
    },
    children,
  };
}

/**
 * Helper to get user ID from Clerk for Convex queries
 */
export async function getUserIdentityForConvex(getToken: () => Promise<string | null>) {
  const token = await getToken({ template: 'convex' });
  if (!token) throw new Error('No authentication token');
  return token;
}

/**
 * Format micro-app breadcrumb trail for navigation
 */
export function createBreadcrumbs(
  appName: string,
  path: string[]
): { label: string; href: string }[] {
  const breadcrumbs: { label: string; href: string }[] = [
    { label: 'Home', href: '/' },
    { 
      label: appName.charAt(0).toUpperCase() + appName.slice(1),
      href: getMicroAppUrl(appName),
    },
  ];

  let currentPath = '';
  path.forEach((segment, index) => {
    currentPath += `/${segment}`;
    if (index < path.length - 1) {
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: getMicroAppUrl(appName, currentPath),
      });
    }
  });

  return breadcrumbs;
}

/**
 * Micro-app specific error handler
 * Differentiates between auth errors and data errors
 */
export function handleMicroAppError(error: Error): {
  type: 'auth' | 'data' | 'unknown';
  message: string;
  shouldRedirect: boolean;
} {
  const message = error.message.toLowerCase();

  if (
    message.includes('unauthorized') ||
    message.includes('not authenticated') ||
    message.includes('forbidden')
  ) {
    return {
      type: 'auth',
      message: 'You need to be signed in to access this app',
      shouldRedirect: true,
    };
  }

  if (
    message.includes('not found') ||
    message.includes('does not exist')
  ) {
    return {
      type: 'data',
      message: 'The resource you requested was not found',
      shouldRedirect: false,
    };
  }

  return {
    type: 'unknown',
    message: error.message,
    shouldRedirect: false,
  };
}

/**
 * Micro-app loading state indicator
 * Shows while waiting for auth & Convex to load
 */
export function MicroAppLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" />
        <p className="text-gray-600">Loading app...</p>
      </div>
    </div>
  );
}

/**
 * Track micro-app events for analytics
 */
export function trackMicroAppEvent(
  appName: string,
  eventName: string,
  data?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  // Send to analytics service (e.g., Segment, Mixpanel, etc.)
  if ((window as any).analytics) {
    (window as any).analytics.track(`micro_app_${eventName}`, {
      app: appName,
      ...data,
    });
  }
}
