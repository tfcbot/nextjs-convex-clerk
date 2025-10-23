"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useMockAwareAuth } from "@/lib/mock-user-provider";
import ConditionalClerkProvider from "./ConditionalClerkProvider";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConditionalClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useMockAwareAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ConditionalClerkProvider>
  );
}
