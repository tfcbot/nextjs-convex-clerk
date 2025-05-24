"use client"

import { Authenticated, Unauthenticated } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { AIInsights } from "./components/ai-insights"
import { SeedDataControls } from "./components/seed-data"
import { Toaster } from "sonner"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <Authenticated>
        <DashboardContent />
      </Authenticated>
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Welcome to SaaSGuide Dashboard</h1>
            <p className="text-gray-600">Please sign in to access your dashboard and AI insights.</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>
    </div>
  )
}

function DashboardContent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SaaSGuide Dashboard</h1>
        <p className="text-gray-600">
          Get AI-powered insights based on your business data and analytics.
        </p>
      </div>
      
      <div className="space-y-8">
        <SeedDataControls />
        <AIInsights />
      </div>
    </div>
  )
}
