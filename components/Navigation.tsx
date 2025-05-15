'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get user data from Convex
  const userData = useQuery(api.users.getUserById, 
    isSignedIn && user ? { userId: user.id } : "skip"
  );
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-row justify-between items-center">
        <div className="flex items-center space-x-1">
          <Link href="/" className="font-semibold text-lg">
            YouTube Planner
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isSignedIn ? (
            <>
              <Link 
                href="/dashboard"
                className={`transition-colors ${isActive('/dashboard') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/content-ideas"
                className={`transition-colors ${pathname.startsWith('/dashboard/content-ideas') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'}`}
              >
                Content Ideas
              </Link>
              <Link 
                href="/dashboard/trending-topics"
                className={`transition-colors ${pathname.startsWith('/dashboard/trending-topics') 
                  ? 'text-blue-600 font-medium' 
                  : 'text-gray-700 hover:text-blue-600'}`}
              >
                Trending Topics
              </Link>
              {userData?.isPremium && (
                <Link 
                  href="/dashboard/competitors"
                  className={`transition-colors ${pathname.startsWith('/dashboard/competitors') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'}`}
                >
                  Competitors
                </Link>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              {!userData?.isPremium && (
                <Link 
                  href="/pricing" 
                  className="hidden md:block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Upgrade
                </Link>
              )}
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <Link 
              href="/sign-in" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          )}
          
          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
          <nav className="flex flex-col space-y-4">
            {isSignedIn ? (
              <>
                <Link 
                  href="/dashboard"
                  className={`transition-colors ${isActive('/dashboard') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/dashboard/content-ideas"
                  className={`transition-colors ${pathname.startsWith('/dashboard/content-ideas') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Content Ideas
                </Link>
                <Link 
                  href="/dashboard/trending-topics"
                  className={`transition-colors ${pathname.startsWith('/dashboard/trending-topics') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trending Topics
                </Link>
                {userData?.isPremium && (
                  <Link 
                    href="/dashboard/competitors"
                    className={`transition-colors ${pathname.startsWith('/dashboard/competitors') 
                      ? 'text-blue-600 font-medium' 
                      : 'text-gray-700 hover:text-blue-600'}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Competitors
                  </Link>
                )}
                {!userData?.isPremium && (
                  <Link 
                    href="/pricing" 
                    className="text-blue-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Upgrade to Premium
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link 
                  href="/"
                  className={`transition-colors ${isActive('/') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/pricing"
                  className={`transition-colors ${isActive('/pricing') 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700 hover:text-blue-600'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

