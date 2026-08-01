import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    console.log("[v0] Request received for destination:", destination)

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1

    console.log("[v0] Trip duration:", days, "days")

    // Create a detailed prompt for Groq to generate real itinerary
    const prompt = `You are an expert travel planner. Create a detailed ${days}-day travel itinerary for ${destination}.

Return response as PLAIN TEXT (no JSON, no markdown). Format exactly like this:

DESTINATION: ${destination}
OVERVIEW: Brief description

DAY 1: Title
ACTIVITY: 09:00 AM - Activity name at Place name - Description
ACTIVITY: 12:00 PM - Activity name at Place name - Description
ACTIVITY: 03:00 PM - Activity name at Place name - Description
BREAKFAST: Restaurant name - Cuisine type - Description
LUNCH: Restaurant name - Cuisine type - Description
DINNER: Restaurant name - Cuisine type - Description
HOTEL: Hotel name - Type - Location - Description

[Repeat for all ${days} days]

TIPS:
- Tip 1
- Tip 2
- Tip 3

BUDGET:
ACCOMMODATION: $XX-YY per night
FOOD: $XX-YY per day
ACTIVITIES: $XX-YY per day
TRANSPORTATION: $XX-YY
TOTAL: $XXXX

For ${destination}, use REAL places, restaurants, and hotels. Budget type: ${budget}. Interests: ${interests || "general"}. Travelers: ${travelers}.`

    console.log("[v0] Calling Groq API")

    // Use Groq (FREE with GROQ_API_KEY) - using compatible model
    const { text } = await generateText({
      model: groq("gemma2-9b-it"),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 2000,
    })

    console.log("[v0] Received response, length:", text.length)

    // Parse plain text response
    const lines = text.split("\n")
    let overview = `Explore the beauty of ${destination}`
    const dayMap = new Map()
    let currentDay = 0
    let section = ""
    const tips: string[] = []
    let budgetInfo: any = {}

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith("OVERVIEW:")) {
        overview = trimmed.replace("OVERVIEW:", "").trim()
      } else if (trimmed.match(/^DAY\s+\d+/i)) {
        currentDay = parseInt(trimmed.match(/\d+/)?.[0] || "0")
        if (!dayMap.has(currentDay)) {
          dayMap.set(currentDay, {
            day: currentDay,
            title: trimmed.replace(/^DAY\s+\d+:\s*/i, ""),
            activities: [],
            meals: { breakfast: null, lunch: null, dinner: null },
            accommodation: null,
          })
        }
        section = "DAY"
      } else if (trimmed.startsWith("TIPS:")) {
        section = "TIPS"
      } else if (trimmed.startsWith("BUDGET:")) {
        section = "BUDGET"
      } else if (section === "DAY" && currentDay > 0) {
        const day = dayMap.get(currentDay)
        
        if (trimmed.match(/^ACTIVITY:/i)) {
          const match = trimmed.match(/^ACTIVITY:\s+(\d+:\d+\s+(?:AM|PM)?)\s*-\s*(.+?)\s+at\s+(.+?)\s*-\s*(.+)$/i)
          if (match) {
            day.activities.push({
              time: match[1],
              activity: match[2],
              location: match[3],
              description: match[4],
              tips: "",
            })
          }
        } else if (trimmed.match(/^BREAKFAST:/i)) {
          const [rest, cuisine, desc] = trimmed.replace(/^BREAKFAST:\s*/i, "").split(" - ")
          day.meals.breakfast = {
            restaurant: rest || "Local Café",
            cuisine: cuisine || "Breakfast",
            description: desc || "Start your day",
          }
        } else if (trimmed.match(/^LUNCH:/i)) {
          const [rest, cuisine, desc] = trimmed.replace(/^LUNCH:\s*/i, "").split(" - ")
          day.meals.lunch = {
            restaurant: rest || "Local Restaurant",
            cuisine: cuisine || "Lunch",
            description: desc || "Lunch break",
          }
        } else if (trimmed.match(/^DINNER:/i)) {
          const [rest, cuisine, desc] = trimmed.replace(/^DINNER:\s*/i, "").split(" - ")
          day.meals.dinner = {
            restaurant: rest || "Fine Dining",
            cuisine: cuisine || "Dinner",
            description: desc || "Evening meal",
          }
        } else if (trimmed.match(/^HOTEL:/i)) {
          const parts = trimmed.replace(/^HOTEL:\s*/i, "").split(" - ")
          day.accommodation = {
            name: parts[0] || "Hotel",
            type: parts[1] || "Mid-range",
            location: parts[2] || destination,
            description: parts[3] || "Stay",
          }
        }
      } else if (section === "TIPS" && trimmed.startsWith("-")) {
        tips.push(trimmed.replace(/^-\s*/, ""))
      } else if (section === "BUDGET" && trimmed.includes(":")) {
        const [key, value] = trimmed.split(":").map(s => s.trim())
        budgetInfo[key.toLowerCase()] = value
      }
    }

    // Build final itinerary with all days
    const processedDays = Array.from({ length: days }, (_, i) => {
      const dayNum = i + 1
      const dayData = dayMap.get(dayNum) || {
        day: dayNum,
        title: `Day ${dayNum} - ${destination}`,
        activities: [
          {
            time: "09:00 AM",
            activity: "Explore",
            location: destination,
            description: "Visit local attractions",
            tips: "",
          },
        ],
        meals: {
          breakfast: { restaurant: "Local Café", cuisine: "Breakfast", description: "Morning meal" },
          lunch: { restaurant: "Local Restaurant", cuisine: "Lunch", description: "Lunch" },
          dinner: { restaurant: "Local Restaurant", cuisine: "Dinner", description: "Dinner" },
        },
        accommodation: i === 0 ? {
          name: "Hotel",
          type: "Accommodation",
          location: destination,
          description: "Stay",
        } : null,
      }
      return dayData
    })

    const finalItinerary = {
      destination,
      duration: `${days} days, ${Math.max(0, days - 1)} nights`,
      overview,
      days: processedDays,
      tips: tips.length > 0 ? tips : ["Book in advance", "Use local transport", "Eat like a local"],
      budget: {
        accommodation: budgetInfo.accommodation || "$50-150/night",
        food: budgetInfo.food || "$20-50/day",
        activities: budgetInfo.activities || "$20-50/day",
        transportation: budgetInfo.transportation || "$10-30/day",
        total: budgetInfo.total || "$500-1500",
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
