'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { isInIframe } from './iframe-detection';

// Enhanced mock user data for rich demo experience
const DEMO_USERS = [
  {
    id: 'demo_user_123',
    firstName: 'Alex',
    lastName: 'Developer',
    fullName: 'Alex Developer',
    emailAddresses: [
      { 
        emailAddress: 'alex.developer@demo.com',
        id: 'email_123',
        verification: { status: 'verified' }
      }
    ],
    primaryEmailAddress: { 
      emailAddress: 'alex.developer@demo.com',
      id: 'email_123'
    },
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format&q=75',
    profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format&q=75',
    hasImage: true,
    username: 'alexdev',
    phoneNumbers: [],
    web3Wallets: [],
    externalAccounts: [],
    samlAccounts: [],
    organizationMemberships: [],
    passwordEnabled: true,
    totpEnabled: false,
    twoFactorEnabled: false,
    backupCodeEnabled: false,
    publicMetadata: { role: 'developer', plan: 'premium' },
    privateMetadata: {},
    unsafeMetadata: {},
    lastSignInAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
    updatedAt: new Date(),
    banned: false,
    locked: false,
  },
  {
    id: 'demo_user_456',
    firstName: 'Jordan',
    lastName: 'Designer',
    fullName: 'Jordan Designer',
    emailAddresses: [
      { 
        emailAddress: 'jordan.designer@demo.com',
        id: 'email_456',
        verification: { status: 'verified' }
      }
    ],
    primaryEmailAddress: { 
      emailAddress: 'jordan.designer@demo.com',
      id: 'email_456'
    },
    imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face&auto=format&q=75',
    profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face&auto=format&q=75',
    hasImage: true,
    username: 'jordanux',
    phoneNumbers: [],
    web3Wallets: [],
    externalAccounts: [],
    samlAccounts: [],
    organizationMemberships: [],
    passwordEnabled: true,
    totpEnabled: false,
    twoFactorEnabled: false,
    backupCodeEnabled: false,
    publicMetadata: { role: 'designer', plan: 'basic' },
    privateMetadata: {},
    unsafeMetadata: {},
    lastSignInAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60), // 60 days ago
    updatedAt: new Date(),
    banned: false,
    locked: false,
  }
];

// Select a random demo user for variety
const MOCK_USER = DEMO_USERS[Math.floor(Math.random() * DEMO_USERS.length)];

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
  // Don't even call useAuth in demo mode - prevents Clerk initialization
  const { isDemo } = useContext(MockUserContext);
  
  let realAuth = null;
  try {
    // Only try to get real auth in production mode
    if (!isDemo) {
      const { useAuth } = require('@clerk/nextjs');
      realAuth = useAuth();
    }
  } catch (e) {
    // useAuth not available (normal in demo mode)
  }

  const { mockUser, mockSession } = useContext(MockUserContext);

  if (isDemo || !realAuth) {
    // Override with mock data - no Clerk calls
    return {
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
      signOut: async () => {}, // No-op in demo
      getToken: async () => `mock_jwt_token_${Date.now()}`, // Mock token
    };
  }

  // Production mode - use real auth
  return {
    ...realAuth,
  };
}

/**
 * Hook that overrides useUser with mock data in demo contexts
 */
export function useMockAwareUser() {
  const { isDemo } = useContext(MockUserContext);
  
  let realUser = null;
  try {
    // Only try to get real user in production mode
    if (!isDemo) {
      const { useUser } = require('@clerk/nextjs');
      realUser = useUser();
    }
  } catch (e) {
    // useUser not available (normal in demo mode)
  }

  const { mockUser } = useContext(MockUserContext);

  if (isDemo || !realUser) {
    // Override with mock data
    return {
      isSignedIn: true,
      isLoaded: true,
      user: mockUser,
    };
  }

  return realUser;
}

/**
 * Enhanced demo mode indicator with call-to-action
 */
function DemoModeIndicator() {
  const openFullApp = () => {
    window.open(window.location.origin, '_blank');
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg shadow-xl text-sm font-medium z-50 max-w-sm border border-white/20">
      <div className="flex items-start space-x-3">
        <span className="text-lg">✨</span>
        <div className="flex-1">
          <div className="font-semibold mb-1">Preview Mode</div>
          <div className="text-blue-100 text-xs mb-3">
            You're viewing a demo with sample data.
          </div>
          <button
            onClick={openFullApp}
            className="w-full bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 backdrop-blur-sm"
          >
            Open Full App →
          </button>
        </div>
        <button 
          className="text-white/60 hover:text-white/80 text-xs leading-none"
          onClick={(e) => {
            (e.target as HTMLElement).closest('.fixed')?.remove();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
