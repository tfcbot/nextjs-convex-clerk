'use client';

import { ReactNode, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { isInIframe, setupParentAuthHandlers } from '@/lib/popup-auth';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

/**
 * Enhanced Clerk provider with popup OAuth support for iframe authentication
 * Handles both standard web app scenarios and iframe/sandbox scenarios
 */
export default function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  useEffect(() => {
    // Setup parent auth handlers if not in iframe
    if (!isInIframe()) {
      setupParentAuthHandlers();
    }
  }, []);

  // Enhanced Clerk configuration with iframe optimization
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      dynamic={true}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      // Support popup flows for iframe authentication
      appearance={{
        variables: {
          colorPrimary: '#2563eb', // Blue theme
        },
        elements: {
          // Optimize for iframe display
          card: 'shadow-none border-0',
          headerTitle: 'text-lg font-semibold',
          headerSubtitle: 'text-sm text-gray-600',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}
