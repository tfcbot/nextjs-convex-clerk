import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Add a competitor to analyze
export const addCompetitor = action({
  args: {
    userId: v.string(),
    competitorUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is premium
    const user = await ctx.runQuery("users:getUserById", { userId: args.userId });
    const isPremium = user?.isPremium || false;
    
    if (!isPremium) {
      throw new Error("Competitor analysis is a premium feature");
    }
    
    // Extract competitor ID from URL (simplified for demo)
    const competitorChannelId = args.competitorUrl.split("/").pop() || "demo-competitor-id";
    
    // Simulate API call to get competitor data
    const competitorData = {
      competitorChannelId,
      competitorName: `Competitor ${competitorChannelId}`,
      competitorUrl: args.competitorUrl,
      subscriberCount: Math.floor(Math.random() * 500000),
      videoCount: Math.floor(Math.random() * 1000),
      viewCount: Math.floor(Math.random() * 50000000),
    };
    
    // Store competitor data
    const competitorId = await ctx.runMutation("competitors:storeCompetitorData", {
      userId: args.userId,
      competitorData,
    });
    
    return competitorId;
  },
});

// Store competitor data in the database
export const storeCompetitorData = mutation({
  args: {
    userId: v.string(),
    competitorData: v.object({
      competitorChannelId: v.string(),
      competitorName: v.string(),
      competitorUrl: v.string(),
      subscriberCount: v.number(),
      videoCount: v.number(),
      viewCount: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Check if competitor already exists
    const existingCompetitor = await ctx.db
      .query("competitors")
      .withIndex("by_competitor_id", (q) => 
        q.eq("competitorChannelId", args.competitorData.competitorChannelId)
      )
      .first();
    
    if (existingCompetitor) {
      // Update existing competitor
      return await ctx.db.patch(existingCompetitor._id, {
        subscriberCount: args.competitorData.subscriberCount,
        videoCount: args.competitorData.videoCount,
        viewCount: args.competitorData.viewCount,
        lastSyncedAt: Date.now(),
      });
    } else {
      // Create new competitor
      return await ctx.db.insert("competitors", {
        userId: args.userId,
        competitorChannelId: args.competitorData.competitorChannelId,
        competitorName: args.competitorData.competitorName,
        competitorUrl: args.competitorData.competitorUrl,
        subscriberCount: args.competitorData.subscriberCount,
        videoCount: args.competitorData.videoCount,
        viewCount: args.competitorData.viewCount,
        lastSyncedAt: Date.now(),
        notes: "",
        isPremium: true,
      });
    }
  },
});

// Get user's competitors
export const getUserCompetitors = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user is premium
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    const isPremium = user?.isPremium || false;
    
    if (!isPremium) {
      // Return empty array for non-premium users
      return [];
    }
    
    return await ctx.db
      .query("competitors")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Update competitor notes
export const updateCompetitorNotes = mutation({
  args: {
    competitorId: v.id("competitors"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.competitorId, {
      notes: args.notes,
    });
    return true;
  },
});

// Delete a competitor
export const deleteCompetitor = mutation({
  args: {
    competitorId: v.id("competitors"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.competitorId);
    return true;
  },
});

// Generate competitor insights (premium feature)
export const generateCompetitorInsights = action({
  args: {
    userId: v.string(),
    competitorId: v.id("competitors"),
  },
  handler: async (ctx, args) => {
    // Check if user is premium
    const user = await ctx.runQuery("users:getUserById", { userId: args.userId });
    const isPremium = user?.isPremium || false;
    
    if (!isPremium) {
      throw new Error("Competitor insights is a premium feature");
    }
    
    const competitor = await ctx.db.get(args.competitorId);
    if (!competitor) {
      throw new Error("Competitor not found");
    }
    
    // In a real implementation, this would analyze the competitor's content
    // For this demo, we'll return mock insights
    return {
      topPerformingContentTypes: ["Tutorials", "Reviews", "Interviews"],
      uploadFrequency: "2 videos per week",
      averageViewCount: Math.floor(competitor.viewCount / (competitor.videoCount || 1)),
      engagementRate: `${(Math.random() * 10).toFixed(2)}%`,
      growthRate: `${(Math.random() * 20).toFixed(2)}% per month`,
      recommendedStrategies: [
        "Focus on tutorial content similar to competitor's top videos",
        "Upload more frequently to match competitor's cadence",
        "Engage more with comments to boost engagement rate",
      ],
    };
  },
});

