import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ActionCtx } from "./_generated/server";

// Mock function to simulate fetching YouTube channel data
// In a real implementation, this would use the YouTube API
export const connectYouTubeChannel = action({
  args: {
    channelUrl: v.string(),
    userId: v.string(),
  },
  handler: async (ctx: ActionCtx, args): Promise<Id<"youtubeChannels">> => {
    // Extract channel ID from URL (simplified for demo)
    const youtubeChannelId = args.channelUrl.split("/").pop() || "demo-channel-id";
    
    // Simulate API call to get channel data
    const channelData = {
      channelId: youtubeChannelId,
      channelName: `Channel ${youtubeChannelId}`,
      channelUrl: args.channelUrl,
      subscriberCount: Math.floor(Math.random() * 100000),
      videoCount: Math.floor(Math.random() * 500),
      viewCount: Math.floor(Math.random() * 10000000),
      thumbnailUrl: `https://picsum.photos/seed/${youtubeChannelId}/200/200`,
    };
    
    // Store channel data in the database
    const dbChannelId = (await ctx.runMutation(api.youtubeApi.storeChannelData, {
      userId: args.userId,
      channelData,
    })) as Id<"youtubeChannels">;
    
    // Simulate fetching videos (in a real app, would paginate through all videos)
    const videos = Array.from({ length: 5 }, (_, i) => ({
      videoId: `video-${i}-${youtubeChannelId}`,
      title: `Sample Video ${i}`,
      description: `This is a sample video description for video ${i}`,
      publishedAt: Date.now() - i * 86400000, // each video 1 day apart
      viewCount: Math.floor(Math.random() * 50000),
      likeCount: Math.floor(Math.random() * 5000),
      commentCount: Math.floor(Math.random() * 500),
      thumbnailUrl: `https://picsum.photos/seed/video-${i}-${youtubeChannelId}/320/180`,
      tags: ["sample", "video", `tag-${i}`],
    }));
    
    // Store videos in the database
    await ctx.runMutation(api.youtubeApi.storeVideos, {
      channelId: dbChannelId,
      videos,
    });
    
    return dbChannelId;
  },
});

// Store channel data in the database
export const storeChannelData = mutation({
  args: {
    userId: v.string(),
    channelData: v.object({
      channelId: v.string(),
      channelName: v.string(),
      channelUrl: v.string(),
      subscriberCount: v.number(),
      videoCount: v.number(),
      viewCount: v.number(),
      thumbnailUrl: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    // Check if channel already exists
    const existingChannel = await ctx.db
      .query("youtubeChannels")
      .withIndex("by_channel_id", (q) => q.eq("channelId", args.channelData.channelId))
      .first();
    
    if (existingChannel) {
      // Update existing channel
      return await ctx.db.patch(existingChannel._id, {
        subscriberCount: args.channelData.subscriberCount,
        videoCount: args.channelData.videoCount,
        viewCount: args.channelData.viewCount,
        lastSyncedAt: Date.now(),
      });
    } else {
      // Create new channel
      return await ctx.db.insert("youtubeChannels", {
        userId: args.userId,
        channelId: args.channelData.channelId,
        channelName: args.channelData.channelName,
        channelUrl: args.channelData.channelUrl,
        subscriberCount: args.channelData.subscriberCount,
        videoCount: args.channelData.videoCount,
        viewCount: args.channelData.viewCount,
        thumbnailUrl: args.channelData.thumbnailUrl,
        lastSyncedAt: Date.now(),
        isAnalyzed: false,
      });
    }
  },
});

// Store videos in the database
export const storeVideos = mutation({
  args: {
    channelId: v.id("youtubeChannels"),
    videos: v.array(
      v.object({
        videoId: v.string(),
        title: v.string(),
        description: v.string(),
        publishedAt: v.number(),
        viewCount: v.number(),
        likeCount: v.number(),
        commentCount: v.number(),
        thumbnailUrl: v.string(),
        tags: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Store each video
    for (const video of args.videos) {
      // Check if video already exists
      const existingVideo = await ctx.db
        .query("videos")
        .withIndex("by_video_id", (q) => q.eq("videoId", video.videoId))
        .first();
      
      if (existingVideo) {
        // Update existing video
        await ctx.db.patch(existingVideo._id, {
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
        });
      } else {
        // Create new video
        await ctx.db.insert("videos", {
          channelId: channel.channelId,
          videoId: video.videoId,
          title: video.title,
          description: video.description,
          publishedAt: video.publishedAt,
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
          thumbnailUrl: video.thumbnailUrl,
          tags: video.tags,
        });
      }
    }
    
    return args.videos.length;
  },
});

// Get user's YouTube channels
export const getUserChannels = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("youtubeChannels")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get channel videos
export const getChannelVideos = query({
  args: {
    channelId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
      .order("desc")
      .collect();
  },
});

// Delete a YouTube channel
export const deleteChannel = mutation({
  args: {
    channelId: v.id("youtubeChannels"),
  },
  handler: async (ctx, args) => {
    const channel = await ctx.db.get(args.channelId);
    if (!channel) {
      throw new Error("Channel not found");
    }
    
    // Delete all videos for this channel
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_channel_id", (q) => q.eq("channelId", channel.channelId))
      .collect();
    
    for (const video of videos) {
      await ctx.db.delete(video._id);
    }
    
    // Delete the channel
    await ctx.db.delete(args.channelId);
    
    return true;
  },
});

