import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/server"]);

export default clerkMiddleware(async (auth, req) => {
  // Check if we're running in iframe mode using header detection
  // Environment variables may not be available in edge runtime
  const isIframeMode = req.headers.get('x-iframe-mode') === 'true' || 
                      req.headers.get('referer')?.includes('flowslash.dev') ||
                      req.nextUrl.searchParams.get('iframe') === 'true';
  
  if (isProtectedRoute(req)) {
    if (isIframeMode) {
      // In iframe mode: Allow access but preserve auth context
      // Components will handle authentication with modals instead of redirects
      return;
    } else {
      // Normal mode: Require authentication at middleware level
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
