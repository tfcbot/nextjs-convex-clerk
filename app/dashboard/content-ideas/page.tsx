"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";

export default function ContentIdeasPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  
  // Get user data from Convex
  const userData = useQuery(api.users.getUserById, 
    isSignedIn && user ? { userId: user.id } : "skip"
  );
  
  // Get user's YouTube channels
  const channels = useQuery(api.youtubeApi.getUserChannels, 
    isSignedIn && user ? { userId: user.id } : "skip"
  ) || [];
  
  // Get content ideas
  const contentIdeas = useQuery(api.contentIdeas.getUserContentIdeas, 
    isSignedIn && user ? { 
      userId: user.id, 
      includePremium: true // We'll filter on the client side
    } : "skip"
  ) || [];
  
  // Mutations
  const generateContentIdeas = useMutation(api.contentIdeas.generateContentIdeas);
  const deleteContentIdea = useMutation(api.contentIdeas.deleteContentIdea);
  
  // Filter ideas based on selected category and premium status
  const filteredIdeas = contentIdeas.filter(idea => {
    // Filter by category if selected
    if (selectedCategory && idea.category !== selectedCategory) {
      return false;
    }
    
    // Filter by premium status if needed
    if (showPremiumOnly && !idea.isPremium) {
      return false;
    }
    
    // Hide premium ideas for non-premium users
    if (idea.isPremium && !userData?.isPremium) {
      return false;
    }
    
    return true;
  });
  
  // Get unique categories from ideas
  const categories = Array.from(new Set(contentIdeas.map(idea => idea.category).filter(Boolean)));
  
  const handleGenerateIdeas = async () => {
    if (!isSignedIn || !user || channels.length === 0) {
      return;
    }
    
    try {
      setIsGenerating(true);
      
      await generateContentIdeas({
        userId: user.id,
        channelId: channels[0].channelId,
        count: 10,
      });
      
    } catch (error) {
      console.error("Failed to generate ideas:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDeleteIdea = async (ideaId: Id<"contentIdeas">) => {
    try {
      await deleteContentIdea({ ideaId });
    } catch (error) {
      console.error("Failed to delete idea:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Ideas</h1>
        <button
          onClick={handleGenerateIdeas}
          disabled={isGenerating || channels.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isGenerating ? "Generating..." : "Generate New Ideas"}
        </button>
      </div>
      
      {channels.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">
            Connect your YouTube channel to generate content ideas.
          </p>
          <Link 
            href="/dashboard/connect-channel" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Connect Channel
          </Link>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {userData?.isPremium && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="premiumOnly"
                    checked={showPremiumOnly}
                    onChange={(e) => setShowPremiumOnly(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="premiumOnly" className="text-sm font-medium text-gray-700">
                    Premium Ideas Only
                  </label>
                </div>
              )}
            </div>
          </div>
          
          {/* Ideas List */}
          {filteredIdeas.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-600 mb-4">
                No content ideas found. Generate new ideas or adjust your filters.
              </p>
              <button
                onClick={handleGenerateIdeas}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate Ideas"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredIdeas.map((idea) => (
                <div key={idea._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold">{idea.title}</h2>
                    {idea.isPremium && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        PREMIUM
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{idea.description}</p>
                  
                  {idea.category && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Category:</span>{" "}
                      <span>{idea.category}</span>
                    </div>
                  )}
                  
                  {idea.estimatedViewership && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">Estimated Viewership:</span>{" "}
                      <span className={`capitalize ${
                        idea.estimatedViewership === "high" 
                          ? "text-green-600" 
                          : idea.estimatedViewership === "medium" 
                            ? "text-yellow-600" 
                            : "text-red-600"
                      }`}>
                        {idea.estimatedViewership}
                      </span>
                    </div>
                  )}
                  
                  {idea.tags && idea.tags.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700 block mb-1">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {idea.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {idea.potentialKeywords && idea.potentialKeywords.length > 0 && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700 block mb-1">Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {idea.potentialKeywords.map((keyword, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleDeleteIdea(idea._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Premium Upgrade Banner (only for free users) */}
          {!userData?.isPremium && (
            <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <h2 className="text-xl font-semibold mb-2">Unlock Premium Content Ideas</h2>
              <p className="mb-4">
                Upgrade to premium to access advanced content ideas with detailed outlines, 
                keyword suggestions, and performance predictions.
              </p>
              <Link 
                href="/pricing" 
                className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
              >
                Upgrade Now
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
