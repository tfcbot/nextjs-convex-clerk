import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Generate content ideas based on user's channel
export const generateContentIdeas = action({
  args: {
    userId: v.string(),
    channelId: v.string(),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if user is premium
    const user = await ctx.runQuery("users:getUserById", { userId: args.userId });
    const isPremium = user?.isPremium || false;
    
    // Get channel data
    const channels = await ctx.runQuery("youtubeApi:getUserChannels", { userId: args.userId });
    const channel = channels.find(c => c.channelId === args.channelId);
    
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Get videos to analyze
    const videos = await ctx.runQuery("youtubeApi:getChannelVideos", { channelId: args.channelId });
    
    // In a real implementation, this would use an AI service to analyze videos and generate ideas
    // For this demo, we'll generate mock ideas
    const ideas = [];
    const categories = ["Tutorial", "Review", "Vlog", "Commentary", "Interview", "Reaction"];
    const estimatedViewership = ["high", "medium", "low"];
    
    // Generate different ideas based on premium status
    const ideaCount = isPremium ? args.count : Math.min(args.count, 3); // Limit for free users
    
    for (let i = 0; i < ideaCount; i++) {
      const isPremiumIdea = i >= 3; // First 3 ideas are free, rest are premium
      
      const idea = {
        userId: args.userId,
        title: `Content Idea ${i + 1}: ${getRandomElement(categories)}`,
        description: `This is a ${isPremiumIdea ? 'premium' : 'free'} content idea generated based on your channel analytics. It's designed to engage your audience and grow your channel.`,
        tags: ["youtube", "content", getRandomElement(categories).toLowerCase()],
        createdAt: Date.now(),
        isGenerated: true,
        inspirationSources: videos.slice(0, 2).map(v => v.videoId),
        isPremium: isPremiumIdea,
        category: getRandomElement(categories),
        potentialKeywords: ["youtube", "creator", "content", getRandomElement(categories).toLowerCase()],
        estimatedViewership: getRandomElement(estimatedViewership),
      };
      
      ideas.push(idea);
    }
    
    // Store ideas in the database
    const ideaIds = [];
    for (const idea of ideas) {
      const ideaId = await ctx.runMutation("contentIdeas:storeContentIdea", { idea });
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

