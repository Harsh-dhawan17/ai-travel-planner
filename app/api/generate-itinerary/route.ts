import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    console.log("[v0] Request received:", { destination, startDate, endDate, travelers, budget, interests })

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1

    console.log("[v0] Trip duration calculated:", days, "days")

    // Create a detailed prompt for Groq to generate real itinerary
    const prompt = `You are an expert travel planner. Create a REAL and detailed ${days}-day travel itinerary for ${destination} for ${travelers} travelers with a ${budget} budget.

IMPORTANT: Return response in this EXACT format. Do NOT add any markdown formatting, code blocks, or extra text.

START_RESPONSE
{
  "destination": "${destination}",
  "overview": "A brief 1-2 sentence overview of the trip to ${destination}",
  "days": [
    {
      "day": 1,
      "title": "Day 1 - Arrival and Exploration",
      "activities": [
        {"time": "09:00 AM", "activity": "Arrive at [REAL PLACE]", "location": "[REAL LOCATION NAME]", "description": "[Description]", "tips": "[Tip]"},
        {"time": "01:00 PM", "activity": "Lunch at [REAL RESTAURANT]", "location": "[REAL RESTAURANT NAME]", "description": "[Description]", "tips": "[Tip]"},
        {"time": "03:00 PM", "activity": "Visit [REAL ATTRACTION]", "location": "[REAL ATTRACTION NAME]", "description": "[Description]", "tips": "[Tip]"}
      ],
      "meals": {
        "breakfast": {"restaurant": "[REAL BREAKFAST PLACE]", "cuisine": "[TYPE]", "description": "[Description]"},
        "lunch": {"restaurant": "[REAL LUNCH PLACE]", "cuisine": "[TYPE]", "description": "[Description]"},
        "dinner": {"restaurant": "[REAL DINNER PLACE]", "cuisine": "[TYPE]", "description": "[Description]"}
      },
      "accommodation": {"name": "[REAL HOTEL]", "type": "[TYPE]", "location": "[LOCATION]", "description": "[Description]"}
    }
  ],
  "budget": {
    "accommodation": "$XX-YY per night",
    "food": "$XX-YY per day",
    "activities": "$XX-YY per day",
    "transportation": "$XX-YY",
    "total": "$XXXX-YYYY total"
  },
  "tips": ["[Tip 1]", "[Tip 2]", "[Tip 3]", "[Tip 4]", "[Tip 5]"]
}
END_RESPONSE

Use ONLY REAL places, restaurants, attractions, and hotels in ${destination}.
${interests ? `User interests: ${interests}` : ""}
Budget context: ${budget === "budget" ? "Economy options, local transportation, street food" : budget === "medium" ? "Mid-range restaurants and hotels, tourist attractions" : "Luxury hotels, fine dining, premium experiences"}

Generate exactly ${days} days of itinerary. Be specific with real place names.`

    console.log("[v0] Sending request to Groq with destination:", destination)

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 4000,
    })

    console.log("[v0] Received response from Groq, length:", text.length)

    // Extract JSON from response
    const startIndex = text.indexOf("{")
    const endIndex = text.lastIndexOf("}") + 1

    if (startIndex === -1 || endIndex === 0) {
      console.error("[v0] Could not find JSON in response")
      console.log("[v0] Response text:", text.substring(0, 500))
      throw new Error("No JSON found in Groq response")
    }

    const jsonStr = text.substring(startIndex, endIndex)
    console.log("[v0] Extracted JSON, length:", jsonStr.length)

    const itineraryData = JSON.parse(jsonStr)
    console.log("[v0] Successfully parsed itinerary")

    // Ensure all days have proper structure
    const processedDays = itineraryData.days.map((day: any, idx: number) => ({
      day: idx + 1,
      title: day.title || `Day ${idx + 1} - ${destination}`,
      activities: (day.activities || []).map((activity: any) => ({
        time: activity.time || "10:00 AM",
        activity: activity.activity || "Activity",
        location: activity.location || destination,
        description: activity.description || "Explore and enjoy",
        tips: activity.tips || "Plan ahead",
      })),
      meals: {
        breakfast: day.meals?.breakfast || {
          restaurant: "Local Café",
          cuisine: "Breakfast",
          description: "Start your day",
        },
        lunch: day.meals?.lunch || {
          restaurant: "Local Restaurant",
          cuisine: "Lunch",
          description: "Lunch break",
        },
        dinner: day.meals?.dinner || {
          restaurant: "Local Restaurant",
          cuisine: "Dinner",
          description: "Evening meal",
        },
      },
      accommodation: idx === 0 ? (day.accommodation || {
        name: "Hotel",
        type: "Accommodation",
        location: destination,
        description: "Stay",
      }) : null,
    }))

    const finalItinerary = {
      destination: itineraryData.destination || destination,
      duration: `${days} days, ${Math.max(0, days - 1)} nights`,
      overview: itineraryData.overview || `Explore the beauty of ${destination}`,
      days: processedDays,
      tips: itineraryData.tips || [
        "Book accommodations in advance",
        "Use local transportation",
        "Eat where locals eat",
        "Respect local customs",
        "Stay hydrated",
      ],
      budget: {
        accommodation: itineraryData.budget?.accommodation || "$50-150/night",
        food: itineraryData.budget?.food || "$20-50/day",
        activities: itineraryData.budget?.activities || "$20-50/day",
        transportation: itineraryData.budget?.transportation || "$10-30/day",
        total: itineraryData.budget?.total || "Contact for details",
      },
    }

    console.log("[v0] Returning final itinerary")
    return Response.json({ itinerary: finalItinerary })
  } catch (error) {
    console.error("[v0] Error in API route:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.log("[v0] Error details:", errorMessage)

    return Response.json(
      {
        error: "Failed to generate itinerary",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
