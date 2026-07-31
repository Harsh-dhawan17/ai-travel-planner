// Service for optimizing itineraries based on distance, time, and preferences

export interface ItineraryDay {
  day: number
  title: string
  activities: Array<{
    time: string
    activity: string
    location: string
    description: string
    tips: string
    duration?: number // in minutes
  }>
  meals: {
    breakfast?: {
      restaurant: string
      cuisine: string
      description: string
      time?: string
    }
    lunch?: {
      restaurant: string
      cuisine: string
      description: string
      time?: string
    }
    dinner?: {
      restaurant: string
      cuisine: string
      description: string
      time?: string
    }
  }
  accommodation?: {
    name: string
    type: string
    location: string
    description: string
  }
  totalWalkingTime?: number
  notes?: string
}

export function optimizeItinerary(
  days: ItineraryDay[],
  preferences: {
    pace?: "relaxed" | "moderate" | "fast"
    interests?: string[]
    budget?: string
  },
): ItineraryDay[] {
  // Optimize each day based on pace preference
  return days.map((day, index) => {
    const optimizedDay = { ...day }

    // Adjust activity timings based on pace
    if (preferences.pace === "relaxed") {
      optimizedDay.activities = day.activities.slice(0, 3)
      optimizedDay.notes = "Relaxed pace with time for leisurely exploration"
    } else if (preferences.pace === "fast") {
      optimizedDay.activities = day.activities.slice(0, 6)
      optimizedDay.notes = "Packed itinerary to maximize experiences"
    } else {
      // moderate pace - keep as is
      optimizedDay.notes = "Balanced pace with time to explore and rest"
    }

    // Add meal times
    if (optimizedDay.meals.breakfast) {
      optimizedDay.meals.breakfast.time = "8:00 AM"
    }
    if (optimizedDay.meals.lunch) {
      optimizedDay.meals.lunch.time = "12:30 PM"
    }
    if (optimizedDay.meals.dinner) {
      optimizedDay.meals.dinner.time = "7:00 PM"
    }

    // Calculate approximate walking time (rough estimate)
    const activityCount = optimizedDay.activities.length
    optimizedDay.totalWalkingTime = activityCount * 15 // 15 mins between attractions

    return optimizedDay
  })
}

export function calculateBudgetBreakdown(
  days: number,
  budgetLevel: "budget" | "medium" | "luxury",
  budgetData: Record<string, Record<string, string>>,
) {
  const budget = budgetData[budgetLevel]

  // Parse the values
  const parseRange = (range: string) => {
    const matches = range.match(/\$(\d+)/)
    return parseInt(matches?.[1] || "0", 10)
  }

  const accommodation = parseRange(budget.accommodation)
  const food = parseRange(budget.food)
  const activities = parseRange(budget.activities)
  const transport = parseRange(budget.transportation || "$10")

  const dailyTotal = accommodation + food + activities + transport
  const tripTotal = dailyTotal * days

  return {
    perDay: {
      accommodation: `$${accommodation}`,
      food: `$${food}`,
      activities: `$${activities}`,
      transport: `$${transport}`,
      total: `$${dailyTotal}`,
    },
    total: {
      accommodation: `$${accommodation * days}`,
      food: `$${food * days}`,
      activities: `$${activities * days}`,
      transport: `$${transport * days}`,
      total: `$${tripTotal}`,
    },
  }
}

export function generateOptimizedTips(
  destination: string,
  days: number,
  pace: string,
  interests?: string,
): string[] {
  const baseTips = [
    "Book major attractions in advance to skip long queues",
    "Use public transportation to save money and explore like a local",
    "Eat where locals eat for authentic experiences and better value",
    "Learn a few local phrases - locals appreciate the effort",
    "Keep a copy of your hotel address for taxi drivers",
  ]

  const paceTips: Record<string, string[]> = {
    relaxed: [
      "Don't rush - enjoy leisurely meals and long walks",
      "Take breaks at local cafes to observe daily life",
    ],
    moderate: [
      "Balance sightseeing with downtime",
      "Explore neighborhoods on foot after visiting main attractions",
    ],
    fast: [
      "Wear comfortable shoes for maximum walking",
      "Have a prioritized list of must-see attractions",
    ],
  }

  const destinationTips: Record<string, string[]> = {
    paris: ["Visit the Louvre early in the morning", "Book dinner reservations in advance"],
    tokyo: [
      "Get a Suica card for easy public transport",
      "Visit temples early to avoid crowds",
    ],
    newyork: ["Get a MetroCard for unlimited subway rides", "Walk as much as possible"],
    london: ["Consider a London Pass for museum entry", "Explore different neighborhoods"],
    delhi: ["Bargain at markets for better prices", "Be cautious of street food initially"],
  }

  const combined = [...baseTips, ...(paceTips[pace] || [])]
  const destKey = destination.toLowerCase().replace(/\s+/g, "")
  if (destinationTips[destKey as keyof typeof destinationTips]) {
    combined.push(...destinationTips[destKey as keyof typeof destinationTips])
  }

  // Add interest-specific tips
  if (interests?.includes("food")) {
    combined.push("Take a cooking class to learn local cuisine")
    combined.push("Visit local markets for authentic ingredients")
  }
  if (interests?.includes("history")) {
    combined.push("Join a guided historical tour for context")
    combined.push("Visit museums early for better information")
  }
  if (interests?.includes("adventure")) {
    combined.push("Book adventure activities in advance")
    combined.push("Wear appropriate gear for outdoor activities")
  }

  return [...new Set(combined)].slice(0, 8) // Return unique tips, max 8
}
