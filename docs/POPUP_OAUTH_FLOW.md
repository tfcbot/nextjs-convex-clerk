# Popup OAuth Flow for Iframe Authentication

This document explains the popup OAuth flow implementation for secure authentication in iframe-based applications.

## Overview

When your Next.js + Convex + Clerk app runs inside an iframe (e.g., in a sandbox environment like CodeSandbox, Replit, or embedded in another site), traditional OAuth flows can break due to browser security restrictions. The popup OAuth flow solves this by:

1. **Opening authentication in the parent window** (not the iframe)
2. **Using window.postMessage** for secure communication between iframe and parent
3. **Automatically reloading the iframe** when authentication completes

This is the same pattern used by industry leaders like Replit, CodeSandbox, and Vercel.

## How It Works

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Parent Window │    │      Iframe     │    │   Clerk OAuth   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
     1.  │                   User clicks "Sign In"       │
         │                       │                       │
     2.  │  ←─ postMessage ──────┤                       │
         │   "clerk:signin-req"  │                       │
         │                       │                       │
     3.  ├─ redirectToSignIn() ─────────────────────────→│
         │                       │                       │
     4.  │  User completes authentication               │
         │  ←─────────────────────────────────────────────┤
         │                       │                       │
     5.  ├─ postMessage ─────────→│                       │
         │   "clerk:auth-ready"  │                       │
         │                       │                       │
     6.  │                   window.location.reload()    │
         │                       │                       │
     7.  │                   ✅ Iframe now authenticated │
```

## Key Components

### 1. PopupAuthManager (`lib/popup-auth.ts`)

The core class that handles iframe authentication:

```typescript
import { usePopupAuth } from '@/lib/popup-auth';

function MyComponent() {
  const auth = usePopupAuth();
  
  const handleSignIn = async () => {
    await auth.signIn(); // Opens popup OAuth flow
  };
  
  return (
    <button onClick={handleSignIn}>
      Sign In
    </button>
  );
}
```

### 2. IframeAwareAuth Component (`components/IframeAwareAuth.tsx`)

React component that automatically detects iframe context and uses appropriate auth flow:

```typescript
import { IframeAwareAuth } from '@/components/IframeAwareAuth';

function App() {
  return (
    <IframeAwareAuth>
      <AuthenticatedContent />
    </IframeAwareAuth>
  );
}
```

### 3. Enhanced ClerkProvider (`components/ConditionalClerkProvider.tsx`)

Automatically configures Clerk for iframe scenarios:

- Sets `isSatellite={true}` when in iframe
- Customizes navigation behavior
- Optimizes appearance for iframe display

## Message Types

The system uses `window.postMessage` for secure communication:

### From Iframe to Parent

- `clerk:signin-request` - Request sign-in via popup
- `clerk:signout-request` - Request sign-out
- `clerk:token-request` - Request auth token

### From Parent to Iframe

- `clerk:auth-ready` - Authentication completed
- `clerk:token-response` - Auth token response
- `clerk:auth-state-changed` - Auth state changed

## Security Considerations

1. **Origin Validation**: In production, validate `event.origin` in message listeners
2. **Token Handling**: Tokens are never stored in iframe, only requested as needed
3. **Timeout Protection**: Sign-in requests timeout after 5 minutes
4. **HTTPS Only**: OAuth flows require HTTPS in production

## Integration Examples

### Basic Usage

```typescript
"use client";

import { IframeAwareAuth } from '@/components/IframeAwareAuth';
import { usePopupAuth, isInIframe } from '@/lib/popup-auth';

export default function MyApp() {
  return (
    <div>
      <h1>My App {isInIframe() && '(Iframe Mode)'}</h1>
      <IframeAwareAuth>
        <AuthenticatedContent />
      </IframeAwareAuth>
    </div>
  );
}

function AuthenticatedContent() {
  const auth = usePopupAuth();
  
  const handleSignOut = async () => {
    await auth.signOut();
  };
  
  return (
    <div>
      <p>Welcome! You are signed in.</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}
```

### Parent Window Setup

If your app will contain iframes with authentication, add this to your parent window:

```typescript
import { setupParentAuthHandlers } from '@/lib/popup-auth';

// In your parent window app
useEffect(() => {
  setupParentAuthHandlers();
}, []);
```

### Custom Token Usage

```typescript
import { usePopupAuth } from '@/lib/popup-auth';

function ApiCall() {
  const auth = usePopupAuth();
  
  const makeAuthenticatedRequest = async () => {
    const token = await auth.getToken();
    
    const response = await fetch('/api/data', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.json();
  };
  
  return <button onClick={makeAuthenticatedRequest}>Fetch Data</button>;
}
```

## Testing

### Test in Iframe

Create a test HTML file to test your app in an iframe:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Iframe Test</title>
</head>
<body>
    <h1>Parent Window</h1>
    <iframe 
        src="http://localhost:3000"
        width="800" 
        height="600"
        style="border: 1px solid #ccc;"
    ></iframe>
</body>
</html>
```

### Environment Variables

Make sure these are set:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=your_clerk_issuer_domain
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

## Troubleshooting

### Common Issues

1. **"Sign-in popup blocked"**
   - Solution: Ensure user interaction triggered the sign-in request

2. **"Auth timeout"**
   - User may have closed the popup window
   - Check browser popup blocker settings

3. **"Token not received"**
   - Check parent window has Clerk properly configured
   - Verify message passing is working

4. **"Iframe not detected properly"**
   - Check `window.parent !== window` logic
   - Verify iframe is from different origin

### Debug Mode

Add this to see message passing in action:

```typescript
// In development, log all messages
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('message', (event) => {
    console.log('Message received:', event.data);
  });
}
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ⚠️ IE not supported (uses modern JS features)

## Best Practices

1. **Always validate origins** in production message listeners
2. **Use HTTPS** for production deployments
3. **Test popup behavior** across different browsers
4. **Implement proper error handling** for network failures
5. **Provide user feedback** during auth flows
6. **Consider accessibility** for keyboard navigation

## Migration from Standard Auth

To migrate existing Clerk auth to support iframe scenarios:

1. Replace `<Authenticated>` and `<Unauthenticated>` with `<IframeAwareAuth>`
2. Replace `useAuth()` with `usePopupAuth()` in iframe contexts
3. Add `setupParentAuthHandlers()` to parent windows
4. Update your Clerk configuration to use `ConditionalClerkProvider`

The migration is backward compatible - existing non-iframe apps continue working normally.
