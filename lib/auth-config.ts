'use client';

import { shouldUsePopupOAuth, isInIframe } from './iframe-detection';

/**
 * Enhanced authentication configuration that optimizes for popup OAuth
 * and cross-origin iframe compatibility
 */
export interface AuthConfig {
  appearance: any;
  allowedOrigins?: string[];
}

/**
 * Gets the optimal auth configuration based on current context
 */
export function getAuthConfig(): AuthConfig {
  const shouldUsePopup = shouldUsePopupOAuth();
  const inIframe = isInIframe();
  
  const baseConfig: AuthConfig = {
    appearance: {
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorInputBackground: '#ffffff',
        borderRadius: '0.5rem',
        fontFamily: 'system-ui, sans-serif',
      },
      elements: {
        // Base modal styling
        modalContent: `z-[99999] fixed inset-0 flex items-center justify-center p-4 ${
          inIframe ? 'transform-gpu' : ''
        }`,
        modalBackdrop: 'z-[99998] fixed inset-0 bg-black bg-opacity-50',
        card: `relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 ${
          inIframe ? 'border-2 border-blue-500' : ''
        }`,
        
        // Form elements
        formButtonPrimary: `w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 ${
          shouldUsePopup ? 'shadow-lg' : ''
        }`,
        formFieldInput: 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        
        // OAuth buttons optimized for popup mode
        socialButtonsIconButton: 'w-full border border-gray-300 hover:bg-gray-50 rounded-lg p-3 transition-colors flex items-center justify-center space-x-2 focus:ring-2 focus:ring-blue-500 mb-2',
        
        // Container elements
        rootBox: 'relative w-full h-auto',
        cardBox: 'w-full max-w-none',
        
        // Headers
        headerTitle: 'text-xl font-semibold text-center mb-2',
        headerSubtitle: 'text-sm text-gray-600 text-center mb-4',
        
        // Footer
        footerAction: 'text-center mt-4',
        footerActionText: 'text-sm text-gray-600',
        footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
      }
    }
  };

  // Enhanced configuration for iframe contexts
  if (inIframe) {
    baseConfig.appearance.elements = {
      ...baseConfig.appearance.elements,
      // Ensure modals appear above iframe content
      modalContent: 'z-[99999] fixed inset-0 flex items-center justify-center p-4 transform-gpu',
      modalBackdrop: 'z-[99998] fixed inset-0 bg-black bg-opacity-60',
      card: 'relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-auto p-6 border-2 border-blue-500',
      // Add visual indicator for iframe mode
      headerTitle: 'text-xl font-semibold text-center mb-2 text-blue-600',
    };
  }

  // Additional configuration for popup OAuth
  if (shouldUsePopup) {
    baseConfig.appearance.elements = {
      ...baseConfig.appearance.elements,
      // Enhanced OAuth button styling for popups
      socialButtonsIconButton: 'w-full border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-lg p-4 transition-all duration-200 flex items-center justify-center space-x-3 focus:ring-2 focus:ring-blue-500 mb-3 shadow-sm hover:shadow-md',
      formButtonPrimary: 'w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    };
  }

  return baseConfig;
}

/**
 * Headers to set for better cross-origin compatibility
 */
export const CORS_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'Content-Security-Policy': "frame-ancestors 'self' *",
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
} as const;

/**
 * Cookie configuration for cross-site compatibility
 */
export const COOKIE_CONFIG = {
  secure: true,
  sameSite: 'none' as const,
  domain: undefined, // Let browser determine
  httpOnly: false, // Allow client-side access for OAuth flows
} as const;
