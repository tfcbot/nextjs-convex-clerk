'use client';

import { ReactNode } from 'react';
import { isDemo } from '@/lib/app-mode';
import { ClerkProvider } from '@clerk/nextjs';
import { MockUserProvider } from '@/lib/mock-user-provider';
import { getAuthConfig } from '@/lib/auth-config';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

/**
 * Demo Mode: Returns children without ClerkProvider
 * This prevents JWT issuer redirects and infinite loops in sandboxes
 * 
 * Production Mode: Wraps with ClerkProvider for real authentication
 */
export default function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  // CRITICAL: In demo mode, don't initialize Clerk at all
  // This prevents the JWT issuer redirect loop that breaks sandboxes
  if (isDemo()) {
    return (
      <MockUserProvider>
        {children}
      </MockUserProvider>
    );
  }

  // Production mode: require Clerk keys and use real authentication
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error(
      'Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY. ' +
      'In production mode, you must set Clerk credentials in .env.local'
    );
  }

  const authConfig = getAuthConfig();

  // Only wrap with ClerkProvider in production
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      dynamic={true}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      appearance={authConfig.appearance}
    >
      <MockUserProvider>
        {children}
      </MockUserProvider>
    </ClerkProvider>
  );
}
