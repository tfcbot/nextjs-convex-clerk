'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { MockUserProvider } from '@/lib/mock-user-provider';

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

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      dynamic={true}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      appearance={{
        variables: {
          colorPrimary: '#2563eb', // Blue theme
        },
        elements: {
          // Optimize for clean display
          card: 'shadow-lg border border-gray-200',
          headerTitle: 'text-xl font-semibold',
          headerSubtitle: 'text-sm text-gray-600',
        }
      }}
    >
      <MockUserProvider>
        {children}
      </MockUserProvider>
    </ClerkProvider>
  );
}
