'use client';

import Link from 'next/link';
import { Protect } from '@clerk/nextjs';
import { Authenticated, Unauthenticated } from 'convex/react';
import { isInIframe } from '@/lib/iframe-detection';

export default function PremiumPage() {
  const isDemo = isInIframe();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Premium Content</h1>
      
      <Authenticated>
        <div className="space-y-8">
          {/* Mock premium access for demo mode */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {isDemo ? 'Demo Premium Content' : 'Server-side Protected Content'}
            </h2>
            
            <div className="prose">
              <p>This content demonstrates premium feature access.</p>
              {isDemo ? (
                <>
                  <p>In <strong>demo mode</strong>, all premium features are accessible for demonstration.</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                    <p className="text-blue-800 text-sm">
                      🔍 <strong>Demo Mode:</strong> Visit the full app to experience real premium feature controls and billing.
                    </p>
                  </div>
                </>
              ) : (
                <p>You can see this content because you have the <strong>premium_access</strong> feature.</p>
              )}
            </div>
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
            <h2 className="text-xl font-semibold mb-4">Premium Plan Features</h2>
            
            <Protect 
              plan="premium"
              fallback={
                <div className="bg-gray-100 p-4 rounded-md">
                  <p className="text-gray-700">This content is only visible to premium plan subscribers.</p>
                  <Link 
                    href="/pricing" 
                    className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Upgrade to Premium
                  </Link>
                </div>
              }
            >
              <div className="prose">
                <p>This content is protected using plan-based access control.</p>
                <p>You are subscribed to the <strong>premium</strong> plan!</p>
                {isDemo && (
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mt-3">
                    <p className="text-purple-800 text-sm">💎 Demo: Premium plan simulation active</p>
                  </div>
                )}
              </div>
            </Protect>
          </div>
        </div>
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