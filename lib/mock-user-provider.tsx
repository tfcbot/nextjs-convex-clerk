'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { isInIframe } from './iframe-detection';

// Mock user data - only user information, not system-wide mocking
const MOCK_USER = {
  id: 'demo_user_123',
  firstName: 'Demo',
  lastName: 'User',
  fullName: 'Demo User',
  emailAddresses: [
    { 
      emailAddress: 'demo@example.com',
      id: 'email_123',
      verification: { status: 'verified' }
    }
  ],
  primaryEmailAddress: { 
    emailAddress: 'demo@example.com',
    id: 'email_123'
  },
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format&q=75',
  profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format&q=75',
  hasImage: true,
  username: null,
  phoneNumbers: [],
  web3Wallets: [],
  externalAccounts: [],
  samlAccounts: [],
  organizationMemberships: [],
  passwordEnabled: true,
  totpEnabled: false,
  twoFactorEnabled: false,
  backupCodeEnabled: false,
  publicMetadata: {},
  privateMetadata: {},
  unsafeMetadata: {},
  lastSignInAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  banned: false,
  locked: false,
};

const MOCK_SESSION = {
  id: 'sess_demo_123',
  user: MOCK_USER,
  lastActiveAt: new Date(),
  expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  abandonAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days  
  status: 'active' as const,
  actor: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Context for providing mock user data
interface MockUserContextType {
  mockUser: typeof MOCK_USER | null;
  mockSession: typeof MOCK_SESSION | null;
  isDemo: boolean;
}

const MockUserContext = createContext<MockUserContextType>({
  mockUser: null,
  mockSession: null,
  isDemo: false,
});

interface MockUserProviderProps {
  children: ReactNode;
}

/**
 * Provides mock user data in iframe contexts while preserving real Clerk functionality
 * Only overrides user data, not authentication flows or UI components
 */
export function MockUserProvider({ children }: MockUserProviderProps) {
  const isDemo = isInIframe();

  const contextValue: MockUserContextType = {
    mockUser: isDemo ? MOCK_USER : null,
    mockSession: isDemo ? MOCK_SESSION : null,
    isDemo,
  };

  return (
    <MockUserContext.Provider value={contextValue}>
      {children}
      {isDemo && <DemoModeIndicator />}
    </MockUserContext.Provider>
  );
}

/**
 * Hook that overrides useAuth with mock data in iframe contexts
 */
export function useMockAwareAuth() {
  const realAuth = useAuth();
  const { mockUser, mockSession, isDemo } = useContext(MockUserContext);

  if (!isDemo) {
    return realAuth;
  }

  // Override with mock data while preserving real auth methods
  return {
    ...realAuth,
    isSignedIn: true,
    isLoaded: true,
    user: mockUser,
    session: mockSession,
    actor: null,
    userId: mockUser?.id || null,
    sessionId: mockSession?.id || null,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    has: () => true, // Grant all permissions in demo mode
    // Preserve real methods for actual functionality
    signOut: realAuth.signOut,
    getToken: async () => `mock_jwt_token_${Date.now()}`,
  };
}

/**
 * Hook that overrides useUser with mock data in iframe contexts
 */
export function useMockAwareUser() {
  const realUser = useUser();
  const { mockUser, isDemo } = useContext(MockUserContext);

  if (!isDemo) {
    return realUser;
  }

  // Override with mock data
  return {
    isSignedIn: true,
    isLoaded: true,
    user: mockUser,
  };
}

/**
 * Visual indicator when app is running in demo mode
 */
function DemoModeIndicator() {
  return (
    <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-300 text-blue-800 px-3 py-2 rounded-lg shadow-lg text-xs font-medium z-50 max-w-sm">
      <div className="flex items-center space-x-2">
        <span className="text-base">🔍</span>
        <div>
          <div className="font-semibold">Demo Mode Active</div>
          <div className="text-blue-600">Real user data available at direct URL</div>
        </div>
      </div>
    </div>
  );
}
