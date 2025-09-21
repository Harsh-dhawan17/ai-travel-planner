"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Globe,
  MapPin,
  Calendar,
  Users,
  Clock,
  Utensils,
  Bed,
  DollarSign,
  Lightbulb,
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Activity {
  time: string
  activity: string
  location: string
  description: string
  tips?: string
}

interface Meal {
  restaurant: string
  cuisine: string
  description: string
}

interface Day {
  day: number
  title: string
  activities: Activity[]
  meals: {
    breakfast?: Meal
    lunch: Meal
    dinner: Meal
  }
  accommodation?: {
    name: string
    type: string
    location: string
    description: string
  }
}

interface Itinerary {
  destination: string
  duration: string
  overview: string
  days: Day[]
  tips: string[]
  budget: {
    accommodation: string
    food: string
    activities: string
    transportation: string
    total: string
  }
}

export default function ResultsPage() {
  const [tripData, setTripData] = useState<any>(null)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const storedTripData = localStorage.getItem("tripData")

    if (!userData || !storedTripData) {
      router.push("/auth")
      return
    }

    const parsedTripData = JSON.parse(storedTripData)
    setTripData(parsedTripData)
    generateItinerary(parsedTripData)
  }, [router])

  const generateItinerary = async (data: any) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to generate itinerary")
      }

      const result = await response.json()
      setItinerary(result.itinerary)
    } catch (err) {
      setError("Failed to generate your itinerary. Please try again.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Perfect Itinerary</h2>
          <p className="text-gray-600">Our AI is analyzing thousands of options to craft your ideal trip...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/planner">
            <Button>Try Again</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!itinerary) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">TravelAI</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/planner">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                New Trip
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Trip Overview */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-4xl font-bold text-gray-900">{itinerary.destination}</h2>
          </div>
          <p className="text-xl text-gray-600 mb-6">{itinerary.overview}</p>

          <div className="flex flex-wrap gap-4 mb-6">
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Calendar className="h-4 w-4 mr-2" />
              {itinerary.duration}
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <Users className="h-4 w-4 mr-2" />
              {tripData?.travelers} Travelers
            </Badge>
            <Badge variant="secondary" className="text-sm py-2 px-4">
              <DollarSign className="h-4 w-4 mr-2" />
              {tripData?.budget} Budget
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            {itinerary.days.map((day) => (
              <Card key={day.day} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-600">
                    Day {day.day}: {day.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Activities */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Activities
                    </h4>
                    <div className="space-y-4">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="border-l-4 border-blue-200 pl-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.time}
                            </Badge>
                            <span className="font-semibold">{activity.activity}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {activity.location}
                          </p>
                          <p className="text-sm text-gray-700">{activity.description}</p>
                          {activity.tips && (
                            <p className="text-xs text-blue-600 mt-1">
                              <Lightbulb className="h-3 w-3 inline mr-1" />
                              {activity.tips}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Meals */}
                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center">
                      <Utensils className="h-5 w-5 mr-2" />
                      Dining
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {day.meals.breakfast && (
                        <div className="space-y-1">
                          <h5 className="font-medium text-sm text-orange-600">Breakfast</h5>
                          <p className="font-semibold text-sm">{day.meals.breakfast.restaurant}</p>
                          <p className="text-xs text-gray-600">{day.meals.breakfast.cuisine}</p>
                          <p className="text-xs text-gray-700">{day.meals.breakfast.description}</p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <h5 className="font-medium text-sm text-green-600">Lunch</h5>
                        <p className="font-semibold text-sm">{day.meals.lunch.restaurant}</p>
                        <p className="text-xs text-gray-600">{day.meals.lunch.cuisine}</p>
                        <p className="text-xs text-gray-700">{day.meals.lunch.description}</p>
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-medium text-sm text-purple-600">Dinner</h5>
                        <p className="font-semibold text-sm">{day.meals.dinner.restaurant}</p>
                        <p className="text-xs text-gray-600">{day.meals.dinner.cuisine}</p>
                        <p className="text-xs text-gray-700">{day.meals.dinner.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Accommodation */}
                  {day.accommodation && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold text-lg mb-2 flex items-center">
                          <Bed className="h-5 w-5 mr-2" />
                          Accommodation
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold">{day.accommodation.name}</p>
                          <p className="text-sm text-gray-600">
                            {day.accommodation.type} • {day.accommodation.location}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">{day.accommodation.description}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Breakdown */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Budget Estimate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Accommodation</span>
                  <span className="font-semibold">{itinerary.budget.accommodation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Food & Dining</span>
                  <span className="font-semibold">{itinerary.budget.food}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Activities</span>
                  <span className="font-semibold">{itinerary.budget.activities}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Transportation</span>
                  <span className="font-semibold">{itinerary.budget.transportation}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Estimate</span>
                  <span className="text-blue-600">{itinerary.budget.total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Travel Tips */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2" />
                  Travel Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {itinerary.tips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
