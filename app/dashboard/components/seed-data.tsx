"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"
import { Database, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SeedDataControls() {
  const { user } = useUser()
  const [isSeeding, setIsSeeding] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  
  const seedData = useMutation(api.seedData.seedUserData)
  const clearData = useMutation(api.seedData.clearUserData)
  
  const handleSeedData = async () => {
    if (!user?.id) return
    
    setIsSeeding(true)
    try {
      const result = await seedData({ userId: user.id })
      toast.success(`Seeded ${result.projects} projects, ${result.customers} customers, and ${result.campaigns} campaigns!`)
    } catch (error) {
      toast.error("Failed to seed data")
    } finally {
      setIsSeeding(false)
    }
  }
  
  const handleClearData = async () => {
    if (!user?.id) return
    
    setIsClearing(true)
    try {
      const result = await clearData({ userId: user.id })
      toast.success(`Cleared all data: ${result.deleted.projects} projects, ${result.deleted.customers} customers, ${result.deleted.campaigns} campaigns, and ${result.deleted.insights} insights!`)
    } catch (error) {
      toast.error("Failed to clear data")
    } finally {
      setIsClearing(false)
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Use these controls to populate your dashboard with sample data or clear existing data for testing.
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className="flex-1"
          >
            <Database className={`h-4 w-4 mr-2 ${isSeeding ? 'animate-pulse' : ''}`} />
            {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
          </Button>
          <Button 
            variant="outline"
            onClick={handleClearData}
            disabled={isClearing}
            className="flex-1"
          >
            <Trash2 className={`h-4 w-4 mr-2 ${isClearing ? 'animate-pulse' : ''}`} />
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

