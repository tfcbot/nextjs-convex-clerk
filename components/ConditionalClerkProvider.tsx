'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

/**
 * Standard Clerk provider - simplified since we no longer use iframe context
 */
export default function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      dynamic={true}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
    >
      {children}
    </ClerkProvider>
  );
}
