# Micro-App Implementation Quick Start

## 🚀 5-Minute Setup

### 1. Share Clerk Configuration
```bash
# Both @flowslash/.env.local and @nextjs-convex-clerk/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY
```

### 2. Share Convex Backend
```bash
# Both apps point to same deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment
```

### 3. Use Utilities in Micro-Apps
```typescript
// components/MicroAppWrapper.tsx
import { useMicroAppContext, MicroAppLoader } from '@/lib/micro-app-utils';

export function MicroAppWrapper({ children }: { children: React.ReactNode }) {
  const { isMicroApp, isAuthenticated, user } = useMicroAppContext();

  if (!isAuthenticated) {
    return <MicroAppLoader />;
  }

  return (
    <div className={isMicroApp ? 'micro-app-embedded' : ''}>
      {children}
    </div>
  );
}
```

## 📱 Example: Portfolio Micro-App

### Structure
```
@flowslash/
└─ app/
   └─ apps/
      └─ portfolio/
         ├─ layout.tsx
         └─ page.tsx
```

### Implementation
```typescript
// @flowslash/app/apps/portfolio/page.tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useMicroAppContext, navigateToApp } from '@/lib/micro-app-utils';

export default function PortfolioApp() {
  const { user } = useUser();
  const { isMicroApp, isAuthenticated } = useMicroAppContext();
  const portfolio = useQuery(api.portfolios.getMyPortfolio, {});

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="p-6">
      {isMicroApp && (
        <button 
          onClick={() => navigateToApp('main')}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back to Main
        </button>
      )}
      
      <h1 className="text-3xl font-bold mb-4">{user?.firstName}'s Portfolio</h1>
      
      <div className="space-y-4">
        {portfolio?.projects?.map((project) => (
          <div key={project} className="border p-4 rounded-lg">
            {project}
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button 
          onClick={() => navigateToApp('analytics')}
          className="bg-blue-600 text-white p-3 rounded-lg"
        >
          View Analytics
        </button>
        <button 
          onClick={() => navigateToApp('projects')}
          className="bg-blue-600 text-white p-3 rounded-lg"
        >
          Manage Projects
        </button>
      </div>
    </div>
  );
}
```

## 🗂️ Multi-Micro-App Setup

### Directory Structure
```
@flowslash/
└─ app/
   ├─ layout.tsx          (Wraps with ClerkProvider)
   ├─ page.tsx            (Main dashboard)
   └─ apps/               (Micro-apps container)
      ├─ portfolio/
      ├─ analytics/
      ├─ projects/
      └─ settings/
```

### Each Micro-App is a Route
```typescript
// @flowslash/app/apps/analytics/page.tsx
'use client';

export default function AnalyticsApp() {
  return (
    <div>
      {/* Uses same Clerk session */}
      {/* Uses same Convex backend */}
    </div>
  );
}
```

## 🔄 Navigation Between Micro-Apps

### From Any Micro-App
```typescript
import { navigateToApp } from '@/lib/micro-app-utils';

// Navigate to another micro-app
<button onClick={() => navigateToApp('analytics')}>
  Go to Analytics
</button>

// Navigate back to main app
<button onClick={() => navigateToApp('main')}>
  Back to Dashboard
</button>
```

## 💾 Shared Data Example

### Convex Schema (Shared)
```typescript
// convex/schema.ts
export default defineSchema({
  users: defineTable({
    clerkId: v.string().indexed(),
    name: v.string(),
  }),
  
  portfolios: defineTable({
    userId: v.id("users"),
    title: v.string(),
  }).index("by_userId", ["userId"]),
  
  analytics: defineTable({
    userId: v.id("users"),
    views: v.number(),
  }).index("by_userId", ["userId"]),
});
```

### Shared User Context
```typescript
// convex/users.ts
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.sub))
      .unique();
  },
});

// Both micro-apps can use this
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

## 🎯 Use Cases

### Portfolio App
- User creates portfolio
- Other micro-apps reference it
- Real-time updates via Convex

### Analytics Dashboard
- Tracks views/interactions
- Queries portfolio data
- Shows cross-app metrics

### Project Manager
- Create/manage projects
- Link to portfolio
- Track in analytics

### Settings
- Global user preferences
- Billing info
- Privacy settings

## 🔒 Security Checklist

```typescript
// ✅ Validate user in Convex
export const getPortfolio = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // ...
  },
});

// ✅ Check user ownership
if (portfolio.userId !== currentUser._id) {
  throw new Error("Unauthorized");
}

// ✅ Use Clerk automatically
// No manual token passing needed with same Clerk instance
```

## 🧪 Testing Cross-App Features

```typescript
// Test 1: Sign in at main app
1. Visit flowslash.com
2. Sign in with Clerk
3. Click "Go to Portfolio"

// Test 2: Verify session persists
1. Should be already authenticated
2. useUser() works
3. useQuery() works with same user

// Test 3: Cross-app data
1. Update portfolio in portfolio app
2. See update in analytics app
3. Changes are real-time ✓

// Test 4: Sign out
1. Sign out at main app
2. Navigate to micro-app
3. Should redirect to sign in ✓
```

## 📊 Benefits of This Architecture

| Benefit | How |
|---------|-----|
| **Single Auth** | All apps share Clerk session |
| **Shared Data** | All apps use same Convex backend |
| **Real-Time Sync** | Convex subscriptions work cross-app |
| **Easy Routing** | Standard Next.js routes (/apps/\*) |
| **Scalable** | Add new micro-apps as new routes |
| **User-Friendly** | No re-authentication needed |
| **Developer-Friendly** | Uses familiar Next.js patterns |

## 🚀 Production Deployment

### Single Deployment
```bash
# Deploy single @flowslash/ instance with embedded micro-apps
# Everything runs from flowslash.com/
```

### Reverse Proxy
```nginx
upstream main { server localhost:3000; }
upstream apps { server localhost:3001; }

server {
  location / { proxy_pass http://main; }
  location /apps { proxy_pass http://apps; }
}
```

### Next.js basePath
```typescript
// @nextjs-convex-clerk/next.config.js
module.exports = {
  basePath: '/apps',
};

// Routes accessible at /apps/*
```

## ✅ Implementation Checklist

- [ ] Share Clerk publishable key across apps
- [ ] Point both apps to same Convex deployment
- [ ] Create /apps routes in main app
- [ ] Use useMicroAppContext() in micro-apps
- [ ] Test cross-app navigation
- [ ] Verify shared data persistence
- [ ] Test sign out invalidates all apps
- [ ] Configure production routing
- [ ] Document custom micro-apps

This gives you a scalable, user-friendly multi-app platform! 🎉
