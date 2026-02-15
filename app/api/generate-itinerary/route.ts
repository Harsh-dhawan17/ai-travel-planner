import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

// Budget configurations for different destinations
const budgetRanges: Record<string, Record<string, { accommodation: string; food: string; activities: string; transportation: string }>> = {
  budget: {
    default: { accommodation: "$30-80/night", food: "$15-30/day", activities: "$10-25/day", transportation: "$5-15/day" },
  },
  medium: {
    default: { accommodation: "$80-150/night", food: "$30-60/day", activities: "$25-50/day", transportation: "$15-30/day" },
  },
  luxury: {
    default: { accommodation: "$150-400/night", food: "$60-120/day", activities: "$50-100/day", transportation: "$30-50/day" },
  },
}

// Helper function to generate sample itinerary structure
function generateSampleItinerary(destination: string, numDays: number, travelers: string, budgetLevel: string) {
  const budgetInfo = budgetRanges[budgetLevel] || budgetRanges.medium
  const dayBudget = budgetInfo.default

  const activities = [
    { time: "08:00 AM", activity: "Breakfast", location: "Local café", description: "Start your day with traditional breakfast" },
    { time: "10:00 AM", activity: "Main attraction", location: "City center", description: "Visit the main tourist attractions" },
    { time: "12:30 PM", activity: "Lunch break", location: "Local restaurant", description: "Enjoy authentic local cuisine" },
    { time: "03:00 PM", activity: "Exploration", location: "Local neighborhoods", description: "Explore and discover hidden gems" },
    { time: "06:00 PM", activity: "Evening activity", location: "Parks or cultural sites", description: "Experience local culture and art" },
  ]

  const meals = {
    breakfast: { restaurant: "Local Café", cuisine: "Traditional", description: "Authentic local breakfast" },
    lunch: { restaurant: "Popular Local Restaurant", cuisine: "Regional", description: "Regional specialty dishes" },
    dinner: { restaurant: "Fine Dining", cuisine: "Local Contemporary", description: "Modern take on traditional cuisine" },
  }

  const accommodation = {
    name: "Hotel/Guesthouse",
    type: "Mid-range hotel",
    location: "City center",
    description: "Comfortable and well-located accommodation",
  }

  const days = Array.from({ length: numDays }, (_, i) => ({
    day: i + 1,
    title: `Day ${i + 1} - Explore ${destination}`,
    activities: activities.slice(0, Math.floor(Math.random() * 3) + 3),
    meals,
    accommodation: i === 0 ? accommodation : null,
  }))

  const totalBudget = `$${(parseInt(dayBudget.accommodation.split("-")[0].replace("$", "")) * numDays + parseInt(dayBudget.food.split("-")[0].replace("$", "")) * numDays + parseInt(dayBudget.activities.split("-")[0].replace("$", "")) * numDays)}-${(parseInt(dayBudget.accommodation.split("-")[1].replace("/night", "").replace("$", "")) * numDays + parseInt(dayBudget.food.split("-")[1].replace("/day", "").replace("$", "")) * numDays + parseInt(dayBudget.activities.split("-")[1].replace("/day", "").replace("$", "")) * numDays)}`

  return {
    destination,
    duration: `${numDays} days, ${numDays - 1} nights`,
    overview: `Amazing ${numDays}-day journey through ${destination} for ${travelers} travelers. Experience local culture, cuisine, and attractions.`,
    days,
    tips: [
      "Book accommodations in advance",
      "Use public transportation to save money",
      "Eat where locals eat for authentic experience",
      "Learn a few local phrases",
      "Respect local customs and traditions",
    ],
    budget: {
      accommodation: dayBudget.accommodation,
      food: dayBudget.food,
      activities: dayBudget.activities,
      transportation: dayBudget.transportation,
      total: totalBudget,
    },
  }
}

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1

    console.log("[v0] Generating itinerary for:", { destination, days, travelers, budget, interests })

    try {
      // Get AI suggestions to enhance the base itinerary
      const { text: aiSuggestions } = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        messages: [
          {
            role: "user",
            content: `Provide 3-5 specific recommendations for a ${days}-day trip to ${destination}. Format: one recommendation per line. Be concise and practical.`,
          },
        ],
      })

      console.log("[v0] Got AI suggestions successfully")

      // Generate base itinerary
      const itinerary = generateSampleItinerary(destination, days, travelers, budget)

      // Enhance with AI suggestions
      const suggestions = aiSuggestions
        .split("\n")
        .filter((s) => s.trim().length > 0)
        .slice(0, 5)

      itinerary.tips = [...itinerary.tips, ...suggestions]

      console.log("[v0] Generated enhanced itinerary successfully")

      return Response.json({ itinerary })
    } catch (aiError) {
      console.log("[v0] AI generation failed, using default structure:", aiError)

      // Fallback to default itinerary if AI fails
      const itinerary = generateSampleItinerary(destination, days, travelers, budget)
      return Response.json({ itinerary })
    }
  } catch (error) {
    console.error("[v0] Error generating itinerary:", error)
    return Response.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}
