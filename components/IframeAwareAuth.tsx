'use client';

import { ReactNode } from 'react';
import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { isInIframe, usePopupAuth } from '@/lib/popup-auth';

interface IframeAwareAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Authentication component that handles both standard and iframe scenarios
 * Uses popup OAuth flow when running inside an iframe
 */
export function IframeAwareAuth({ children, fallback }: IframeAwareAuthProps) {
  if (isInIframe()) {
    return <IframeAuthContent>{children}</IframeAuthContent>;
  }

  // Standard authentication flow for non-iframe scenarios
  return (
    <>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>{fallback || <StandardSignInForm />}</Unauthenticated>
    </>
  );
}

/**
 * Authentication content for iframe scenarios using popup flow
 */
function IframeAuthContent({ children }: { children: ReactNode }) {
  // For iframe scenarios, we need custom auth state management
  // This is a simplified version - in production you'd want more sophisticated state tracking
  return (
    <div>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>
        <IframeSignInForm />
      </Unauthenticated>
    </div>
  );
}

/**
 * Sign-in form for iframe scenarios (popup flow)
 */
function IframeSignInForm() {
  const auth = usePopupAuth();

  const handleSignIn = async () => {
    try {
      await auth.signIn();
    } catch (error) {
      console.error('Sign-in failed:', error);
      // You might want to show an error message to the user
    }
  };

  return (
    <div className="flex flex-col gap-4 w-96 mx-auto p-6 border rounded-lg bg-white shadow-sm">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Sign In Required</h2>
        <p className="text-gray-600 text-sm mb-4">
          This app is running in an iframe. Click below to sign in securely via popup.
        </p>
      </div>
      
      <button
        onClick={handleSignIn}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Sign In (Popup)
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        A new window will open for secure authentication
      </p>
    </div>
  );
}

/**
 * Standard sign-in form for non-iframe scenarios
 */
function StandardSignInForm() {
  return (
    <div className="flex flex-col gap-4 w-96 mx-auto">
      <p>Log in to see the content</p>
      <SignInButton mode="modal">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">
          Sign In
        </button>
      </SignInButton>
      <SignUpButton mode="modal">
        <button className="bg-foreground text-background px-4 py-2 rounded-md">
          Sign Up
        </button>
      </SignUpButton>
    </div>
  );
}

/**
 * Context indicator showing whether app is running in iframe or not
 */
export function AuthContextIndicator() {
  const inIframe = isInIframe();
  
  if (typeof window === 'undefined') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-100 px-3 py-1 rounded-md text-xs text-gray-600">
      {inIframe ? '🖼️ Iframe Mode (Popup Auth)' : '🌐 Standard Mode'}
    </div>
  );
}
