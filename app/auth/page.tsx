"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Globe, Mail, Lock, User, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      if (isSignUp) {
        // Sign up logic
        const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")

        // Check if user already exists
        if (existingUsers.find((user: any) => user.email === formData.email)) {
          setError("An account with this email already exists")
          setIsLoading(false)
          return
        }

        // Register new user
        const newUser = {
          name: formData.name,
          email: formData.email,
          password: formData.password, // In real app, this would be hashed
          id: Date.now().toString(),
        }

        existingUsers.push(newUser)
        localStorage.setItem("registeredUsers", JSON.stringify(existingUsers))

        // Auto login after signup
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            id: newUser.id,
          }),
        )

        router.push("/planner")
      } else {
        // Sign in logic
        const existingUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
        const user = existingUsers.find((u: any) => u.email === formData.email && u.password === formData.password)

        if (!user) {
          setError("Invalid email or password")
          setIsLoading(false)
          return
        }

        // Login successful
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: user.name,
            email: user.email,
            id: user.id,
          }),
        )

        router.push("/planner")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    }

    setIsLoading(false)
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)

    // Simulate Google authentication
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const googleUser = {
      name: "Google User",
      email: "user@gmail.com",
      id: "google_" + Date.now(),
    }

    localStorage.setItem("user", JSON.stringify(googleUser))
    setIsLoading(false)
    router.push("/planner")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Globe className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">TravelAI</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSignUp ? "Create Account" : "Welcome Back"}</h1>
          <p className="text-gray-600">
            {isSignUp ? "Start planning your perfect trips with AI" : "Sign in to continue planning your adventures"}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
            <CardDescription className="text-center">
              {isSignUp ? "Enter your details to create your account" : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <Button variant="outline" className="w-full bg-transparent" onClick={handleGoogleAuth} disabled={isLoading}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-gray-600">{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
              <Button
                variant="link"
                className="p-0 ml-1 h-auto font-semibold text-blue-600"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError("")
                  setFormData({ name: "", email: "", password: "" })
                }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
