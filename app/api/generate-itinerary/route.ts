import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    console.log("[v0] Generating itinerary for:", { destination, days, travelers, budget, interests })

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "user",
          content: `Create a detailed ${days}-day travel itinerary for ${destination} for ${travelers} travelers with a ${budget} budget. 
          
          IMPORTANT: Return ONLY valid JSON in this exact format, with no markdown formatting or additional text:
          
          {
            "destination": "${destination}",
            "duration": "${days} days",
            "overview": "Brief overview of the trip",
            "days": [
              {
                "day": 1,
                "title": "Day title",
                "activities": [
                  {
                    "time": "09:00 AM",
                    "activity": "Activity name",
                    "location": "Specific location",
                    "description": "Description of the activity",
                    "tips": "Local tips or null"
                  }
                ],
                "meals": {
                  "breakfast": {
                    "restaurant": "Restaurant name",
                    "cuisine": "Cuisine type",
                    "description": "Description"
                  },
                  "lunch": {
                    "restaurant": "Restaurant name",
                    "cuisine": "Cuisine type",
                    "description": "Description"
                  },
                  "dinner": {
                    "restaurant": "Restaurant name",
                    "cuisine": "Cuisine type",
                    "description": "Description"
                  }
                },
                "accommodation": {
                  "name": "Hotel name",
                  "type": "Hotel type",
                  "location": "Location",
                  "description": "Description"
                }
              }
            ],
            "tips": ["Tip 1", "Tip 2", "Tip 3"],
            "budget": {
              "accommodation": "Budget range",
              "food": "Budget range",
              "activities": "Budget range",
              "transportation": "Budget range",
              "total": "Total estimated cost"
            }
          }
          
          Make it realistic, practical, and engaging. Include specific restaurant names, attraction names, and neighborhoods. 
          Provide helpful tips for each major activity. Budget context for ${destination}:
          - Budget: accommodation $30-80/night, food $15-30/day, activities $10-25/day
          - Mid-range: accommodation $80-150/night, food $30-60/day, activities $25-50/day  
          - Luxury: accommodation $150-400/night, food $60-120/day, activities $50-100/day
          
          Interests: ${interests || "general tourism"}`,
        },
      ],
    })

    console.log("[v0] Generated itinerary text successfully")

    // Parse the JSON response
    let itinerary
    try {
      itinerary = JSON.parse(text)
    } catch (parseError) {
      console.error("[v0] Failed to parse itinerary JSON:", parseError)
      // Try to extract JSON from the text if it contains extra content
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        itinerary = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not extract valid JSON from response")
      }
    }

    console.log("[v0] Generated itinerary successfully with Groq AI")

    return Response.json({ itinerary })
  } catch (error) {
    console.error("[v0] Error generating itinerary:", error)
    return Response.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}
