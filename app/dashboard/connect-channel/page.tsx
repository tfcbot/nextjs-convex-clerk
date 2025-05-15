"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConnectChannelPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [channelUrl, setChannelUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const connectYouTubeChannel = useMutation(api.youtubeApi.connectYouTubeChannel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn || !user) {
      setError("You must be signed in to connect a channel");
      return;
    }
    
    if (!channelUrl) {
      setError("Please enter a YouTube channel URL");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      await connectYouTubeChannel({
        channelUrl,
        userId: user.id,
      });
      
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect channel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Connect Your YouTube Channel</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
              1
            </div>
            <div>
              <h3 className="font-medium">Enter your YouTube channel URL</h3>
              <p className="text-gray-600">Paste the URL of your YouTube channel below</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
              2
            </div>
            <div>
              <h3 className="font-medium">We analyze your content</h3>
              <p className="text-gray-600">Our AI will analyze your videos, audience, and performance</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-blue-100 text-blue-800 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-3">
              3
            </div>
            <div>
              <h3 className="font-medium">Get personalized recommendations</h3>
              <p className="text-gray-600">Receive content ideas tailored to your channel and audience</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Connect Channel</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="channelUrl" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Channel URL
            </label>
            <input
              type="text"
              id="channelUrl"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="https://www.youtube.com/c/YourChannel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Example: https://www.youtube.com/c/YourChannel
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Connecting..." : "Connect Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

