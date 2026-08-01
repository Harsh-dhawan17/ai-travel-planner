export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    console.log("[v0] Request received for destination:", destination)

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1

    console.log("[v0] Trip duration:", days, "days")

    // Create prompt
    const prompt = `You are an expert travel planner. Create a detailed ${days}-day travel itinerary for ${destination} for ${travelers} travelers with a ${budget} budget.

Return ONLY plain text in this format:

DESTINATION: ${destination}
OVERVIEW: Brief overview

DAY 1: Title
ACTIVITY: 09:00 AM - Activity name at Place - Description
ACTIVITY: 12:00 PM - Lunch at Restaurant - Description
ACTIVITY: 03:00 PM - Activity name at Place - Description
ACTIVITY: 07:00 PM - Dinner at Restaurant - Description
BREAKFAST: Restaurant name - Cuisine - Description
LUNCH: Restaurant name - Cuisine - Description  
DINNER: Restaurant name - Cuisine - Description
HOTEL: Hotel name - Type - Location - Description

[REPEAT FOR ALL ${days} DAYS]

TIPS:
- Tip 1
- Tip 2
- Tip 3
- Tip 4
- Tip 5

BUDGET:
ACCOMMODATION: $XX-YY per night
FOOD: $XX-YY per day
ACTIVITIES: $XX-YY per day
TRANSPORTATION: $XX
TOTAL: $XXX-XXXX

For ${destination}, use REAL places, restaurants, and hotels. Budget: ${budget}. Interests: ${interests || "tourism"}. No JSON, no markdown.`

    console.log("[v0] Calling Groq API directly")

    // Call Groq API directly (bypass AI SDK)
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json()
      console.error("[v0] Groq API error:", errorData)
      throw new Error(`Groq API error: ${groqResponse.status}`)
    }

    const groqData = await groqResponse.json()
    const responseText = groqData.choices[0]?.message?.content || ""

    console.log("[v0] Groq response received, length:", responseText.length)

    // Parse response
    const lines = responseText.split("\n")
    const dayMap = new Map()
    let overview = `Explore the beauty of ${destination}`
    let currentDay = 0
    let section = ""
    const tips: string[] = []
    const budgetInfo: any = {}

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      if (trimmed.startsWith("OVERVIEW:")) {
        overview = trimmed.replace("OVERVIEW:", "").trim()
      } else if (trimmed.match(/^DAY\s+\d+/i)) {
        currentDay = parseInt(trimmed.match(/\d+/)?.[0] || "0")
        if (currentDay > 0 && !dayMap.has(currentDay)) {
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
        if (!day) continue

        if (trimmed.match(/^ACTIVITY:/i)) {
          const parts = trimmed.replace(/^ACTIVITY:\s*/i, "").split(" at ")
          if (parts.length >= 2) {
            const [timeActivity, locationDesc] = parts
            const locationParts = locationDesc.split(" - ")
            const timeMatch = timeActivity.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i)
            const time = timeMatch ? timeMatch[1] : "10:00 AM"
            const activity = timeActivity.replace(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i, "").trim()

            day.activities.push({
              time,
              activity,
              location: locationParts[0] || destination,
              description: locationParts[1] || "Enjoy local experience",
              tips: "",
            })
          }
        } else if (trimmed.match(/^BREAKFAST:/i)) {
          const parts = trimmed.replace(/^BREAKFAST:\s*/i, "").split(" - ")
          day.meals.breakfast = {
            restaurant: parts[0] || "Local Café",
            cuisine: parts[1] || "Breakfast",
            description: parts[2] || "Start your day",
          }
        } else if (trimmed.match(/^LUNCH:/i)) {
          const parts = trimmed.replace(/^LUNCH:\s*/i, "").split(" - ")
          day.meals.lunch = {
            restaurant: parts[0] || "Local Restaurant",
            cuisine: parts[1] || "Lunch",
            description: parts[2] || "Lunch break",
          }
        } else if (trimmed.match(/^DINNER:/i)) {
          const parts = trimmed.replace(/^DINNER:\s*/i, "").split(" - ")
          day.meals.dinner = {
            restaurant: parts[0] || "Fine Dining",
            cuisine: parts[1] || "Dinner",
            description: parts[2] || "Evening meal",
          }
        } else if (trimmed.match(/^HOTEL:/i)) {
          const parts = trimmed.replace(/^HOTEL:\s*/i, "").split(" - ")
          day.accommodation = {
            name: parts[0] || "Hotel",
            type: parts[1] || "Mid-range",
            location: parts[2] || destination,
            description: parts[3] || "Comfortable stay",
          }
        }
      } else if (section === "TIPS" && trimmed.startsWith("-")) {
        tips.push(trimmed.replace(/^-\s*/, ""))
      } else if (section === "BUDGET") {
        const [key, value] = trimmed.split(":").map(s => s.trim())
        if (key && value) {
          budgetInfo[key.toLowerCase()] = value
        }
      }
    }

    // Build final itinerary
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
          description: "Comfortable stay",
        } : null,
      }
      return dayData
    })

    const finalItinerary = {
      destination,
      duration: `${days} days, ${Math.max(0, days - 1)} nights`,
      overview,
      days: processedDays,
      tips: tips.length > 0 ? tips : [
        "Book accommodations in advance",
        "Use public transportation",
        "Eat where locals eat",
        "Respect local customs",
        "Stay hydrated",
      ],
      budget: {
        accommodation: budgetInfo.accommodation || "$50-150/night",
        food: budgetInfo.food || "$20-50/day",
        activities: budgetInfo.activities || "$20-50/day",
        transportation: budgetInfo.transportation || "$10-30/day",
        total: budgetInfo.total || "$500-1500",
      },
    }

    console.log("[v0] Itinerary generated successfully!")
    return Response.json({ itinerary: finalItinerary })
  } catch (error) {
    console.error("[v0] Error:", error instanceof Error ? error.message : String(error))
    return Response.json(
      { error: "Failed to generate itinerary", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
