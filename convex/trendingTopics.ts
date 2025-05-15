import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { ActionCtx } from "./_generated/server";

// Generate trending topics for content ideas
export const generateTrendingTopics = action({
  args: {
    userId: v.string(),
  },
  handler: async (ctx: ActionCtx, args): Promise<Id<"trendingTopics">[]> => {
    // Check if user exists
    const user = await ctx.runQuery(api.users.getUserById, { userId: args.userId });
    if (!user) {
      throw new Error("User not found");
    }
    
    // In a real implementation, this would fetch trending topics from YouTube API
    // and analyze them for relevance to the user's channel
    // For this demo, we'll return mock trending topics
    
    const trendingTopics = [
      {
        title: "AI Tools for Content Creators",
        description: "Explore how AI is transforming content creation workflows",
        relevanceScore: 95,
        isPremium: false,
      },
      {
        title: "Short-form vs Long-form Content Strategy",
        description: "Analyze the pros and cons of different content formats",
        relevanceScore: 87,
        isPremium: false,
      },
      {
        title: "Monetization Beyond AdSense",
        description: "Explore alternative revenue streams for creators",
        relevanceScore: 92,
        isPremium: true,
      },
      {
        title: "Collaboration Strategies for Channel Growth",
        description: "How to find and work with other creators for mutual benefit",
        relevanceScore: 84,
        isPremium: false,
      },
      {
        title: "Content Repurposing Workflows",
        description: "Maximize your content's reach across multiple platforms",
        relevanceScore: 89,
        isPremium: true,
      },
    ];
    
    // Store topics in the database
    const topicIds: Id<"trendingTopics">[] = [];
    for (const topic of trendingTopics) {
      const topicId: Id<"trendingTopics"> = await ctx.runMutation(api.trendingTopics.storeTrendingTopic, {
        userId: args.userId,
        topicData: {
          topic: topic.title,
          description: topic.description,
          relevanceScore: topic.relevanceScore,
          createdAt: Date.now(),
          isPremium: topic.isPremium,
          sources: [],
        }
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
