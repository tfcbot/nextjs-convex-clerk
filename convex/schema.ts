import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  numbers: defineTable({
    value: v.number(),
  }),
  
  // AI Insights table
  insights: defineTable({
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("performance"),
      v.literal("opportunity"), 
      v.literal("suggestion"),
      v.literal("trend")
    ),
    priority: v.number(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  // Projects table for analytics data
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    progress: v.optional(v.number()),
    status: v.optional(v.string()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  // Customers table for analytics data
  customers: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    status: v.string(), // lead, opportunity, customer, etc.
    value: v.optional(v.number()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  // Marketing campaigns table for analytics data
  marketingCampaigns: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // active, paused, completed
    budget: v.optional(v.number()),
    spent: v.optional(v.number()),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
