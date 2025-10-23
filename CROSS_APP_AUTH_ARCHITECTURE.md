# Cross-App Authentication Architecture: Sharing Auth Between @flowslash/ and @nextjs-convex-clerk/

## 🎯 Vision
Turn @nextjs-convex-clerk/ into a suite of **micro-apps** that @flowslash/ can embed as iframes while sharing a single Clerk authentication session. Users sign in once at @flowslash/ and automatically have access to all micro-apps.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│               @flowslash/                           │
│  (Main App - Authentication Gateway)                │
│  ├─ Clerk Authentication                            │
│  ├─ User Session Management                         │
│  └─ Micro-App Embedding & Orchestration             │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┬─────────────┬──────────┐
        │                 │             │          │
   ┌────▼────┐     ┌──────▼──┐   ┌─────▼──┐   ┌──▼─────┐
   │ Micro-  │     │ Micro-  │   │Micro-  │   │Micro-  │
   │ App 1   │     │ App 2   │   │App 3   │   │App 4   │
   │(Iframe) │     │(Iframe) │   │(Iframe)│   │(Iframe)│
   └─────────┘     └─────────┘   └────────┘   └────────┘
   (Portfolio)   (Analytics)  (Projects)  (Settings)
```

## 🔐 Authentication Flow

### Phase 1: User Authenticates at Main App (@flowslash/)
1. User visits flowslash.com
2. Signs in via Clerk (normal ClerkProvider setup)
3. Clerk creates session with auth token
4. User state stored in localStorage

### Phase 2: Micro-App Context Synchronization
1. User navigates to embedded micro-app (e.g., `/apps/portfolio`)
2. Iframe loads @nextjs-convex-clerk/ as sub-application
3. Micro-app detects it's in iframe context
4. Requests auth context from parent via postMessage
5. Parent sends encrypted auth token + user data
6. Micro-app initializes with shared session

### Phase 3: Cross-App Operations
- All micro-apps share same Convex backend
- User queries/mutations include same user context
- Session invalidation in parent automatically invalidates all micro-apps

## 🛠️ Implementation: Same-Domain Setup (Recommended)

### Domain Structure
```
flowslash.com/                    → Main app (@flowslash/)
flowslash.com/apps/               → Micro-apps container
├─ flowslash.com/apps/portfolio   → nextjs-convex-clerk routes
├─ flowslash.com/apps/analytics   → nextjs-convex-clerk routes
└─ flowslash.com/apps/dashboard   → nextjs-convex-clerk routes
```

### Why Same-Domain is Better
- ✅ Shared localStorage (same origin)
- ✅ Cookies work automatically
- ✅ No postMessage complexity
- ✅ Shared ClerkProvider works seamlessly

### Implementation Pattern
```typescript
// @flowslash/ app/layout.tsx - Wraps everything
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      {/* All routes inherit this Clerk context */}
      {children}
    </ClerkProvider>
  );
}

// @nextjs-convex-clerk routes (embedded at /apps/*)
// Simply use the inherited Clerk context
export default function PortfolioApp() {
  const { user } = useUser(); // Works! Same session
  return <div>{user?.firstName}'s Portfolio</div>;
}
```

## 📋 Setup Steps

### Step 1: Merge Clerk Configurations
```bash
# Both apps must use the same Clerk publishable key
# @flowslash/.env.local and @nextjs-convex-clerk/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXX
CLERK_SECRET_KEY=sk_test_XXX
```

### Step 2: Merge Convex Backend
```bash
# Point both apps to same Convex deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment
```

### Step 3: Update Routing

**Option A: Deploy as Single App**
```bash
# Copy routes from @nextjs-convex-clerk into @flowslash
@flowslash/
├─ app/
│  ├─ apps/
│  │  ├─ portfolio/
│  │  ├─ analytics/
│  │  └─ projects/
```

**Option B: Use basePath**
```typescript
// @nextjs-convex-clerk/next.config.js
module.exports = {
  basePath: '/apps',
};

// Serves at flowslash.com/apps/*
```

**Option C: Reverse Proxy**
```nginx
upstream flowslash { server :3000; }
upstream microapps { server :3001; }

server {
  location / { proxy_pass http://flowslash; }
  location /apps/ { proxy_pass http://microapps; }
}
```

### Step 4: Shared Convex Schema
```typescript
// convex/schema.ts - Used by all micro-apps
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Shared user data from Clerk
  users: defineTable({
    clerkId: v.string().unique().indexed(),
    email: v.string(),
    name: v.string(),
    plan: v.string(), // premium, pro, free
  }),

  // Micro-app specific data
  portfolios: defineTable({
    userId: v.id("users"),
    title: v.string(),
    projects: v.string(),
  }).index("by_userId", ["userId"]),

  projects: defineTable({
    userId: v.id("users"),
    title: v.string(),
    status: v.string(), // active, archived
  }).index("by_userId", ["userId"]),

  analytics: defineTable({
    userId: v.id("users"),
    metric: v.string(),
    value: v.number(),
  }).index("by_userId", ["userId"]),
});
```

### Step 5: User Access Control in Convex
```typescript
// convex/users.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // All queries validated by auth
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.sub))
      .unique();

    return user;
  },
});

