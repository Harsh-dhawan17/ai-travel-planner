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
    console.log("[v0] Raw response length:", text.length)

    // Parse the JSON response with improved extraction
    let itinerary
    let cleanText = text.trim()
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\n/, "").replace(/\n```$/, "")
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n/, "").replace(/\n```$/, "")
    }

    try {
      itinerary = JSON.parse(cleanText)
      console.log("[v0] Successfully parsed JSON directly")
    } catch (parseError) {
      console.log("[v0] Failed to parse JSON directly, attempting extraction")
      
      // Try to find and extract JSON object from the text
      const jsonStart = cleanText.indexOf("{")
      const jsonEnd = cleanText.lastIndexOf("}")
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const extractedJson = cleanText.substring(jsonStart, jsonEnd + 1)
        console.log("[v0] Extracted JSON substring")
        
        try {
          itinerary = JSON.parse(extractedJson)
          console.log("[v0] Successfully parsed extracted JSON")
        } catch (extractError) {
          console.error("[v0] Failed to parse extracted JSON:", extractError)
          console.log("[v0] First 500 chars of response:", text.substring(0, 500))
          throw new Error("Could not parse itinerary response as JSON")
        }
      } else {
        console.error("[v0] Could not find JSON object in response")
        console.log("[v0] First 500 chars of response:", text.substring(0, 500))
        throw new Error("No JSON object found in response")
      }
    }

    console.log("[v0] Generated itinerary successfully with Groq AI")

    return Response.json({ itinerary })
  } catch (error) {
    console.error("[v0] Error generating itinerary:", error)
    return Response.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}
