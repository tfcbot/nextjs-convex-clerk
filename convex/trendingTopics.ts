import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Generate trending topics in the user's niche
export const generateTrendingTopics = action({
  args: {
    userId: v.string(),
    niche: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user is premium
    const user = await ctx.runQuery("users:getUserById", { userId: args.userId });
    const isPremium = user?.isPremium || false;
    
    // In a real implementation, this would use an AI service or trend API
    // to find trending topics in the user's niche
    // For this demo, we'll generate mock trending topics
    
    const basicTopics = [
      {
        topic: "Content Creation Tips",
        description: "Best practices for creating engaging YouTube content",
        relevanceScore: 85,
        sources: ["YouTube Trends", "Creator Insights"],
        isPremium: false,
      },
      {
        topic: "YouTube Algorithm Updates",
        description: "Recent changes to the YouTube recommendation algorithm",
        relevanceScore: 90,
        sources: ["YouTube Blog", "Creator Insider"],
        isPremium: false,
      },
      {
        topic: "Video Editing Techniques",
        description: "Popular editing styles and techniques for YouTube",
        relevanceScore: 75,
        sources: ["Creator Forums", "Editing Communities"],
        isPremium: false,
      },
    ];
    
    const premiumTopics = [
      {
        topic: "Emerging Content Niches",
        description: "Undiscovered content categories with high growth potential",
        relevanceScore: 95,
        sources: ["Trend Analysis", "Market Research"],
        isPremium: true,
      },
      {
        topic: "Monetization Strategies",
        description: "Advanced techniques for maximizing revenue from your content",
        relevanceScore: 88,
        sources: ["Creator Economy Reports", "Platform Insights"],
        isPremium: true,
      },
      {
        topic: "Audience Retention Tactics",
        description: "Proven methods to keep viewers watching longer",
        relevanceScore: 92,
        sources: ["Analytics Research", "Engagement Studies"],
        isPremium: true,
      },
      {
        topic: "Cross-Platform Growth",
        description: "Strategies for leveraging multiple platforms to grow your audience",
        relevanceScore: 87,
        sources: ["Social Media Trends", "Creator Case Studies"],
        isPremium: true,
      },
    ];
    
    // Combine topics based on premium status
    const topics = [...basicTopics];
    if (isPremium) {
      topics.push(...premiumTopics);
    }
    
    // Store topics in the database
    const topicIds = [];
    for (const topicData of topics) {
      const topicId = await ctx.runMutation("trendingTopics:storeTrendingTopic", {
        userId: args.userId,
        topicData: {
          ...topicData,
          createdAt: Date.now(),
        },
      });
      topicIds.push(topicId);
    }
    
    return topicIds;
  },
});

// Store a trending topic in the database
export const storeTrendingTopic = mutation({
  args: {
    userId: v.string(),
    topicData: v.object({
      topic: v.string(),
      description: v.optional(v.string()),
      relevanceScore: v.optional(v.number()),
      createdAt: v.number(),
      isPremium: v.boolean(),
      sources: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("trendingTopics", {
      userId: args.userId,
      topic: args.topicData.topic,
      description: args.topicData.description,
      relevanceScore: args.topicData.relevanceScore,
      createdAt: args.topicData.createdAt,
      isPremium: args.topicData.isPremium,
      sources: args.topicData.sources,
    });
  },
});

// Get trending topics for a user
export const getUserTrendingTopics = query({
  args: {
    userId: v.string(),
    includePremium: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Get user to check premium status
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .first();
    
    const isPremium = user?.isPremium || false;
    
    // If user is not premium and requesting premium topics, filter them out
    const query = ctx.db
      .query("trendingTopics")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId));
    
    if (!isPremium || !args.includePremium) {
      return await query.filter((q) => q.eq(q.field("isPremium"), false)).collect();
    }
    
    return await query.collect();
  },
});

