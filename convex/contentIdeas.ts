import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Generate content ideas based on user's channel
export const generateContentIdeas = action({
  args: {
    userId: v.string(),
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const user = await ctx.runQuery(api.users.getUserById, { userId: args.userId });
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get user's YouTube channels
    const channels = await ctx.runQuery(api.youtubeApi.getUserChannels, { userId: args.userId });
    
    // Use provided channel ID or default to first channel
    const channelId = args.channelId || (channels.length > 0 ? channels[0].id : "demo-channel");
    
    // Get recent videos to analyze content preferences
    const videos = await ctx.runQuery(api.youtubeApi.getChannelVideos, { channelId: args.channelId });
    
    // In a real implementation, this would analyze the channel's content
    // and generate personalized ideas
    // For this demo, we'll return mock ideas
    
    const contentIdeas = [
      {
        title: "10 Advanced Tips for YouTube Growth in 2023",
        description: "Share advanced strategies that have worked for your channel",
        tags: ["growth", "strategy", "tips"],
        isPremium: false,
      },
      {
        title: "How I Gained 10K Subscribers in 30 Days",
        description: "Share your journey and specific tactics that led to subscriber growth",
        tags: ["growth", "case study", "subscribers"],
        isPremium: false,
      },
      {
        title: "YouTube Algorithm: What Changed in 2023",
        description: "Analyze recent algorithm changes and how creators should adapt",
        tags: ["algorithm", "strategy", "analysis"],
        isPremium: true,
      },
      {
        title: "Content Calendar Planning for YouTube Success",
        description: "Show how to plan content strategically for maximum impact",
        tags: ["planning", "strategy", "organization"],
        isPremium: false,
      },
      {
        title: "Competitor Analysis: What Top Creators Do Differently",
        description: "Analyze successful channels in your niche and extract lessons",
        tags: ["analysis", "competition", "strategy"],
        isPremium: true,
      },
    ];
    
    // Store ideas in the database
    const ideaIds = [];
    for (const idea of contentIdeas) {
      const ideaId = await ctx.runMutation(api.contentIdeas.storeContentIdea, {
        userId: args.userId,
        idea,
      });
      ideaIds.push(ideaId);
    }
    
    return ideaIds;
  },
});

// Store a content idea in the database
export const storeContentIdea = mutation({
  args: {
    idea: v.object({
      userId: v.string(),
      title: v.string(),
      description: v.string(),
      tags: v.optional(v.array(v.string())),
      createdAt: v.number(),
      isGenerated: v.boolean(),
      inspirationSources: v.optional(v.array(v.string())),
      isPremium: v.boolean(),
      category: v.optional(v.string()),
      potentialKeywords: v.optional(v.array(v.string())),
      estimatedViewership: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentIdeas", args.idea);
  },
});

// Get content ideas for a user
export const getUserContentIdeas = query({
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
    
    // If user is not premium and requesting premium ideas, filter them out
    const query = ctx.db
      .query("contentIdeas")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId));
    
    if (!isPremium || !args.includePremium) {
      return await query.filter((q) => q.eq(q.field("isPremium"), false)).collect();
    }
    
    return await query.collect();
  },
});

// Create a manual content idea
export const createManualContentIdea = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentIdeas", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      tags: args.tags || [],
      createdAt: Date.now(),
      isGenerated: false,
      isPremium: false,
      category: args.category,
    });
  },
});

// Delete a content idea
export const deleteContentIdea = mutation({
  args: {
    ideaId: v.id("contentIdeas"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.ideaId);
    return true;
  },
});

// Helper function to get a random element from an array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
