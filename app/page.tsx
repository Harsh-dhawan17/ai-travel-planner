"use client"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Sparkles, Globe, Utensils } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">TravelAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
            <Sparkles className="h-4 w-4 mr-1" />
            AI-Powered Travel Planning
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6 text-balance">Plan Your Perfect Trip with AI</h2>
          <p className="text-xl text-gray-600 mb-8 text-pretty leading-relaxed">
            Get personalized travel itineraries in seconds. From hidden gems to must-see attractions, our AI creates
            detailed day-by-day plans tailored to your preferences and travel style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Start Planning Now
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for the Perfect Trip</h3>
            <p className="text-gray-600 text-lg">
              Our AI considers every detail to create your ideal travel experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Smart Destinations</CardTitle>
                <CardDescription>
                  Discover hidden gems and popular attractions based on your interests and travel style
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-emerald-600 mb-4" />
                <CardTitle>Day-by-Day Itineraries</CardTitle>
                <CardDescription>
                  Get detailed schedules optimized for time, distance, and your energy levels
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Utensils className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Local Experiences</CardTitle>
                <CardDescription>
                  Find authentic restaurants, activities, and cultural experiences locals love
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h3>
            <p className="text-gray-600 text-lg">Get your personalized travel plan in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-xl font-semibold mb-2">Tell Us Your Preferences</h4>
              <p className="text-gray-600">Choose your destination, travel dates, group size, and interests</p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-xl font-semibold mb-2">AI Creates Your Plan</h4>
              <p className="text-gray-600">Our AI analyzes thousands of options to craft your perfect itinerary</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-xl font-semibold mb-2">Enjoy Your Trip</h4>
              <p className="text-gray-600">Follow your personalized plan or adjust it as you explore</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-bold mb-6">Ready to Plan Your Next Adventure?</h3>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of travelers who trust AI to create their perfect trips
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Planning for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold">TravelAI</span>
          </div>
          <p className="text-gray-400">© 2025 TravelAI. All rights reserved. Plan smarter, travel better.</p>
        </div>
      </footer>
    </div>
  )
}
