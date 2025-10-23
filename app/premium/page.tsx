'use client';

import Link from 'next/link';
import { Protect } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from 'convex/react';
import { isInIframe } from '@/lib/iframe-detection';
import { DemoFeatureBanner, DemoFeaturePrompt, DemoSuccessState } from '@/components/DemoModeFeatures';

export default function PremiumPage() {
  const isDemo = isInIframe();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Premium Content</h1>
      
      <Authenticated>
        <DemoFeatureBanner feature="Premium Features">
          <div className="space-y-8">
            {/* Mock premium access for demo mode */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Advanced Analytics Dashboard
              </h2>
              
              <DemoFeaturePrompt
                feature="Analytics Dashboard"
                description="View detailed insights about your data, user engagement, and performance metrics. Sign up to track real analytics."
                className="h-64"
              >
                <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-gray-600">Interactive Charts & Metrics</div>
                  </div>
                </div>
              </DemoFeaturePrompt>
              
              {isDemo && (
                <DemoSuccessState 
                  message="Analytics data loaded successfully!"
                  icon="📈"
                  onTryReal={() => window.open(window.location.origin, '_blank')}
                />
              )}
            </div>

          {/* Client-side protected content using the Protect component */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Protected Feature Content</h2>
            <Protect 
              feature="advanced_features"
              fallback={
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-gray-700">This feature is only available with premium access.</p>
                  <Link 
                    href="/pricing" 
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View Plans
                  </Link>
                </div>
              }
            >
              <div className="prose">
                <p>This content is protected using the <code>&lt;Protect&gt;</code> component.</p>
                <p>You can access this advanced feature!</p>
                {isDemo && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
                    <p className="text-green-800 text-sm">✅ Demo: All features unlocked for testing</p>
                  </div>
                )}
              </div>
            </Protect>
          </div>

          {/* Plan-based protection example */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">AI-Powered Features</h2>
            
            <DemoFeaturePrompt
              feature="AI Assistant"
              description="Get personalized recommendations and automated insights. Unlock AI features with a premium account."
              className="h-48"
            >
              <div className="h-48 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl mb-2">🤖</div>
                  <div className="font-medium text-gray-800 mb-2">AI Assistant</div>
                  <div className="text-sm text-gray-600">Intelligent automation & insights</div>
                </div>
              </div>
            </DemoFeaturePrompt>
          </div>

          {/* File Upload Example */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">File Upload & Storage</h2>
            
            <DemoFeaturePrompt
              feature="Cloud Storage"
              description="Upload and manage your files with premium storage. Get 10GB free storage when you sign up."
              className="h-32"
            >
              <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">📁</div>
                  <div className="text-gray-600">Drag & drop files here</div>
                </div>
              </div>
            </DemoFeaturePrompt>
          </div>
          </div>
        </DemoFeatureBanner>
      </Authenticated>
      
      <Unauthenticated>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to view premium content and features.
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Sign In
          </Link>
        </div>
      </Unauthenticated>
    </div>
  );
} 