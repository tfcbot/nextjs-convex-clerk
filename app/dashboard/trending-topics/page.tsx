"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";

export default function TrendingTopicsPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  
  // Get user data from Convex
  const userData = useQuery(api.users.getUserById, 
    isSignedIn && user ? { userId: user.id } : "skip"
  );
  
  // Get trending topics
  const trendingTopics = useQuery(api.trendingTopics.getUserTrendingTopics, 
    isSignedIn && user ? { 
      userId: user.id, 
      includePremium: true // We'll filter on the client side
    } : "skip"
  ) || [];
  
  // Mutations
  const generateTrendingTopics = useMutation(api.trendingTopics.generateTrendingTopics);
  
  // Filter topics based on premium status
  const filteredTopics = trendingTopics.filter(topic => {
    // Filter by premium status if needed
    if (showPremiumOnly && !topic.isPremium) {
      return false;
    }
    
    // Hide premium topics for non-premium users
    if (topic.isPremium && !userData?.isPremium) {
      return false;
    }
    
    return true;
  });
  
  const handleGenerateTopics = async () => {
    if (!isSignedIn || !user) {
      return;
    }
    
    try {
      setIsGenerating(true);
      
      await generateTrendingTopics({
        userId: user.id,
      });
      
    } catch (error) {
      console.error("Failed to generate topics:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Trending Topics</h1>
        <button
          onClick={handleGenerateTopics}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Refresh Topics"}
        </button>
      </div>
      
      {/* Filters */}
      {userData?.isPremium && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="premiumOnly"
              checked={showPremiumOnly}
              onChange={(e) => setShowPremiumOnly(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="premiumOnly" className="text-sm font-medium text-gray-700">
              Premium Topics Only
            </label>
          </div>
        </div>
      )}
      
      {/* Topics List */}
      {filteredTopics.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">
            No trending topics found. Generate new topics or adjust your filters.
          </p>
          <button
            onClick={handleGenerateTopics}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? "Generating..." : "Generate Topics"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div key={topic._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold">{topic.topic}</h2>
                {topic.isPremium && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    PREMIUM
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">{topic.description}</p>
              
              {topic.relevanceScore !== undefined && (
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Relevance Score:</span>{" "}
                  <span className={`font-medium ${
                    topic.relevanceScore > 80 
                      ? "text-green-600" 
                      : topic.relevanceScore > 60 
                        ? "text-yellow-600" 
                        : "text-red-600"
                  }`}>
                    {topic.relevanceScore}/100
                  </span>
                </div>
              )}
              
              {topic.sources && topic.sources.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-1">Sources:</span>
                  <div className="flex flex-wrap gap-1">
                    {topic.sources.map((source, index) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Premium Upgrade Banner (only for free users) */}
      {!userData?.isPremium && (
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <h2 className="text-xl font-semibold mb-2">Unlock Premium Trending Topics</h2>
          <p className="mb-4">
            Upgrade to premium to access exclusive trending topics with higher relevance scores 
            and more detailed insights.
          </p>
          <Link 
            href="/pricing" 
            className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Upgrade Now
          </Link>
        </div>
      )}
    </div>
  );
}

