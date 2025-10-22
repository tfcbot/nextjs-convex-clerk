/**
 * Iframe detection and configuration utilities for Clerk authentication
 */

/**
 * Detects if the application is running inside an iframe
 * Works in both browser and server contexts
 */
export function isInIframe(): boolean {
  // Server-side detection via environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_IFRAME_MODE === 'true';
  }
  
  // Client-side detection
  try {
    return window.parent !== window;
  } catch (error) {
    // Access denied means we're in a cross-origin iframe
    return true;
  }
}

/**
 * Gets the parent origin for postMessage communication
 */
export function getParentOrigin(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_PARENT_ORIGIN || 'https://app.flowslash.dev';
  }
  
  try {
    return window.parent.location.origin;
  } catch (error) {
    // Fallback to environment variable for cross-origin iframes
    return process.env.NEXT_PUBLIC_PARENT_ORIGIN || 'https://app.flowslash.dev';
  }
}

/**
 * Gets Clerk configuration optimized for iframe usage
 */
export function getClerkIframeConfig() {
  return {
    // Use virtual routing to prevent page navigation
    appearance: {
      routing: 'virtual',
      elements: {
        modalContent: {
          width: '400px'
        }
      }
    },
    // Disable redirect URLs - use modals instead
    signInUrl: undefined,
    signUpUrl: undefined,
    afterSignInUrl: '/',
    afterSignUpUrl: '/',
    signInFallbackRedirectUrl: undefined,
    signUpFallbackRedirectUrl: undefined,
    // Enable iframe-friendly props
    iframeProps: {
      allowTransparency: true
    }
  };
}

/**
 * Gets Clerk configuration for normal (non-iframe) usage
 */
export function getClerkNormalConfig() {
  return {
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    afterSignInUrl: '/dashboard'
  };
}

/**
 * Sends authentication state to parent window
 */
export function notifyParentOfAuthState(user: any) {
  if (!isInIframe() || typeof window === 'undefined') {
    return;
  }
  
  try {
    const parentOrigin = getParentOrigin();
    window.parent.postMessage({
      type: 'SANDBOX_AUTH_STATE_CHANGED',
      user: user ? {
        id: user.id,
        email: user.emailAddresses?.[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
      } : null
    }, parentOrigin);
  } catch (error) {
    console.warn('Failed to notify parent of auth state:', error);
  }
}
