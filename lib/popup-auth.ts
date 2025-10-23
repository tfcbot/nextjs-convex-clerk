'use client';

export interface PopupAuthState {
  isSignedIn: () => boolean;
  getToken: () => Promise<string | null>;
  getUserId: () => string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Detects if the app is running inside an iframe
 */
export function isInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  return window.parent !== window;
}

/**
 * Popup OAuth utilities for iframe authentication
 * Based on industry-standard patterns used by Replit, CodeSandbox, and Vercel
 */
export class PopupAuthManager {
  private authReadyTimeout = 5 * 60 * 1000; // 5 minutes
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && isInIframe()) {
      this.setupMessageListener();
    }
  }

  /**
   * Request sign-in from parent window (popup OAuth flow)
   */
  async signIn(): Promise<void> {
    if (!isInIframe()) {
      // Not in iframe, redirect to sign-in page
      window.location.href = '/sign-in';
      return;
    }

    return new Promise((resolve, reject) => {
      // Send sign-in request to parent
      window.parent.postMessage({
        type: 'clerk:signin-request',
        timestamp: Date.now(),
      }, '*');

      // Wait for auth:ready message
      const timeout = setTimeout(() => {
        reject(new Error('Auth timeout - user may have cancelled sign-in'));
      }, this.authReadyTimeout);

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'clerk:auth-ready') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          // Reload iframe to pick up new auth state
          window.location.reload();
          resolve();
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }

  /**
   * Request sign-out from parent window
   */
  async signOut(): Promise<void> {
    if (!isInIframe()) {
      // Not in iframe, redirect to sign out
      window.location.href = '/api/auth/signout';
      return;
    }

    return new Promise((resolve) => {
      // Send sign-out request to parent
      window.parent.postMessage({
        type: 'clerk:signout-request',
        timestamp: Date.now(),
      }, '*');

      // Wait a moment then reload
      setTimeout(() => {
        window.location.reload();
        resolve();
      }, 1000);
    });
  }

  /**
   * Get authentication token from parent window
   */
  async getToken(): Promise<string | null> {
    if (!isInIframe()) {
      // Not in iframe, make API call to get token
      try {
        const response = await fetch('/api/auth/token');
        if (response.ok) {
          const data = await response.json();
          return data.token || null;
        }
      } catch (error) {
        console.error('Failed to get token:', error);
      }
      return null;
    }

    return new Promise((resolve) => {
      // Request token from parent
      window.parent.postMessage({
        type: 'clerk:token-request',
        timestamp: Date.now(),
      }, '*');

      const timeout = setTimeout(() => {
        resolve(null);
      }, 5000);

      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'clerk:token-response') {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          resolve(event.data.token || null);
        }
      };

      window.addEventListener('message', handleMessage);
    });
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    if (typeof window === 'undefined') return false;

    if (!isInIframe()) {
      // Not in iframe, check local auth state
      // This would need to be integrated with actual Clerk state
      return false;
    }

    // In iframe, request auth state from parent
    // For now, return optimistic state - in real implementation,
    // this would be synchronized with parent window
    return false;
  }

  /**
   * Get current user ID
   */
  getUserId(): string | null {
    // Implementation depends on how user ID is stored/retrieved
    return null;
  }

  /**
   * Setup message listener for iframe communication
   */
  private setupMessageListener(): void {
    window.addEventListener('message', (event) => {
      // Only accept messages from parent window
      if (event.source !== window.parent) return;

      switch (event.data?.type) {
        case 'clerk:auth-state-changed':
          // Notify listeners of auth state change
          this.listeners.forEach(listener => listener());
          break;
        case 'clerk:auth-ready':
          // Auth is ready after sign-in
          break;
      }
    });
  }

  /**
   * Add listener for auth state changes
   */
  onAuthStateChange(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

/**
 * Global instance for iframe authentication
 */
export const popupAuthManager = new PopupAuthManager();

/**
 * Hook-like interface for iframe authentication
 * Use this in React components running inside iframes
 */
export function usePopupAuth(): PopupAuthState {
  return {
    isSignedIn: () => popupAuthManager.isSignedIn(),
    getToken: () => popupAuthManager.getToken(),
    getUserId: () => popupAuthManager.getUserId(),
    signIn: () => popupAuthManager.signIn(),
    signOut: () => popupAuthManager.signOut(),
  };
}

/**
 * Utility to setup parent window auth message handlers
 * Call this in the parent window that contains iframes
 */
export function setupParentAuthHandlers() {
  if (typeof window === 'undefined') return;

  window.addEventListener('message', async (event) => {
    // Verify origin in production
    // if (event.origin !== 'https://your-trusted-domain.com') return;

    switch (event.data?.type) {
      case 'clerk:signin-request':
        // Handle sign-in request from iframe
        try {
          // Redirect to sign-in page
          window.location.href = '/sign-in';
        } catch (error) {
          console.error('Failed to handle signin request:', error);
        }
        break;

      case 'clerk:signout-request':
        // Handle sign-out request from iframe
        try {
          // Redirect to sign out API endpoint
          window.location.href = '/api/auth/signout';
          
          // Notify iframe that sign-out is complete
          setTimeout(() => {
            if (event.source && 'postMessage' in event.source) {
              (event.source as Window).postMessage({
                type: 'clerk:auth-ready',
                timestamp: Date.now(),
              }, '*');
            }
          }, 1000);
        } catch (error) {
          console.error('Failed to handle signout request:', error);
        }
        break;

      case 'clerk:token-request':
        // Handle token request from iframe
        try {
          const response = await fetch('/api/auth/token');
          let token = null;
          if (response.ok) {
            const data = await response.json();
            token = data.token;
          }
          
          if (event.source && 'postMessage' in event.source) {
            (event.source as Window).postMessage({
              type: 'clerk:token-response',
              token,
              timestamp: Date.now(),
            }, '*');
          }
        } catch (error) {
          console.error('Failed to handle token request:', error);
        }
        break;
    }
  });
}
