'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { PopupAuthButtons } from './PopupAuth';

export default function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-row justify-between items-center">
        <div className="flex items-center space-x-1">
          <Link href="/" className="font-semibold text-lg">
            Convex + Next.js + Clerk
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/"
            className={`transition-colors ${isActive('/') 
              ? 'text-blue-600 font-medium' 
              : 'text-gray-700 hover:text-blue-600'}`}
          >
            Home
          </Link>
          <Link 
            href="/pricing"
            className={`transition-colors ${isActive('/pricing') 
              ? 'text-blue-600 font-medium' 
              : 'text-gray-700 hover:text-blue-600'}`}
          >
            Pricing
          </Link>
          <Link 
            href="/premium"
            className={`transition-colors ${isActive('/premium') 
              ? 'text-blue-600 font-medium' 
              : 'text-gray-700 hover:text-blue-600'}`}
          >
            Premium
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  userButtonAvatarBox: 'w-8 h-8',
                }
              }}
            />
          </SignedIn>
          <SignedOut>
            <PopupAuthButtons />
          </SignedOut>
        </div>
      </div>
    </header>
  );
} 