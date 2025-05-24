import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedUserData = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Clear existing data for this user
    const existingProjects = await ctx.db
      .query("projects")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    const existingCustomers = await ctx.db
      .query("customers")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    const existingCampaigns = await ctx.db
      .query("marketingCampaigns")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    // Delete existing data
    for (const project of existingProjects) {
      await ctx.db.delete(project._id);
    }
    for (const customer of existingCustomers) {
      await ctx.db.delete(customer._id);
    }
    for (const campaign of existingCampaigns) {
      await ctx.db.delete(campaign._id);
    }
    
    // Seed projects
    const projects = [
      {
        name: "SaaS Platform MVP",
        description: "Building the core features for our SaaS platform",
        progress: 0.75,
        status: "in-progress",
        userId: args.userId,
        createdAt: now - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: now,
      },
      {
        name: "Mobile App Development",
        description: "Native mobile app for iOS and Android",
        progress: 0.45,
        status: "in-progress",
        userId: args.userId,
        createdAt: now - (20 * 24 * 60 * 60 * 1000), // 20 days ago
        updatedAt: now,
      },
      {
        name: "API Documentation",
        description: "Comprehensive API documentation for developers",
        progress: 0.9,
        status: "in-progress",
        userId: args.userId,
        createdAt: now - (15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: now,
      },
      {
        name: "User Analytics Dashboard",
        description: "Internal dashboard for tracking user metrics",
        progress: 0.25,
        status: "in-progress",
        userId: args.userId,
        createdAt: now - (10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: now,
      },
    ];
    
    // Seed customers
    const customers = [
      {
        name: "TechCorp Inc.",
        email: "contact@techcorp.com",
        status: "customer",
        value: 5000,
        userId: args.userId,
        createdAt: now - (45 * 24 * 60 * 60 * 1000), // 45 days ago
        updatedAt: now,
      },
      {
        name: "StartupXYZ",
        email: "hello@startupxyz.com",
        status: "customer",
        value: 2500,
        userId: args.userId,
        createdAt: now - (35 * 24 * 60 * 60 * 1000), // 35 days ago
        updatedAt: now,
      },
      {
        name: "Enterprise Solutions Ltd",
        email: "sales@enterprise.com",
        status: "opportunity",
        value: 15000,
        userId: args.userId,
        createdAt: now - (25 * 24 * 60 * 60 * 1000), // 25 days ago
        updatedAt: now,
      },
      {
        name: "Digital Agency Pro",
        email: "info@digitalagency.com",
        status: "opportunity",
        value: 8000,
        userId: args.userId,
        createdAt: now - (20 * 24 * 60 * 60 * 1000), // 20 days ago
        updatedAt: now,
      },
      {
        name: "Growth Startup",
        email: "team@growthstartup.com",
        status: "lead",
        value: 3000,
        userId: args.userId,
        createdAt: now - (15 * 24 * 60 * 60 * 1000), // 15 days ago
        updatedAt: now,
      },
      {
        name: "Innovation Labs",
        email: "contact@innovationlabs.com",
        status: "lead",
        value: 4500,
        userId: args.userId,
        createdAt: now - (10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: now,
      },
      {
        name: "Future Tech Co",
        email: "hello@futuretech.com",
        status: "lead",
        value: 6000,
        userId: args.userId,
        createdAt: now - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: now,
      },
    ];
    
    // Seed marketing campaigns
    const campaigns = [
      {
        name: "Q4 Growth Campaign",
        description: "Focused on acquiring enterprise customers",
        status: "active",
        budget: 10000,
        spent: 6500,
        userId: args.userId,
        createdAt: now - (30 * 24 * 60 * 60 * 1000), // 30 days ago
        updatedAt: now,
      },
      {
        name: "Content Marketing Initiative",
        description: "Blog posts and educational content",
        status: "active",
        budget: 5000,
        spent: 3200,
        userId: args.userId,
        createdAt: now - (20 * 24 * 60 * 60 * 1000), // 20 days ago
        updatedAt: now,
      },
      {
        name: "Social Media Ads",
        description: "LinkedIn and Twitter advertising",
        status: "paused",
        budget: 3000,
        spent: 2800,
        userId: args.userId,
        createdAt: now - (40 * 24 * 60 * 60 * 1000), // 40 days ago
        updatedAt: now,
      },
    ];
    
    // Insert seed data
    for (const project of projects) {
      await ctx.db.insert("projects", project);
    }
    
    for (const customer of customers) {
      await ctx.db.insert("customers", customer);
    }
    
    for (const campaign of campaigns) {
      await ctx.db.insert("marketingCampaigns", campaign);
    }
    
    return {
      projects: projects.length,
      customers: customers.length,
      campaigns: campaigns.length,
    };
  },
});

export const clearUserData = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Clear all user data
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
    
    const insights = await ctx.db
      .query("insights")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    
    // Delete all data
    for (const project of projects) {
      await ctx.db.delete(project._id);
    }
    for (const customer of customers) {
      await ctx.db.delete(customer._id);
    }
    for (const campaign of campaigns) {
      await ctx.db.delete(campaign._id);
    }
    for (const insight of insights) {
      await ctx.db.delete(insight._id);
    }
    
    return {
      deleted: {
        projects: projects.length,
        customers: customers.length,
        campaigns: campaigns.length,
        insights: insights.length,
      }
    };
  },
});

