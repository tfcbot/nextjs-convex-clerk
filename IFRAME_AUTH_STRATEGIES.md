# How Coding Tools Solve Authentication in Iframe Previews

## The Core Problem

OAuth/authentication in iframes is fundamentally broken due to:
- Third-party cookie blocking (Safari, Chrome, Firefox)
- Same-site cookie restrictions
- Popup blockers
- Security policies (CSP, X-Frame-Options)

## Proven Solutions Used by Major Platforms

### 1. **Demo/Mock Data Mode** (Most Common)
**Used by:** CodeSandbox, StackBlitz, Glitch, Replit

```typescript
// When in iframe, show demo data instead of requiring auth
const isDemoMode = isInIframe();

const useUser = () => {
  if (isDemoMode) {
    return {
      user: { 
        name: "Demo User",
        email: "demo@example.com",
        id: "demo-123"
      },
      isLoading: false,
      isSignedIn: true
    };
  }
  return useRealUser();
};
```

**Advantages:**
- Works immediately in iframes
- No authentication friction
- Perfect for previews/demos
- Users can see full functionality

### 2. **Parent-Child Token Passing**
**Used by:** Figma embeds, Notion blocks, advanced tools

```typescript
// Parent window has real auth, passes token to iframe
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted-parent.com') return;
  
  if (event.data.type === 'AUTH_TOKEN') {
    setAuthToken(event.data.token);
    setUser(event.data.user);
  }
});

// Request auth from parent
window.parent.postMessage({ type: 'REQUEST_AUTH' }, '*');
```

### 3. **Guest Mode with Limitations**
**Used by:** GitHub Codespaces, Observable notebooks

```typescript
const useFeatures = () => {
  const { isSignedIn } = useAuth();
  const inIframe = isInIframe();
  
  return {
    canSave: isSignedIn && !inIframe,
    canShare: true, // Always available
    canFork: isSignedIn && !inIframe,
    canView: true, // Always available
    showAuthPrompt: !isSignedIn && !inIframe
  };
};
```

### 4. **Server-Side Rendering with Static Tokens**
**Used by:** Vercel previews, Netlify deploys

```typescript
// Generate preview with server-side auth context
export async function getServerSideProps({ query }) {
  if (query.preview === 'true') {
    return {
      props: {
        user: DEMO_USER,
        data: DEMO_DATA,
        isPreview: true
      }
    };
  }
  // Normal auth flow...
}
```

## Supabase-Specific Solutions

### Anonymous/Guest Users
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Create anonymous session for iframe users
const useSupabaseAuth = () => {
  const inIframe = isInIframe();
  
  useEffect(() => {
    if (inIframe) {
      // Sign in as anonymous user
      supabase.auth.signInAnonymously();
    }
  }, [inIframe]);
};
```

### Row Level Security for Demo Data
```sql
-- RLS policy for demo/preview mode
CREATE POLICY "Enable read for demo users" ON public.todos
  FOR SELECT USING (
    user_id = '00000000-0000-0000-0000-000000000000' -- Demo user ID
    OR auth.uid() = user_id
  );
```

## Your Best Options for Clerk + Convex

### Option 1: Enhanced Demo Mode (Recommended)
```typescript
// components/AuthProvider.tsx
import { isInIframe } from '@/lib/iframe-detection';
import { MockUserProvider } from '@/lib/mock-user-provider';

export function AuthProvider({ children }) {
  const inIframe = isInIframe();
  
  if (inIframe) {
    return (
      <MockUserProvider demoData={RICH_DEMO_DATA}>
        {children}
      </MockUserProvider>
    );
  }
  
  return (
    <ConvexProviderWithClerk useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

### Option 2: Convex Anonymous Users
```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: "https://your-clerk-domain.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
  // Allow anonymous access for iframe previews
  anonymousAccess: true,
};

// In your iframe detection
const { isLoading, isAuthenticated } = useConvexAuth();
const inIframe = isInIframe();

const effectiveUser = useMemo(() => {
  if (inIframe && !isAuthenticated) {
    return DEMO_USER; // Fallback to demo data
  }
  return realUser;
}, [inIframe, isAuthenticated, realUser]);
```

### Option 3: Hybrid Approach
```typescript
// Show different UI based on context
function App() {
  const inIframe = isInIframe();
  
  if (inIframe) {
    return (
      <div className="iframe-mode">
        <DemoModeHeader />
        <AppContent demoMode={true} />
        <ViewFullAppButton />
      </div>
    );
  }
  
  return (
    <div className="full-mode">
      <ClerkProvider>
        <ConvexProvider>
          <AppContent demoMode={false} />
        </ConvexProvider>
      </ClerkProvider>
    </div>
  );
}
```

## Implementation Priority

1. **Start with Demo Mode**: Fastest path to working iframe previews
2. **Add Auth Awareness**: Show "Sign in to save" prompts
3. **Progressive Enhancement**: Add parent-child communication if needed
4. **Consider Anonymous Auth**: For apps that need server state

## Real-World Examples

- **CodeSandbox**: Full demo mode, "Sign in to save" prompts
- **StackBlitz**: Guest mode with limited features
- **Replit**: Anonymous users with temporary storage
- **Figma**: Parent-child token passing for authenticated embeds
- **Observable**: Public notebooks work everywhere, private ones need auth

The key insight: **Don't fight the browser restrictions** - embrace them by providing great demo experiences that convert to full authentication when users want to save/personalize.
