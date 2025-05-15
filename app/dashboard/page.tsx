"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const router = useRouter();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize user in Convex when they first log in
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      createOrUpdateUser({
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.primaryEmailAddress?.emailAddress,
        isPremium: false, // Default to free tier
      }).then(() => {
        setIsInitialized(true);
      });
    }
  }, [isAuthenticated, user, createOrUpdateUser, isInitialized]);

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Get user data from Convex
  const userData = useQuery(api.users.getUserById, 
    isAuthenticated && user ? { userId: user.id } : "skip"
  );
  
  // Get user's YouTube channels
  const channels = useQuery(api.youtubeApi.getUserChannels, 
    isAuthenticated && user ? { userId: user.id } : "skip"
  ) || [];

  // Get content ideas (free ones only for non-premium users)
  const contentIdeas = useQuery(api.contentIdeas.getUserContentIdeas, 
    isAuthenticated && user ? { 
      userId: user.id, 
      includePremium: userData?.isPremium || false 
    } : "skip"
  ) || [];

  // Get trending topics
  const trendingTopics = useQuery(api.trendingTopics.getUserTrendingTopics, 
    isAuthenticated && user ? { 
      userId: user.id, 
      includePremium: userData?.isPremium || false 
    } : "skip"
  ) || [];

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-600">
          {userData?.isPremium 
            ? "You're on the Premium plan. Enjoy all features!" 
            : "You're on the Free plan. Upgrade to access premium features."}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="YouTube Channels" 
          value={channels.length.toString()} 
          description="Connected channels" 
        />
        <StatCard 
          title="Content Ideas" 
          value={contentIdeas.length.toString()} 
          description={userData?.isPremium ? "Premium ideas available" : "Upgrade for more ideas"} 
        />
        <StatCard 
          title="Trending Topics" 
          value={trendingTopics.length.toString()} 
          description={userData?.isPremium ? "Including premium topics" : "Basic topics only"} 
        />
      </div>

      {/* Channel Connection */}
      {channels.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Connect Your YouTube Channel</h2>
          <p className="mb-4">Connect your YouTube channel to get personalized content ideas and insights.</p>
          <Link 
            href="/dashboard/connect-channel" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Connect Channel
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your YouTube Channels</h2>
            <Link 
              href="/dashboard/connect-channel" 
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Channel
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {channels.map((channel) => (
              <div key={channel._id} className="flex items-center p-4 border border-gray-100 rounded-lg">
                <img 
                  src={channel.thumbnailUrl || "https://placehold.co/100/e2e8f0/475569?text=Channel"} 
                  alt={channel.channelName} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h3 className="font-medium">{channel.channelName}</h3>
                  <p className="text-sm text-gray-500">
                    {channel.subscriberCount?.toLocaleString() || "0"} subscribers
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Ideas Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Content Ideas</h2>
          <Link 
            href="/dashboard/content-ideas" 
            className="text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>
        {contentIdeas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No content ideas yet.</p>
            <Link 
              href="/dashboard/generate-ideas" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Ideas
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contentIdeas.slice(0, 3).map((idea) => (
              <div key={idea._id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{idea.title}</h3>
                  {idea.isPremium && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                {idea.tags && idea.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {idea.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="text-center pt-4">
              <Link 
                href="/dashboard/content-ideas" 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                View All Ideas
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Trending Topics</h2>
          <Link 
            href="/dashboard/trending-topics" 
            className="text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>
        {trendingTopics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No trending topics available.</p>
            <Link 
              href="/dashboard/trending-topics" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Discover Trends
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingTopics.slice(0, 4).map((topic) => (
              <div key={topic._id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{topic.topic}</h3>
                  {topic.isPremium && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{topic.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Premium Upgrade Banner (only for free users) */}
      {!userData?.isPremium && (
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Upgrade to Premium</h2>
          <p className="mb-4">
            Get unlimited content ideas, competitor analysis, and advanced trending topics.
          </p>
          <Link 
            href="/pricing" 
            className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            View Pricing
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold mt-2 mb-1">{value}</p>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

