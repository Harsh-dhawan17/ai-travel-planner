import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface Attraction {
  name: string
  category: string
  description: string
  timeToSpend: string
  cost: string
  openHours: string
  tips?: string
}

interface Restaurant {
  name: string
  cuisine: string
  description: string
  priceRange: string
  rating: number
  time?: string
}

interface Hotel {
  name: string
  type: string
  location: string
  description: string
  priceRange: string
  rating: number
}

interface DestinationData {
  name: string
  country: string
  overview: string
  description: string
  bestTime: string
  language: string
  currency: string
  timezone: string
  attractions: Attraction[]
  restaurants: {
    breakfast: Restaurant[]
    lunch: Restaurant[]
    dinner: Restaurant[]
  }
  hotels: Hotel[]
  budget: {
    budget: { accommodation: number; food: number; activities: number }
    medium: { accommodation: number; food: number; activities: number }
    luxury: { accommodation: number; food: number; activities: number }
  }
}

// Cache for destinations to avoid repeated API calls
const destinationCache: Map<string, DestinationData> = new Map()

export async function getDestination(destinationName: string): Promise<DestinationData> {
  // Check cache first
  const cacheKey = destinationName.toLowerCase()
  if (destinationCache.has(cacheKey)) {
    console.log("[v0] Using cached destination data for:", destinationName)
    return destinationCache.get(cacheKey)!
  }

  console.log("[v0] Fetching real destination data for:", destinationName)

  try {
    // Use Groq AI to generate real, destination-specific data
    const prompt = `Generate detailed, real travel information for ${destinationName}. 

Return ONLY valid JSON in this exact format (no markdown, no extra text):

{
  "name": "${destinationName}",
  "country": "Country name",
  "overview": "One sentence overview of the destination",
  "description": "2-3 sentences describing what makes this destination special",
  "bestTime": "Best months to visit",
  "language": "Primary language spoken",
  "currency": "Currency used",
  "timezone": "Timezone",
  "attractions": [
    {
      "name": "Real attraction name in ${destinationName}",
      "category": "Category like Monument/Museum/Nature/Historical",
      "description": "What is this place and what can you do there",
      "timeToSpend": "Recommended time like 2-3 hours",
      "cost": "Estimated cost",
      "openHours": "Opening hours",
      "tips": "One insider tip"
    },
    {
      "name": "Another real attraction in ${destinationName}",
      "category": "Category",
      "description": "Description",
      "timeToSpend": "2-3 hours",
      "cost": "Cost",
      "openHours": "Hours",
      "tips": "Tip"
    },
    {
      "name": "Third real attraction",
      "category": "Category",
      "description": "Description",
      "timeToSpend": "3-4 hours",
      "cost": "Cost",
      "openHours": "Hours",
      "tips": "Tip"
    },
    {
      "name": "Fourth real attraction",
      "category": "Category",
      "description": "Description",
      "timeToSpend": "2 hours",
      "cost": "Cost",
      "openHours": "Hours",
      "tips": "Tip"
    },
    {
      "name": "Fifth real attraction",
      "category": "Category",
      "description": "Description",
      "timeToSpend": "1-2 hours",
      "cost": "Cost",
      "openHours": "Hours",
      "tips": "Tip"
    }
  ],
  "restaurants": {
    "breakfast": [
      {
        "name": "Real restaurant name in ${destinationName}",
        "cuisine": "Type of cuisine",
        "description": "What they serve",
        "priceRange": "$$ or $$$ format",
        "rating": 4.5
      },
      {
        "name": "Another real breakfast place",
        "cuisine": "Cuisine type",
        "description": "Description",
        "priceRange": "$$",
        "rating": 4.4
      },
      {
        "name": "Third breakfast option",
        "cuisine": "Cuisine type",
        "description": "Description",
        "priceRange": "$$$",
        "rating": 4.6
      }
    ],
    "lunch": [
      {
        "name": "Real lunch restaurant",
        "cuisine": "Cuisine",
        "description": "What they serve",
        "priceRange": "$$",
        "rating": 4.5
      },
      {
        "name": "Another lunch spot",
        "cuisine": "Cuisine",
        "description": "Description",
        "priceRange": "$$",
        "rating": 4.4
      },
      {
        "name": "Third lunch option",
        "cuisine": "Cuisine",
        "description": "Description",
        "priceRange": "$$",
        "rating": 4.5
      }
    ],
    "dinner": [
      {
        "name": "Real dinner restaurant",
        "cuisine": "Cuisine",
        "description": "What they serve",
        "priceRange": "$$$",
        "rating": 4.6
      },
      {
        "name": "Another dinner place",
        "cuisine": "Cuisine",
        "description": "Description",
        "priceRange": "$$",
        "rating": 4.5
      },
      {
        "name": "Third dinner option",
        "cuisine": "Cuisine",
        "description": "Description",
        "priceRange": "$$$",
        "rating": 4.4
      }
    ]
  },
  "hotels": [
    {
      "name": "Real hotel name",
      "type": "Hotel type",
      "location": "Location in ${destinationName}",
      "description": "Why stay here",
      "priceRange": "$$ or $$$ format",
      "rating": 4.5
    },
    {
      "name": "Another real hotel",
      "type": "Type",
      "location": "Location",
      "description": "Description",
      "priceRange": "$$$",
      "rating": 4.6
    },
    {
      "name": "Third hotel option",
      "type": "Type",
      "location": "Location",
      "description": "Description",
      "priceRange": "$$",
      "rating": 4.4
    }
  ],
  "budget": {
    "budget": {
      "accommodation": 60,
      "food": 25,
      "activities": 20
    },
    "medium": {
      "accommodation": 120,
      "food": 50,
      "activities": 40
    },
    "luxury": {
      "accommodation": 250,
      "food": 100,
      "activities": 80
    }
  }
}

IMPORTANT RULES:
- Use ONLY REAL attractions, restaurants, and hotels that actually exist in ${destinationName}
- Do not invent fake places
- Return ONLY the JSON object, no explanations
- Ensure all prices and times are realistic
- All descriptions must be accurate and helpful
- Include the exact currency used in that country`

    const { text } = await generateText({
      model: groq("llama-3.1-70b-versatile"),
      messages: [{ role: "user", content: prompt }],
    })

    console.log("[v0] AI Response received, parsing...")

    // Parse the JSON response
    let cleanText = text.trim()

    // Remove markdown code blocks if present
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/^```json\n?/, "").replace(/\n?```$/, "")
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```\n?/, "").replace(/\n?```$/, "")
    }

    const destinationData: DestinationData = JSON.parse(cleanText)

    // Cache the result
    destinationCache.set(cacheKey, destinationData)
    console.log("[v0] Cached destination data for:", destinationName)

    return destinationData
  } catch (error) {
    console.error("[v0] Error fetching destination data:", error)
    throw new Error(`Failed to fetch data for ${destinationName}. Please try again.`)
  }
}
