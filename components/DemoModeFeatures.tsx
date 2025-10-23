'use client';

import { isInIframe } from '@/lib/iframe-detection';
import { useState } from 'react';

interface DemoPromptProps {
  feature: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Shows a prompt for features that require authentication in demo mode
 */
export function DemoFeaturePrompt({ 
  feature, 
  description, 
  children,
  className = '' 
}: DemoPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  const inIframe = isInIframe();

  if (!inIframe || dismissed) {
    return children || null;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center backdrop-blur-sm">
        <div className="text-center p-6 max-w-sm">
          <div className="text-2xl mb-2">🔒</div>
          <div className="font-semibold text-gray-800 mb-2">
            {feature} (Demo Mode)
          </div>
          <div className="text-sm text-gray-600 mb-4">
            {description}
          </div>
          <div className="space-y-2">
            <button
              onClick={() => window.open(window.location.origin, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Try for Real →
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="w-full text-gray-500 hover:text-gray-700 text-xs py-1 transition-colors"
            >
              Continue Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline demo banner for features
 */
export function DemoFeatureBanner({ 
  children, 
  feature,
  className = ''
}: { 
  children: React.ReactNode;
  feature?: string;
  className?: string;
}) {
  const inIframe = isInIframe();

  if (!inIframe) {
    return <>{children}</>;
  }

  return (
    <div className={className}>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-center space-x-3">
        <span className="text-amber-600 text-lg">⚡</span>
        <div className="flex-1 text-sm">
          <span className="font-medium text-amber-800">
            {feature ? `${feature} - ` : ''}Demo Mode:
          </span>
          <span className="text-amber-700 ml-1">
            Changes won't be saved. 
            <button 
              onClick={() => window.open(window.location.origin, '_blank')}
              className="underline hover:no-underline ml-1 font-medium"
            >
              Sign up to save your work
            </button>
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * Success state that shows in demo mode
 */
export function DemoSuccessState({ 
  message = "Action completed in demo mode!",
  icon = "✅",
  onTryReal
}: {
  message?: string;
  icon?: string;
  onTryReal?: () => void;
}) {
  const inIframe = isInIframe();

  if (!inIframe) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
      <div className="flex items-center space-x-3">
        <span className="text-green-600 text-xl">{icon}</span>
        <div className="flex-1">
          <div className="font-medium text-green-800">{message}</div>
          <div className="text-green-600 text-sm mt-1">
            This was a demo simulation. 
            {onTryReal && (
              <button 
                onClick={onTryReal}
                className="underline hover:no-underline ml-1 font-medium"
              >
                Try it for real
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to simulate demo actions with delays
 */
export function useDemoAction() {
  const [isLoading, setIsLoading] = useState(false);
  const inIframe = isInIframe();

  const simulateAction = async (
    realAction: () => Promise<any>,
    demoDelay = 1500
  ) => {
    setIsLoading(true);
    
    if (inIframe) {
      // Simulate network delay in demo mode
      await new Promise(resolve => setTimeout(resolve, demoDelay));
      setIsLoading(false);
      return { success: true, demo: true };
    } else {
      // Execute real action
      try {
        const result = await realAction();
        setIsLoading(false);
        return { success: true, demo: false, data: result };
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    }
  };

  return { simulateAction, isLoading, isDemoMode: inIframe };
}

/**
 * Demo data generator utilities
 */
export const demoData = {
  generateId: () => `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  generateUser: (override = {}) => ({
    id: demoData.generateId(),
    name: `Demo User ${Math.floor(Math.random() * 100)}`,
    email: `user${Math.floor(Math.random() * 1000)}@demo.com`,
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=32&h=32&fit=crop&crop=face`,
    createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30),
    ...override
  }),

  generatePost: (authorId?: string) => ({
    id: demoData.generateId(),
    title: `Demo Post ${Math.floor(Math.random() * 100)}`,
    content: "This is sample content generated for the demo. In the real app, users can create and edit their own content.",
    authorId: authorId || demoData.generateId(),
    createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24),
    likes: Math.floor(Math.random() * 50),
    comments: Math.floor(Math.random() * 20)
  }),

  generateComment: (postId?: string, authorId?: string) => ({
    id: demoData.generateId(),
    content: "This is a demo comment. Real users can engage with content once they sign up!",
    postId: postId || demoData.generateId(),
    authorId: authorId || demoData.generateId(),
    createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60),
    likes: Math.floor(Math.random() * 10)
  })
};
