'use client';

import { Protect } from '@clerk/nextjs';

interface PremiumContentProps {
  featureName: string;
  children: React.ReactNode;
}

export default function PremiumContent({ featureName, children }: PremiumContentProps) {
  return (
    <Protect
      feature={featureName}
      fallback={
        <div className="p-4 border-2 border-amber-400 bg-amber-50 rounded-lg">
          <h3 className="text-lg font-medium text-amber-700">Premium Feature</h3>
          <p className="text-amber-600">
            This content is only available to subscribers with the {featureName} feature.
          </p>
          <a 
            href="/pricing" 
            className="mt-2 inline-block px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
          >
            View Plans
          </a>
        </div>
      }
    >
      {children}
    </Protect>
  );
} 