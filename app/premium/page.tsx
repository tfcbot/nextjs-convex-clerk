import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import PremiumContent from '@/components/PremiumContent';

export default async function PremiumPage() {
  // Server-side check using has() with error handling
  let hasPremiumAccess = false;
  let hasPremiumPlan = false;
  
  try {
    const { has } = await auth();
    hasPremiumAccess = has({ feature: 'premium_access' });
    hasPremiumPlan = has({ plan: 'premium' });
  } catch (error) {
    console.error('Authentication error:', error);
    // Continue with default values (false) for graceful degradation
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Premium Content</h1>
      
      <div className="space-y-8">
        {/* Server-side protected content */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Server-side Protected Content</h2>
          
          {hasPremiumAccess ? (
            <div className="prose">
              <p>This content is protected on the server using the <code>has()</code> method.</p>
              <p>You can see this content because you have the <strong>premium_access</strong> feature.</p>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-gray-700">This content is only visible to users with the premium_access feature.</p>
              <Link 
                href="/pricing" 
                className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>

        {/* Client-side protected content using the Protect component */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Client-side Protected Content</h2>
          <PremiumContent featureName="advanced_features">
            <div className="prose">
              <p>This content is protected on the client using the <code>&lt;Protect&gt;</code> component.</p>
              <p>You can see this content because you have the <strong>advanced_features</strong> feature.</p>
            </div>
          </PremiumContent>
        </div>

        {/* Plan-based protection example */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Premium Plan Content</h2>
          
          {hasPremiumPlan ? (
            <div className="prose">
              <p>This content is protected on the server using the <code>has()</code> method with a plan check.</p>
              <p>You can see this content because you are subscribed to the <strong>premium</strong> plan.</p>
            </div>
          ) : (
            <div className="bg-gray-100 p-4 rounded-md">
              <p className="text-gray-700">This content is only visible to users with a premium plan.</p>
              <Link 
                href="/pricing" 
                className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 