'use client';

import { useAuth } from '@clerk/nextjs';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { shouldUsePopupOAuth, isInIframe, isPopupWindow } from '@/lib/iframe-detection';
import { useEffect, useState } from 'react';

interface PopupAuthProps {
  mode?: 'signin' | 'signup';
  children?: React.ReactNode;
  className?: string;
  onSuccess?: () => void;
}

/**
 * Enhanced authentication component that ensures OAuth happens in popups
 * and handles cross-origin/iframe scenarios properly
 */
export default function PopupAuth({ 
  mode = 'signin', 
  children, 
  className = '',
  onSuccess 
}: PopupAuthProps) {
  const { isSignedIn } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const inIframe = isInIframe();
  const shouldUsePopup = shouldUsePopupOAuth();
  const isPopup = isPopupWindow();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isSignedIn && onSuccess) {
      onSuccess();
    }
  }, [isSignedIn, onSuccess]);

  // Don't render until client-side to avoid hydration issues
  if (!isClient) {
    return null;
  }

  // Enhanced modal configuration for iframe/popup scenarios
  const modalProps = {
    mode: 'modal' as const,
    appearance: {
      elements: {
        // Force modal to appear above iframe content with higher z-index
        modalContent: `z-[99999] fixed inset-0 flex items-center justify-center p-4 ${
          inIframe ? 'transform-gpu' : ''
        }`,
        modalBackdrop: 'z-[99998] fixed inset-0 bg-black bg-opacity-50',
        card: `relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6 ${
          inIframe ? 'border-2 border-blue-500' : ''
        }`,
        // Ensure OAuth providers work in popup mode
        socialButtonsIconButton: 'w-full border border-gray-300 hover:bg-gray-50 rounded-lg p-3 transition-colors flex items-center justify-center space-x-2 focus:ring-2 focus:ring-blue-500',
        // Override any positioning that might conflict with iframe
        rootBox: 'relative w-full h-auto',
        cardBox: 'w-full max-w-none',
        // Enhanced form styling for popup contexts
        formButtonPrimary: `w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 ${
          shouldUsePopup ? 'shadow-lg' : ''
        }`,
      },
      variables: {
        colorPrimary: '#2563eb',
        borderRadius: '0.5rem',
        fontFamily: 'system-ui, sans-serif',
      }
    },
    // Enhanced redirect handling for iframe/popup scenarios
    forceRedirectUrl: undefined, // Let Clerk handle popup flow
    fallbackRedirectUrl: '/',
    // Additional props for iframe contexts
    ...(shouldUsePopup && {
      redirectUrl: window.location.origin + '/',
      signInForceRedirectUrl: window.location.origin + '/',
      signUpForceRedirectUrl: window.location.origin + '/',
    }),
  };

  if (mode === 'signup') {
    return (
      <SignUpButton {...modalProps}>
        {children || (
          <button className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${className}`}>
            Sign Up
          </button>
        )}
      </SignUpButton>
    );
  }

  return (
    <SignInButton {...modalProps}>
      {children || (
        <button className={`px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium ${className}`}>
          Sign In
        </button>
      )}
    </SignInButton>
  );
}

/**
 * Combined auth component that shows both sign in and sign up options
 */
export function PopupAuthButtons({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <PopupAuth mode="signin" />
      <PopupAuth mode="signup" />
    </div>
  );
}
