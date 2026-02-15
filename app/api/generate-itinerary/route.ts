import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1

    console.log("[v0] Generating real-time itinerary for:", { destination, days, travelers, budget, interests })

    // Generate detailed day-by-day itinerary using AI
    const prompt = `You are an expert travel planner. Create a detailed ${days}-day itinerary for ${destination} for ${travelers} people with a ${budget} budget.

Return the response in this exact format (no markdown, plain text):

OVERVIEW: [One sentence overview]

DAY 1
Activity 1: [Time] - [Activity Name] at [Real Place Name] - [Description]
Activity 2: [Time] - [Activity Name] at [Real Place Name] - [Description]
Activity 3: [Time] - [Activity Name] at [Real Place Name] - [Description]
Breakfast: [Real Restaurant Name] - [Cuisine Type] - [Brief Description]
Lunch: [Real Restaurant Name] - [Cuisine Type] - [Brief Description]
Dinner: [Real Restaurant Name] - [Cuisine Type] - [Brief Description]
Accommodation: [Real Hotel/Guesthouse Name] - [Type] - [Location] - [Brief Description]

DAY 2
[Same format as above]

[Continue for ${days} days]

BUDGET SUMMARY
Accommodation: [Cost range per night for ${destination}]
Food: [Cost range per day for ${destination}]
Activities: [Cost range per day for ${destination}]
Transportation: [Cost range]
Total Estimated: [Total cost]

TIPS AND RECOMMENDATIONS
- [Tip 1]
- [Tip 2]
- [Tip 3]
- [Tip 4]
- [Tip 5]

Use ONLY REAL places, restaurants, and attractions in ${destination}. Include specific, factual information that would help a traveler.
${interests ? `Consider these interests: ${interests}` : ""}
Budget level: ${budget}`

    const { text: itineraryText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    console.log("[v0] Generated itinerary text successfully")

    // Parse the generated text into structured format
    const itinerary = parseItineraryText(itineraryText, destination, days, travelers, budget)

    console.log("[v0] Parsed itinerary structure successfully")

    return Response.json({ itinerary })
  } catch (error) {
    console.error("[v0] Error generating itinerary:", error)
    return Response.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}

function parseItineraryText(
  text: string,
  destination: string,
  days: number,
  travelers: string,
  budget: string,
) {
  const lines = text.split("\n").map((line) => line.trim())

  let overview = "Explore the amazing destination"
  let dayStructures: any[] = []
  let budget_summary: any = {}
  let tips: string[] = []

  let currentSection = ""
  let currentDay = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith("OVERVIEW:")) {
      overview = line.replace("OVERVIEW:", "").trim()
    } else if (line.match(/^DAY\s+\d+/)) {
      currentDay = parseInt(line.match(/\d+/)?.[0] || "0")
      if (currentDay > 0 && !dayStructures[currentDay - 1]) {
        dayStructures[currentDay - 1] = {
          day: currentDay,
          title: `Day ${currentDay} - ${destination}`,
          activities: [],
          meals: {
            breakfast: null,
            lunch: null,
            dinner: null,
          },
          accommodation: null,
        }
      }
      currentSection = "DAY"
    } else if (line.startsWith("BUDGET SUMMARY")) {
      currentSection = "BUDGET"
    } else if (line.startsWith("TIPS")) {
      currentSection = "TIPS"
    } else if (line.length > 0) {
      if (currentSection === "DAY" && currentDay > 0) {
        const dayIndex = currentDay - 1

        if (line.match(/^Activity\s+\d+:/)) {
          const [timeAndPlace, ...descParts] = line.split(" - ")
          const timeMatch = timeAndPlace.match(/\d{1,2}:\d{2}\s+(AM|PM)/i)
          const time = timeMatch ? timeMatch[0] : "09:00 AM"
          const activityMatch = timeAndPlace.match(/Activity\s+\d+:\s+(.+)/)
          const activity = activityMatch ? activityMatch[1] : "Visit"
          const place = descParts[0] || "Local attraction"
          const description = descParts.slice(1).join(" - ") || "Explore and enjoy"

          dayStructures[dayIndex].activities.push({
            time,
            activity: activity.replace(/\s+at\s+.*/, ""),
            location: place.trim(),
            description,
            tips: "",
          })
        } else if (line.match(/^Breakfast:/i)) {
          const [restaurant, cuisine, ...descParts] = line
            .replace(/^Breakfast:\s*/i, "")
            .split(" - ")
          dayStructures[dayIndex].meals.breakfast = {
            restaurant: restaurant?.trim() || "Local Café",
            cuisine: cuisine?.trim() || "Local",
            description: descParts.join(" - ").trim() || "Traditional breakfast",
          }
        } else if (line.match(/^Lunch:/i)) {
          const [restaurant, cuisine, ...descParts] = line
            .replace(/^Lunch:\s*/i, "")
            .split(" - ")
          dayStructures[dayIndex].meals.lunch = {
            restaurant: restaurant?.trim() || "Local Restaurant",
            cuisine: cuisine?.trim() || "Regional",
            description: descParts.join(" - ").trim() || "Delicious local cuisine",
          }
        } else if (line.match(/^Dinner:/i)) {
          const [restaurant, cuisine, ...descParts] = line
            .replace(/^Dinner:\s*/i, "")
            .split(" - ")
          dayStructures[dayIndex].meals.dinner = {
            restaurant: restaurant?.trim() || "Fine Dining",
            cuisine: cuisine?.trim() || "Contemporary",
            description: descParts.join(" - ").trim() || "Evening dining experience",
          }
        } else if (line.match(/^Accommodation:/i)) {
          const [name, type, location, ...descParts] = line
            .replace(/^Accommodation:\s*/i, "")
            .split(" - ")
          dayStructures[dayIndex].accommodation = {
            name: name?.trim() || "Hotel",
            type: type?.trim() || "Mid-range",
            location: location?.trim() || "Central location",
            description: descParts.join(" - ").trim() || "Comfortable accommodation",
          }
        }
      } else if (currentSection === "BUDGET" && line.match(/^[A-Za-z]+:/)) {
        const [key, value] = line.split(":").map((s) => s.trim())
        budget_summary[key.toLowerCase()] = value
      } else if (currentSection === "TIPS" && line.startsWith("-")) {
        tips.push(line.replace(/^-\s*/, "").trim())
      }
    }
  }

  // Ensure we have all days
  const finalDays = Array.from({ length: days }, (_, i) => {
    return (
      dayStructures[i] || {
        day: i + 1,
        title: `Day ${i + 1} - ${destination}`,
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
          breakfast: { restaurant: "Local Café", cuisine: "Local", description: "Breakfast" },
          lunch: { restaurant: "Local Restaurant", cuisine: "Regional", description: "Lunch" },
          dinner: { restaurant: "Local Restaurant", cuisine: "Local", description: "Dinner" },
        },
        accommodation: i === 0 ? { name: "Hotel", type: "Hotel", location: destination, description: "Stay" } : null,
      }
    )
  })

  return {
    destination,
    duration: `${days} days, ${days - 1} nights`,
    overview,
    days: finalDays,
    tips: tips.length > 0 ? tips : ["Explore local neighborhoods", "Try local cuisine", "Respect local customs"],
    budget: {
      accommodation: budget_summary.accommodation || "$50-150/night",
      food: budget_summary.food || "$20-50/day",
      activities: budget_summary.activities || "$20-50/day",
      transportation: budget_summary.transportation || "$10-20/day",
      total: budget_summary["total estimated"] || "Contact for details",
    },
  }
}
