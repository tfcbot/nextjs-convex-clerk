'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { MockUserProvider } from '@/lib/mock-user-provider';
import { getAuthConfig } from '@/lib/auth-config';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

/**
 * Enhanced Clerk provider with targeted user data mocking for iframe contexts
 * Preserves real Clerk functionality while providing demo user data when needed
 */
export default function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  const authConfig = getAuthConfig();

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
