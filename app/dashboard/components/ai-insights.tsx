"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { 
  ArrowUpRight, 
  Brain, 
  ChevronRight, 
  Lightbulb, 
  LineChart, 
  RefreshCw,
  Sparkles, 
  Target, 
  Zap 
} from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Insight = {
  _id: string
  title: string
  description: string
  category: "performance" | "opportunity" | "suggestion" | "trend"
  priority: number
  createdAt: number
  userId: string
}

export function AIInsights() {
  const { user } = useUser()
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Fetch real insights from Convex
  const insights = useQuery(
    api.dashboardOverview.getAIInsights,
    user?.id ? { userId: user.id } : "skip"
  )
  
  const generateInsights = useMutation(api.dashboardOverview.generateAIInsights)
  
  // Loading state
  if (insights === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Insights
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  
  // Handle refresh insights
  const handleRefreshInsights = async () => {
    if (!user?.id) return
    
    setIsRefreshing(true)
    try {
      await generateInsights({ userId: user.id })
      toast.success("Insights refreshed successfully!")
    } catch (error) {
      toast.error("Failed to refresh insights")
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "performance":
        return <Zap className="h-4 w-4" />
      case "opportunity":
        return <Target className="h-4 w-4" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />
      case "trend":
        return <LineChart className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }
  
  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "performance":
        return "text-green-600 bg-green-50 border-green-200"
      case "opportunity":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "suggestion":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "trend":
        return "text-purple-600 bg-purple-50 border-purple-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }
  
  // Sort insights by priority and creation date
  const sortedInsights = insights?.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority // Higher priority first
    }
    return b.createdAt - a.createdAt // Newer first
  }) || []
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6" />
          AI Insights
        </h2>
        <Button 
          variant="outline" 
          onClick={handleRefreshInsights}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Insights
        </Button>
      </div>
      
      {sortedInsights.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No insights available</h3>
            <p className="text-gray-600 mb-4">
              We need more data to generate meaningful insights. Try adding some projects, campaigns, or customers first.
            </p>
            <Button onClick={handleRefreshInsights} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Generate Insights
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedInsights.map((insight) => (
            <Card key={insight._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg border ${getCategoryColor(insight.category)}`}>
                      {getCategoryIcon(insight.category)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {insight.category}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {insight.description}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" className="w-full">
                  View Details
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

