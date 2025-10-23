'use client';

/**
 * Detects if the app is running inside an iframe
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  return window.parent !== window;
}

/**
 * Detects if the current window is a popup window
 */
export function isPopupWindow(): boolean {
  if (typeof window === 'undefined') return false;
  return window.opener !== null;
}

/**
 * Detects if app should use mock mode (iframe or explicit env var)
 * Now considers popup OAuth flows
 */
export function shouldUseMockMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for explicit mock mode environment variable
  if (process.env.NEXT_PUBLIC_MOCK_AUTH === 'true') {
    return true;
  }
  
  // Don't use mock mode if this is a popup window (for OAuth)
  if (isPopupWindow()) {
    return false;
  }
  
  // Auto-detect iframe context for demo purposes
  return isInIframe();
}

/**
 * Detects if the app is in a cross-origin iframe context
 */
export function isCrossOriginIframe(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    // Try to access parent window location
    // This will throw if cross-origin
    const parentLocation = window.parent.location.href;
    return false; // Same origin
  } catch (e) {
    // Cross-origin access blocked
    return isInIframe();
  }
}

/**
 * Checks if we should force popup OAuth due to iframe restrictions
 */
export function shouldUsePopupOAuth(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Always use popup in iframe contexts to avoid same-site issues
  if (isInIframe()) {
    return true;
  }
  
  // Check if we're in a restrictive context (e.g., embedded widget)
  if (isCrossOriginIframe()) {
    return true;
  }
  
  return false;
}