// Micro-apps use this to get current user
export const getMyPortfolio = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.users.getCurrentUser, {});
    if (!user) throw new Error("Not authenticated");
    
    return await ctx.db
      .query("portfolios")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();
  },
});
```

## 🎯 Routing Architecture

### @flowslash/ Routes (Main App)
```
/ → Dashboard
/apps → Apps Hub / Directory
/settings → User Settings
/billing → Billing
```

### @nextjs-convex-clerk/ Routes (Micro-Apps)
```
/apps/portfolio → Portfolio Builder
/apps/analytics → Analytics Dashboard
/apps/projects → Project Manager
/apps/store → App Store / Integrations
```

### Navigation Between Apps
```typescript
// In micro-app, navigate to other apps
<Link href="/apps/analytics">Go to Analytics</Link>

// Back to flowslash main
<Link href="/">Back to Dashboard</Link>
```

## 🔒 Security

### Token Isolation
```typescript
// Convex automatically validates Clerk tokens
// Each request includes user identity
// No manual token passing needed in same-domain setup
```

### Row-Level Security
```typescript
// All Convex functions must validate user ownership
export const getUserData = query({
  args: { dataId: v.id("portfolios") },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    const data = await ctx.db.get(args.dataId);

    // Prevent unauthorized access
    if (data.userId !== user.sub) {
      throw new Error("Unauthorized");
    }

    return data;
  },
});
```

## 💾 Data Sharing

### Real-Time Sync
```typescript
// Change in portfolio app appears everywhere
const updatePortfolio = mutation({
  args: { content: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    const userData = await getUserRecord(ctx, user.sub);
    
    await ctx.db.patch(userData.portfolioId, {
      content: args.content,
    });
  },
});

// Analytics app sees update via subscription
const PortfolioStats = () => {
  const portfolio = db.useQuery(api.portfolios.getMyPortfolio);
  return <div>{portfolio.content}</div>;
};
```

## 📊 Benefits of This Architecture

| Aspect | Benefit |
|--------|---------|
| **Authentication** | Single Clerk session shared across all apps |
| **Data** | Unified Convex backend, real-time sync |
| **Development** | Familiar Next.js patterns throughout |
| **Deployment** | Single deployment or use basePath |
| **Performance** | Native browser caching, no iframe overhead |
| **User Experience** | Seamless navigation between apps |
| **Scalability** | Add new micro-apps by creating new routes |

## 🚀 Getting Started

### Phase 1: Setup (Week 1)
1. Share Clerk publishable key across apps
2. Point both to same Convex deployment
3. Update convex schema with shared tables

### Phase 2: Integration (Week 2)
1. Create /apps routes in @flowslash
2. Move micro-app routes from @nextjs-convex-clerk
3. Test cross-app navigation

### Phase 3: Deployment (Week 3)
1. Configure deployment routing (if separate instances)
2. Test production auth flow
3. Monitor session persistence

## ✅ Verification Checklist

- [ ] Both apps use same `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] Both apps point to same `NEXT_PUBLIC_CONVEX_URL`
- [ ] Clerk webhook configured for both domains
- [ ] Convex functions validate user identity
- [ ] localStorage/cookies persist across routes
- [ ] Sign in at main app grants access to micro-apps
- [ ] Sign out at main app invalidates all micro-apps
- [ ] Real-time data updates work across apps

## 🔄 Example Flow

```typescript
// 1. User signs in at flowslash.com
const handleSignIn = async () => {
  await signIn(); // Uses shared Clerk
};

// 2. Navigate to micro-app
<Link href="/apps/portfolio">View Portfolio</Link>

// 3. Micro-app automatically has same user context
const PortfolioApp = () => {
  const { user } = useUser(); // Same user! ✅
  const portfolio = useQuery(api.portfolios.getMyPortfolio, {});
  
  return <UserPortfolio data={portfolio} />;
};

// 4. Update in micro-app visible everywhere
const updatePortfolio = async (content) => {
  await updatePortfolioMutation({ content });
  // Real-time update propagates to all subscribed components
};

// 5. Sign out at main app
const handleLogout = async () => {
  await signOut();
  // Automatically signs out all micro-apps ✅
};
```

This gives you enterprise multi-app architecture with the simplicity of unified authentication! 🎉
