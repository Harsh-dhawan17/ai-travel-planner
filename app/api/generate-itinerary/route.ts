import { generateText, Output } from "ai"
import { groq } from "@ai-sdk/groq"
import { z } from "zod"

const itinerarySchema = z.object({
  destination: z.string(),
  duration: z.string(),
  overview: z.string(),
  days: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      activities: z.array(
        z.object({
          time: z.string(),
          activity: z.string(),
          location: z.string(),
          description: z.string(),
          tips: z.string().nullable(),
        }),
      ),
      meals: z.object({
        breakfast: z
          .object({
            restaurant: z.string(),
            cuisine: z.string(),
            description: z.string(),
          })
          .nullable(),
        lunch: z.object({
          restaurant: z.string(),
          cuisine: z.string(),
          description: z.string(),
        }),
        dinner: z.object({
          restaurant: z.string(),
          cuisine: z.string(),
          description: z.string(),
        }),
      }),
      accommodation: z
        .object({
          name: z.string(),
          type: z.string(),
          location: z.string(),
          description: z.string(),
        })
        .nullable(),
    }),
  ),
  tips: z.array(z.string()),
  budget: z.object({
    accommodation: z.string(),
    food: z.string(),
    activities: z.string(),
    transportation: z.string(),
    total: z.string(),
  }),
})

export async function POST(req: Request) {
  try {
    const { destination, startDate, endDate, travelers, interests, budget } = await req.json()

    // Calculate trip duration
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    console.log("[v0] Generating itinerary for:", { destination, days, travelers, budget, interests })

    const { output: itinerary } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      output: Output.object({
        schema: itinerarySchema,
      }),
      messages: [
        {
          role: "user",
          content: `Create a detailed ${days}-day travel itinerary for ${destination} for ${travelers} travelers with a ${budget} budget. 
          
          Include specific:
          - Daily activities with exact times, locations, and descriptions
          - Restaurant recommendations for breakfast, lunch, and dinner with cuisine types
          - Accommodation suggestions (only for the first day)
          - Local tips and insider knowledge
          - Budget breakdown for accommodation, food, activities, and transportation
          - Consider interests: ${interests}
          
          Make it realistic, practical, and engaging. Include specific restaurant names, attraction names, and neighborhoods. 
          Provide helpful tips for each major activity. Make sure the timeline is realistic and allows for travel time between locations.
          
          For budget estimates, use realistic price ranges for ${destination}:
          - Budget: accommodation $30-80/night, food $15-30/day, activities $10-25/day
          - Mid-range: accommodation $80-150/night, food $30-60/day, activities $25-50/day  
          - Luxury: accommodation $150-400/night, food $60-120/day, activities $50-100/day`,
        },
      ],
    })

    console.log("[v0] Generated itinerary successfully with Groq AI")

    return Response.json({ itinerary })
  } catch (error) {
    console.error("[v0] Error generating itinerary:", error)
    return Response.json({ error: "Failed to generate itinerary" }, { status: 500 })
  }
}
