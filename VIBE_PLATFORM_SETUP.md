# Vibe Platform Setup Guide

## 🎯 Quick Start (Demo Mode - Works Immediately)

For vibe platform users, everything works **out of the box** with no configuration needed.

### Default Environment
```bash
# This is the default - copy to .env.local to start
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_APP_MODE=preview
```

That's it! The app now:
- ✅ Works without Clerk keys
- ✅ Works without Convex setup
- ✅ Includes demo user (automatically logged in)
- ✅ Includes sample data
- ✅ All features visible and testable
- ✅ Works in iframes/sandboxes

## 🚀 Deploying Your Own Instance

When you want to deploy this app to production with real authentication:

### Step 1: Get Clerk Keys
1. Go to https://dashboard.clerk.com
2. Create an application
3. Copy your **Publishable Key** and **Secret Key**

### Step 2: Get Convex Deployment
1. Go to https://dashboard.convex.dev
2. Create a deployment
3. Copy your **Deployment URL**

### Step 3: Configure Environment
```bash
# .env.local (production)

# DISABLE demo mode
NEXT_PUBLIC_DEMO_MODE=false

# Add your Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY
CLERK_SECRET_KEY=sk_test_YOUR_KEY

# Add your Convex deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud/
CONVEX_DEPLOYMENT=your-deployment
```

### Step 4: Deploy
```bash
# Push to GitHub
git push

# Deploy to Vercel
# https://vercel.com/new
# Select this repository
# Environment variables are auto-filled from .env.local

# Or deploy to your own server
npm run build
npm run start
```

## 🔄 Two-Mode Architecture

### Demo Mode (Vibe Platform)
```
NEXT_PUBLIC_DEMO_MODE=true
├─ No Clerk required
├─ No Convex required
├─ Mock authenticated user
├─ Sample data
├─ All features visible
└─ Changes cleared on refresh
```

### Production Mode (After Deployment)
```
NEXT_PUBLIC_DEMO_MODE=false
├─ Clerk authentication required
├─ Convex backend required
├─ Real user management
├─ Real data persistence
├─ Can be embedded in @flowslash
└─ OAuth providers enabled
```

## 💾 Environment Variables Reference

| Variable | Demo | Production | Purpose |
|----------|------|------------|---------|
| `NEXT_PUBLIC_DEMO_MODE` | `true` | `false` | Enable/disable demo mode |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ❌ | ✅ | Clerk public key |
| `CLERK_SECRET_KEY` | ❌ | ✅ | Clerk secret key |
| `NEXT_PUBLIC_CONVEX_URL` | ❌ | ✅ | Convex deployment URL |
| `CONVEX_DEPLOYMENT` | ❌ | ✅ | Convex deployment name |

## 📋 Checklist: From Vibe Platform to Production

### Before Deployment
- [ ] App works in vibe platform (demo mode)
- [ ] All features tested in preview
- [ ] Satisfied with design/functionality

### Setup Production
- [ ] Create Clerk app → get keys
- [ ] Create Convex deployment → get URL
- [ ] Update `.env.local` with production values
- [ ] Set `NEXT_PUBLIC_DEMO_MODE=false`

### Deploy
- [ ] Push to GitHub
- [ ] Deploy to Vercel (or your host)
- [ ] Verify Clerk login works
- [ ] Verify data persists
- [ ] Test all features with real auth

### Optional: Integrate with @flowslash
- [ ] Share Clerk key with @flowslash team
- [ ] Share Convex deployment URL
- [ ] Your app becomes available as micro-app
- [ ] Users access via `/apps/your-app-name`

## 🎯 Example Deployment Flow

### Vibe Platform (Day 1)
```
1. User creates new app in vibe platform
2. Chooses "Convex + Clerk Starter"
3. App opens with NEXT_PUBLIC_DEMO_MODE=true
4. Everything works immediately
5. User builds features, tests in demo
6. Clicks "Export" button
```

### User's Server (Day 2)
```
1. User downloads/clones app
2. Creates Clerk and Convex accounts
3. Updates .env.local with real keys
4. Deploys to Vercel
5. App now uses real authentication
6. Tells @flowslash team about deployment
```

### @flowslash Integration (Optional, Day 3)
```
1. @flowslash team adds user's Clerk key
2. @flowslash team adds user's Convex deployment
3. User's app becomes available in @flowslash
4. Users can access as /apps/user-app-name
5. Real auth shared across @flowslash platform
```

## 🔐 Security Considerations

### Demo Mode (Vibe Platform)
- ✅ Safe - mock data only
- ✅ No real credentials exposed
- ✅ Ephemeral storage (cleared on refresh)
- ✅ Can't export real data

### Production Mode
- ✅ Clerk handles all authentication
- ✅ Convex validates all requests
- ✅ Environment variables never exposed
- ✅ Real data persisted securely

## ❓ FAQ

**Q: Can I use demo mode in production?**
A: No - demo mode is only for preview/testing. Production requires real Clerk and Convex setup.

**Q: What happens if I don't set Clerk keys?**
A: App falls back to demo mode automatically. Everything still works!

**Q: Can I switch between modes?**
A: Yes! Just change `NEXT_PUBLIC_DEMO_MODE` between `true` and `false` and restart.

**Q: How do I move data from demo to production?**
A: Demo data can't be exported (it's ephemeral). Start fresh in production - your deployed app will have its own database.

**Q: Can my vibe platform app become a micro-app?**
A: Not directly. Export it, deploy it with real auth, then it can be integrated as a micro-app in @flowslash.

## 🎉 You're Ready!

Start with demo mode to explore everything. When ready to deploy, follow the production setup steps. Your app will automatically switch to real authentication!

Questions? Check the docs or ask your platform support team.
