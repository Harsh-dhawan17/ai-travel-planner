import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    console.log("[v0] Request received:", { destination, startDate, endDate, travelers, budget, interests })

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1

    console.log("[v0] Trip duration calculated:", days, "days")

    // Create a detailed prompt for AI to generate real itinerary
    const prompt = `You are an expert travel planner with 20+ years of experience. Create an AUTHENTIC and DETAILED ${days}-day travel itinerary for ${destination} for ${travelers} travelers with a ${budget} budget.

Return ONLY valid JSON with NO markdown, NO code blocks, NO explanations.

{
  "destination": "${destination}",
  "overview": "Brief overview of what to expect",
  "days": [
    {
      "day": 1,
      "title": "Day 1 Title",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Activity name",
          "location": "Specific place name in ${destination}",
          "description": "What to do and why"
        }
      ],
      "meals": {
        "breakfast": {
          "restaurant": "Real restaurant name",
          "cuisine": "Type",
          "description": "Description"
        },
        "lunch": {
          "restaurant": "Real restaurant name",
          "cuisine": "Type",
          "description": "Description"
        },
        "dinner": {
          "restaurant": "Real restaurant name",
          "cuisine": "Type",
          "description": "Description"
        }
      },
      "accommodation": {
        "name": "Real hotel name",
        "type": "Type",
        "location": "Location",
        "description": "Description"
      }
    }
  ],
  "tips": ["Tip 1", "Tip 2", "Tip 3"],
  "budget": {
    "accommodation": "Price range",
    "food": "Price range",
    "activities": "Price range",
    "transportation": "Price range",
    "total": "Total"
  }
}

Use REAL places and restaurants. Generate ${days} complete days. Budget: ${budget}. Interests: ${interests || "general tourism"}.`

    console.log("[v0] Calling AI with destination:", destination)

    // Use the Vercel AI Gateway default (no provider needed)
    const { text } = await generateText({
      model: "gpt-4o-mini", // Using stable model that always works
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      maxTokens: 3000,
    })

    console.log("[v0] Received response, length:", text.length)

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error("[v0] No JSON found in response")
      throw new Error("Invalid response format")
    }

    const itineraryData = JSON.parse(jsonMatch[0])
    console.log("[v0] Successfully parsed itinerary")

    // Ensure all days have proper structure
    const processedDays = (itineraryData.days || []).map((day: any, idx: number) => ({
      day: idx + 1,
      title: day.title || `Day ${idx + 1} - ${destination}`,
      activities: (day.activities || []).slice(0, 5).map((activity: any) => ({
        time: activity.time || "10:00 AM",
        activity: activity.activity || activity.name || "Activity",
        location: activity.location || destination,
        description: activity.description || "Experience local culture",
        tips: activity.tips || "",
      })),
      meals: {
        breakfast: {
          restaurant: day.meals?.breakfast?.restaurant || "Local Café",
          cuisine: day.meals?.breakfast?.cuisine || "Breakfast",
          description: day.meals?.breakfast?.description || "Start your day with local flavors",
        },
        lunch: {
          restaurant: day.meals?.lunch?.restaurant || "Local Restaurant",
          cuisine: day.meals?.lunch?.cuisine || "Lunch",
          description: day.meals?.lunch?.description || "Enjoy authentic local cuisine",
        },
        dinner: {
          restaurant: day.meals?.dinner?.restaurant || "Local Restaurant",
          cuisine: day.meals?.dinner?.cuisine || "Dinner",
          description: day.meals?.dinner?.description || "Evening dining experience",
        },
      },
      accommodation: idx === 0 ? {
        name: day.accommodation?.name || "Hotel",
        type: day.accommodation?.type || "Mid-range Hotel",
        location: day.accommodation?.location || destination,
        description: day.accommodation?.description || "Comfortable accommodation",
      } : null,
    }))

    const finalItinerary = {
      destination: itineraryData.destination || destination,
      duration: `${days} days, ${Math.max(0, days - 1)} nights`,
      overview: itineraryData.overview || `Discover the best of ${destination}`,
      days: processedDays,
      tips: itineraryData.tips || [
        "Book in advance for better rates",
        "Use public transportation",
        "Eat where locals eat",
        "Respect local customs",
        "Stay hydrated and use sunscreen",
      ],
      budget: {
        accommodation: itineraryData.budget?.accommodation || "$50-150/night",
        food: itineraryData.budget?.food || "$20-50/day",
        activities: itineraryData.budget?.activities || "$20-50/day",
        transportation: itineraryData.budget?.transportation || "$10-30/day",
        total: itineraryData.budget?.total || "$500-1500",
      },
    }

    console.log("[v0] Itinerary generated successfully")
    return Response.json({ itinerary: finalItinerary })
  } catch (error) {
    console.error("[v0] Error generating itinerary:", error instanceof Error ? error.message : String(error))
    
    return Response.json(
      {
        error: "Failed to generate itinerary",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
