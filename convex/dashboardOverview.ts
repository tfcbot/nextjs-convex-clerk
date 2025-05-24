import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAIInsights = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("insights")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(10);
  },
});

export const generateAIInsights = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Clear old insights
    const oldInsights = await ctx.db
      .query("insights")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    for (const insight of oldInsights) {
      await ctx.db.delete(insight._id);
    }
    
    // Get user data for analysis
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    const customers = await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    const campaigns = await ctx.db
      .query("marketingCampaigns")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    const now = Date.now();
    const insights = [];
    
    // Generate performance insights
    if (projects.length > 0) {
      const avgProgress = projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length;
      if (avgProgress > 0.7) {
        insights.push({
          title: "Strong Development Progress",
          description: `Your projects are ${Math.round(avgProgress * 100)}% complete on average. Keep up the excellent momentum!`,
          category: "performance" as const,
          priority: 8,
          userId: args.userId,
          createdAt: now,
          updatedAt: now,
        });
      } else if (avgProgress < 0.3) {
        insights.push({
          title: "Development Progress Needs Attention",
          description: `Your projects are ${Math.round(avgProgress * 100)}% complete on average. Consider reviewing project timelines and resources.`,
          category: "performance" as const,
          priority: 7,
          userId: args.userId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    
    // Generate opportunity insights
    if (customers.length > 0) {
      const leadCount = customers.filter(c => c.status === "lead").length;
      const opportunityCount = customers.filter(c => c.status === "opportunity").length;
      
      if (leadCount > opportunityCount * 2) {
        insights.push({
          title: "Lead Conversion Opportunity",
          description: `You have ${leadCount} leads but only ${opportunityCount} opportunities. Consider nurturing more leads into the sales pipeline.`,
          category: "opportunity" as const,
          priority: 7,
          userId: args.userId,
          createdAt: now,
          updatedAt: now,
        });
      }
      
      const customerCount = customers.filter(c => c.status === "customer").length;
      if (customerCount > 0 && leadCount === 0) {
        insights.push({
          title: "Lead Generation Opportunity",
          description: `You have ${customerCount} customers but no active leads. Consider implementing lead generation strategies to maintain growth.`,
          category: "opportunity" as const,
          priority: 6,
          userId: args.userId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    
    // Generate suggestion insights
    if (campaigns.length === 0 && customers.length > 5) {
      insights.push({
        title: "Marketing Campaign Suggestion",
        description: "With your growing customer base, consider launching a marketing campaign to accelerate growth and engagement.",
        category: "suggestion" as const,
        priority: 6,
        userId: args.userId,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    if (projects.length > 3 && projects.filter(p => p.progress && p.progress > 0.8).length === 0) {
      insights.push({
        title: "Project Completion Focus",
        description: "You have multiple projects in progress. Consider focusing on completing existing projects before starting new ones.",
        category: "suggestion" as const,
        priority: 5,
        userId: args.userId,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    // Generate trend insights
    if (projects.length > 0 && campaigns.length > 0) {
      insights.push({
        title: "Balanced Growth Trend",
        description: "You're maintaining a good balance between product development and marketing efforts. This integrated approach often leads to sustainable growth.",
        category: "trend" as const,
        priority: 5,
        userId: args.userId,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    if (customers.length > 10) {
      const recentCustomers = customers.filter(c => c.createdAt > now - (30 * 24 * 60 * 60 * 1000)); // Last 30 days
      if (recentCustomers.length > customers.length * 0.3) {
        insights.push({
          title: "Strong Customer Growth Trend",
          description: `You've acquired ${recentCustomers.length} new customers in the last 30 days, representing ${Math.round((recentCustomers.length / customers.length) * 100)}% of your total customer base.`,
          category: "trend" as const,
          priority: 6,
          userId: args.userId,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    
    // If no data available, provide getting started insights
    if (projects.length === 0 && customers.length === 0 && campaigns.length === 0) {
      insights.push({
        title: "Getting Started",
        description: "Welcome to SaaSGuide! Start by adding your first project or customer to begin tracking your business metrics.",
        category: "suggestion" as const,
        priority: 9,
        userId: args.userId,
        createdAt: now,
        updatedAt: now,
      });
    }
    
    // Insert new insights
    for (const insight of insights) {
      await ctx.db.insert("insights", insight);
    }
    
    return insights.length;
  },
});

// Helper functions to get data for insights
export const getProjectsOverview = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    return {
      total: projects.length,
      avgProgress: projects.length > 0 ? projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length : 0,
      completed: projects.filter(p => p.progress && p.progress >= 1).length,
    };
  },
});

export const getCustomersOverview = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    return {
      total: customers.length,
      leads: customers.filter(c => c.status === "lead").length,
      opportunities: customers.filter(c => c.status === "opportunity").length,
      customers: customers.filter(c => c.status === "customer").length,
    };
  },
});

export const getCampaignsOverview = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const campaigns = await ctx.db
      .query("marketingCampaigns")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    return {
      total: campaigns.length,
      active: campaigns.filter(c => c.status === "active").length,
      totalBudget: campaigns.reduce((acc, c) => acc + (c.budget || 0), 0),
      totalSpent: campaigns.reduce((acc, c) => acc + (c.spent || 0), 0),
    };
  },
});

