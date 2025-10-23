'use client';

/**
 * Detects if the app is running inside an iframe
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  return window.parent !== window;
}

/**
 * Detects if app should use mock mode (iframe or explicit env var)
 */
export function shouldUseMockMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for explicit mock mode environment variable
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
    return true;
  }
  
  // Auto-detect iframe context
  return isInIframe();
}
