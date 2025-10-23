"use client";

import { ReactNode } from "react";
import { isDemo } from "@/lib/app-mode";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useMockAwareAuth } from "@/lib/mock-user-provider";
import ConditionalClerkProvider from "./ConditionalClerkProvider";

// Demo mode: create dummy client (not used)
// Production mode: create real client
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl 
  ? new ConvexReactClient(convexUrl)
  : new ConvexReactClient("https://demo.convex.cloud"); // Dummy URL for demo

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  // Demo mode: skip Convex entirely
  if (isDemo()) {
    return (
      <ConditionalClerkProvider>
        {children}
      </ConditionalClerkProvider>
    );
  }

  // Production mode: use Convex with Clerk auth
  return (
    <ConditionalClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useMockAwareAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ConditionalClerkProvider>
  );
}
