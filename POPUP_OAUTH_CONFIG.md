# Popup OAuth Configuration

This project is now configured to handle OAuth authentication through popups, ensuring compatibility with iframe embeds and avoiding same-site cookie restrictions.

## Key Changes Made

### 1. ClerkProvider Configuration

The `ConditionalClerkProvider` now uses:
- `signInMode="modal"` and `signUpMode="modal"` for popup-based authentication
- `routing="hash"` for better iframe compatibility
- Enhanced appearance settings optimized for popup displays

### 2. Enhanced Iframe Detection

New utilities in `lib/iframe-detection.ts`:
- `shouldUsePopupOAuth()` - Determines when to force popup OAuth
- `isPopupWindow()` - Detects OAuth popup windows
- `isCrossOriginIframe()` - Identifies cross-origin iframe contexts

### 3. PopupAuth Component

A new component (`components/PopupAuth.tsx`) that:
- Automatically configures OAuth for popup mode
- Provides enhanced styling for iframe contexts
- Handles authentication flows properly in embedded scenarios

### 4. Auth Configuration System

`lib/auth-config.ts` provides:
- Dynamic configuration based on current context
- Optimized styling for different scenarios
- CORS headers for cross-origin compatibility

## How It Works

### In Regular Browser Windows
- Uses modal authentication overlays
- Standard OAuth flows with enhanced UX
- Full Clerk functionality preserved

### In iframe Contexts
- Automatically detects iframe embedding
- Forces popup OAuth to avoid same-site issues
- Enhanced visual indicators for iframe mode
- Higher z-index values to appear above parent content

### In OAuth Popup Windows
- Streamlined authentication flow
- Optimized for smaller popup window sizes
- Proper redirect handling back to parent window

## Usage

### Basic Usage
```tsx
import { PopupAuthButtons } from '@/components/PopupAuth';

// This automatically handles popup OAuth when needed
<PopupAuthButtons />
```

### Custom Implementation
```tsx
import PopupAuth from '@/components/PopupAuth';

<PopupAuth 
  mode="signin" 
  onSuccess={() => console.log('Signed in!')}
>
  <CustomButton>Sign In</CustomButton>
</PopupAuth>
```

## Environment Variables

No additional environment variables are required. The system automatically detects iframe contexts and configures OAuth accordingly.

## Browser Compatibility

This configuration works with:
- All modern browsers
- Cross-origin iframe embedding
- Third-party cookie restrictions
- Same-site cookie policies

## Security Considerations

The popup OAuth configuration:
- Uses secure defaults for cross-origin scenarios
- Maintains Clerk's built-in security features
- Handles CORS headers appropriately
- Preserves authentication token security

## Troubleshooting

### OAuth Not Working in iframe
1. Check browser console for CORS errors
2. Ensure popup blockers are disabled for testing
3. Verify the parent site allows iframe OAuth popups

### Styling Issues
1. Check z-index conflicts with parent page
2. Verify modal backdrop is properly positioned
3. Test with different iframe sizes

### Redirect Issues
1. Ensure redirect URLs are properly configured in Clerk dashboard
2. Check that popup windows can communicate with parent
3. Verify hash routing is working correctly

## Testing

To test popup OAuth:

1. **In iframe**: Embed your app in an iframe on another domain
2. **Local testing**: Use `NEXT_PUBLIC_MOCK_AUTH=false` to test real OAuth
3. **Cross-origin**: Test with different origins to verify CORS handling

```html
<!-- Test iframe embed -->
<iframe 
  src="http://localhost:3000" 
  width="800" 
  height="600"
  allow="popup"
></iframe>
```

This configuration ensures your authentication works reliably across all embedding scenarios while maintaining security and user experience standards.
