import { defineApi } from "convex/server";
import { v } from "convex/values";

// Define a typesafe API instead of using anyApi
export default defineApi({
  myFunctions: {
    // Reference to listNumbers function - type definitions only, implementation in myFunctions.ts
    listNumbers: {
      args: { count: v.number() },
      returns: v.object({
        viewer: v.union(v.string(), v.null()),
        numbers: v.array(v.number())
      })
    },
    
    // Reference to addNumber function - type definitions only
    addNumber: {
      args: { value: v.number() },
      returns: v.optional(v.id())
    },
    
    // Reference to myAction function - type definitions only
    myAction: {
      args: {
        first: v.number(),
        second: v.string()
      },
      returns: v.void()
    }
  },
});