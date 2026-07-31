import { getDestination } from "@/lib/services/destination-service"
import { optimizeItinerary, generateOptimizedTips, calculateBudgetBreakdown } from "@/lib/services/itinerary-optimizer"

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1

    console.log("[v0] Generating itinerary for:", { destination, days, travelers, budget, interests })

    // Get real destination data
    const destData = getDestination(destination)

    // Generate day-by-day itinerary
    const generatedDays = Array.from({ length: days }, (_, dayIndex) => {
      // Select attractions for this day
      const dayAttractions = destData.attractions.slice(dayIndex % 2, Math.min(dayIndex % 2 + 4, destData.attractions.length))

      // Select restaurants
      const breakfastIdx = dayIndex % destData.restaurants.breakfast.length
      const lunchIdx = dayIndex % destData.restaurants.lunch.length
      const dinnerIdx = dayIndex % destData.restaurants.dinner.length

      return {
        day: dayIndex + 1,
        title: `Day ${dayIndex + 1} - Explore ${destData.name}`,
        activities: dayAttractions.map((attraction, idx) => ({
          time: ["08:30 AM", "11:00 AM", "02:00 PM", "05:00 PM"][idx] || "03:00 PM",
          activity: `Visit ${attraction.name}`,
          location: attraction.name,
          description: attraction.description,
          tips: attraction.tips || "Arrive early to avoid crowds",
          duration: 120,
        })),
        meals: {
          breakfast: {
            ...destData.restaurants.breakfast[breakfastIdx],
            time: "8:00 AM",
          },
          lunch: {
            ...destData.restaurants.lunch[lunchIdx],
            time: "12:30 PM",
          },
          dinner: {
            ...destData.restaurants.dinner[dinnerIdx],
            time: "7:00 PM",
          },
        },
        accommodation:
          dayIndex === 0
            ? {
                name: destData.hotels[0].name,
                type: destData.hotels[0].type,
                location: destData.hotels[0].location,
                description: destData.hotels[0].description,
              }
            : null,
      }
    })

    // Optimize itinerary
    const optimizedDays = optimizeItinerary(generatedDays, {
      pace: interests?.includes("relaxed") ? "relaxed" : interests?.includes("adventure") ? "fast" : "moderate",
      interests: interests ? interests.split(",").map((i) => i.trim()) : [],
      budget,
    })

    // Generate tips
    const tips = generateOptimizedTips(destData.name, days, "moderate", interests)

    // Calculate budget breakdown
    const budgetBreakdown = calculateBudgetBreakdown(days, budget as "budget" | "medium" | "luxury", destData.budget)

    const itinerary = {
      destination: destData.name,
      country: destData.country,
      duration: `${days} days, ${Math.max(0, days - 1)} nights`,
      overview: destData.overview,
      bestTime: destData.bestTime,
      language: destData.language,
      currency: destData.currency,
      timezone: destData.timezone,
      days: optimizedDays,
      tips,
      budget: budgetBreakdown,
    }

    console.log("[v0] Generated complete itinerary successfully")

    return Response.json({ itinerary })
  } catch (error) {
    console.error("[v0] Error generating itinerary:", error)
    return Response.json(
      { error: "Failed to generate itinerary", details: String(error) },
      { status: 500 },
    )
  }
}
