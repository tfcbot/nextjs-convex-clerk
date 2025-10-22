'use client';

import { ReactNode, useEffect } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { isInIframe, getClerkIframeConfig, getClerkNormalConfig, notifyParentOfAuthState } from '@/lib/iframe-utils';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

/**
 * Auth state notifier component - only renders inside Clerk context
 */
function AuthStateNotifier() {
  const { user } = useUser();
  
  useEffect(() => {
    if (isInIframe()) {
      notifyParentOfAuthState(user);
    }
  }, [user]);
  
  return null;
}

/**
 * Clerk provider that adapts its configuration based on iframe context
 */
export default function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  const inIframe = isInIframe();
  
  // Get appropriate configuration based on context
  const clerkConfig = inIframe ? getClerkIframeConfig() : getClerkNormalConfig();
  
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }
  
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      dynamic={true}
      {...clerkConfig}
    >
      {/* Notify parent of auth state changes when in iframe */}
      {inIframe && <AuthStateNotifier />}
      {children}
    </ClerkProvider>
  );
}
