"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";

export default function CompetitorsPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [selectedCompetitor, setSelectedCompetitor] = useState<Id<"competitors"> | null>(null);
  const [insights, setInsights] = useState<Record<string, unknown> | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  
  // Get user data from Convex
  const userData = useQuery(api.users.getUserById, 
    isSignedIn && user ? { userId: user.id } : "skip"
  );
  
  // Get user's competitors
  const competitors = useQuery(api.competitors.getUserCompetitors, 
    isSignedIn && user ? { userId: user.id } : "skip"
  ) || [];
  
  // Mutations
  const addCompetitor = useMutation(api.competitors.addCompetitor);
  const deleteCompetitor = useMutation(api.competitors.deleteCompetitor);
  const updateCompetitorNotes = useMutation(api.competitors.updateCompetitorNotes);
  const generateCompetitorInsights = useMutation(api.competitors.generateCompetitorInsights);
  
  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn || !user) {
      setError("You must be signed in to add a competitor");
      return;
    }
    
    if (!userData?.isPremium) {
      setError("Competitor analysis is a premium feature");
      return;
    }
    
    if (!competitorUrl) {
      setError("Please enter a YouTube channel URL");
      return;
    }
    
    try {
      setIsAdding(true);
      setError("");
      
      await addCompetitor({
        userId: user.id,
        competitorUrl,
      });
      
      setCompetitorUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add competitor");
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleDeleteCompetitor = async (competitorId: Id<"competitors">) => {
    try {
      await deleteCompetitor({ competitorId });
      if (selectedCompetitor === competitorId) {
        setSelectedCompetitor(null);
        setInsights(null);
      }
    } catch (error) {
      console.error("Failed to delete competitor:", error);
    }
  };
  
  const handleUpdateNotes = async (competitorId: Id<"competitors">, notes: string) => {
    try {
      await updateCompetitorNotes({ competitorId, notes });
    } catch (error) {
      console.error("Failed to update notes:", error);
    }
  };
  
  const handleGenerateInsights = async (competitorId: Id<"competitors">) => {
    if (!isSignedIn || !user || !userData?.isPremium) {
      return;
    }
    
    try {
      setIsLoadingInsights(true);
      setSelectedCompetitor(competitorId);
      
      const result = await generateCompetitorInsights({
        userId: user.id,
        competitorId,
      });
      
      setInsights(result);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // If not premium, show upgrade prompt
  if (userData && !userData.isPremium) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Competitor Analysis</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Competitor analysis is a premium feature. Upgrade to analyze what's working for similar channels 
            and get insights to help you stand out.
          </p>
          <Link 
            href="/pricing" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Competitor Analysis</h1>
      
      {/* Add Competitor Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Competitor</h2>
        
        <form onSubmit={handleAddCompetitor} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              placeholder="Enter YouTube channel URL"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isAdding}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add Competitor"}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {/* Competitors List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Competitors List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Your Competitors</h2>
            
            {competitors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No competitors added yet. Add your first competitor above.
              </p>
            ) : (
              <div className="space-y-4">
                {competitors.map((competitor) => (
                  <div 
                    key={competitor._id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCompetitor === competitor._id 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleGenerateInsights(competitor._id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{competitor.competitorName}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCompetitor(competitor._id);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {competitor.subscriberCount?.toLocaleString() || "0"} subscribers
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Competitor Insights */}
        <div className="lg:col-span-2">
          {selectedCompetitor ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {isLoadingInsights ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading insights...</p>
                </div>
              ) : insights ? (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Competitor Insights</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Top Performing Content</h3>
                      <ul className="list-disc list-inside text-gray-700">
                        {insights.topPerformingContentTypes.map((type: string, index: number) => (
                          <li key={index}>{type}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Channel Metrics</h3>
                      <div className="space-y-2 text-gray-700">
                        <p><span className="font-medium">Upload Frequency:</span> {insights.uploadFrequency}</p>
                        <p><span className="font-medium">Avg. Views:</span> {insights.averageViewCount.toLocaleString()}</p>
                        <p><span className="font-medium">Engagement Rate:</span> {insights.engagementRate}</p>
                        <p><span className="font-medium">Growth Rate:</span> {insights.growthRate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium mb-2">Recommended Strategies</h3>
                    <ul className="list-disc list-inside text-gray-700">
                      {insights.recommendedStrategies.map((strategy: string, index: number) => (
                        <li key={index}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Notes</h3>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Add your notes about this competitor..."
                      defaultValue={competitors.find(c => c._id === selectedCompetitor)?.notes || ""}
                      onBlur={(e) => handleUpdateNotes(selectedCompetitor, e.target.value)}
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Click &quot;Generate Insights&quot; to analyze this competitor</p>
                  <button
                    onClick={() => handleGenerateInsights(selectedCompetitor)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Generate Insights
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center py-12">
              <p className="text-gray-500 mb-4">
                Select a competitor from the list to view insights
              </p>
              {competitors.length === 0 && (
                <p className="text-gray-500">
                  Or add your first competitor using the form above
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
