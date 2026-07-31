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

// Comprehensive real destination data for popular destinations
const destinationDatabase: Record<string, DestinationData> = {
  paris: {
    name: "Paris",
    country: "France",
    overview: "Experience the magic of the City of Light with iconic landmarks, world-class museums, and romantic streets",
    description: "Paris is the capital of France known for its art, fashion, and culture. From the Eiffel Tower to the Louvre Museum, every corner tells a story of history and elegance.",
    bestTime: "April-June, September-October",
    language: "French",
    currency: "EUR",
    timezone: "CET",
    attractions: [
      {
        name: "Eiffel Tower",
        category: "Monument",
        description: "The iconic iron lattice tower offers stunning views of Paris from its three levels. Take the elevator or stairs to enjoy panoramic vistas.",
        timeToSpend: "2-3 hours",
        cost: "$15-30",
        openHours: "9:00 AM - 12:45 AM",
        tips: "Book online to skip lines. Visit at sunset for magical views",
      },
      {
        name: "Louvre Museum",
        category: "Museum",
        description: "The world's largest art museum housing masterpieces including the Mona Lisa and Venus de Milo. Plan 4-8 hours for a full experience.",
        timeToSpend: "4-8 hours",
        cost: "$20",
        openHours: "9:00 AM - 6:00 PM (Wed & Fri until 10 PM)",
        tips: "Go early morning or Wednesday evening to avoid crowds",
      },
      {
        name: "Notre-Dame Cathedral",
        category: "Historical",
        description: "Gothic masterpiece with stunning architecture and centuries of history. Currently under restoration but exterior viewing available.",
        timeToSpend: "1-2 hours",
        cost: "Free outside, €10 for tours",
        openHours: "8:00 AM - 6:45 PM",
        tips: "Best viewed from Île de la Cité in the evening",
      },
      {
        name: "Arc de Triomphe",
        category: "Monument",
        description: "Monumental arch honoring those who died for France. Climb 284 steps to the top for breathtaking 360-degree views of Paris.",
        timeToSpend: "1-2 hours",
        cost: "$15",
        openHours: "10:00 AM - 10:30 PM",
        tips: "Visit at dusk for the best photography opportunities",
      },
      {
        name: "Sacré-Cœur Basilica",
        category: "Religious",
        description: "White-domed basilica perched atop Montmartre hill. Stunning Romano-Byzantine architecture and panoramic city views.",
        timeToSpend: "1-2 hours",
        cost: "Free to enter, €6 to climb dome",
        openHours: "6:00 AM - 10:30 PM",
        tips: "Take the funicular up the hill or explore charming Montmartre streets",
      },
    ],
    restaurants: {
      breakfast: [
        {
          name: "Café de Flore",
          cuisine: "French Café",
          description: "Historic café serving traditional French pastries and coffee",
          priceRange: "$10-15",
          rating: 4.5,
        },
        {
          name: "Les Deux Magots",
          cuisine: "French",
          description: "Legendary café with literary heritage and authentic Parisian breakfast",
          priceRange: "$12-18",
          rating: 4.3,
        },
        {
          name: "Ladurée",
          cuisine: "French Pastry",
          description: "Famous for macarons and elegant French breakfast experience",
          priceRange: "$15-20",
          rating: 4.6,
        },
      ],
      lunch: [
        {
          name: "L'Ami Jean",
          cuisine: "French Bistro",
          description: "Cozy bistro serving traditional French comfort food and wine",
          priceRange: "$15-25",
          rating: 4.4,
        },
        {
          name: "Chez Janou",
          cuisine: "Provençal French",
          description: "Charming restaurant with Mediterranean flavors and warm ambiance",
          priceRange: "$18-28",
          rating: 4.5,
        },
        {
          name: "Breizh Café",
          cuisine: "Crêperie",
          description: "Authentic Breton crêpes with quality ingredients and traditional preparation",
          priceRange: "$10-15",
          rating: 4.4,
        },
      ],
      dinner: [
        {
          name: "Le Jules Verne",
          cuisine: "French Fine Dining",
          description: "Michelin-starred restaurant in the Eiffel Tower with exquisite cuisine",
          priceRange: "$80-150",
          rating: 4.7,
        },
        {
          name: "L'Astrance",
          cuisine: "Contemporary French",
          description: "Three Michelin stars. Innovative French cuisine in an intimate setting",
          priceRange: "$150-250",
          rating: 4.8,
        },
        {
          name: "Septime",
          cuisine: "French Contemporary",
          description: "Trendy restaurant with seasonal menus and excellent wine selection",
          priceRange: "$40-60",
          rating: 4.5,
        },
      ],
    },
    hotels: [
      {
        name: "Le Meurice",
        type: "Luxury Hotel",
        location: "Tuileries, 8th Arrondissement",
        description: "Palace hotel with 18th-century elegance, world-class service, and Michelin-starred dining",
        priceRange: "$500-1000+/night",
        rating: 4.8,
      },
      {
        name: "Ritz Paris",
        type: "Luxury Hotel",
        location: "Place Vendôme",
        description: "Iconic luxury hotel with timeless elegance, perfect service, and prestigious location",
        priceRange: "$600-1500+/night",
        rating: 4.9,
      },
      {
        name: "Hôtel de Crillon",
        type: "Luxury Hotel",
        location: "Place de la Concorde",
        description: "Historic palace hotel with refined French hospitality and stunning views",
        priceRange: "$400-900/night",
        rating: 4.7,
      },
    ],
    budget: {
      budget: { accommodation: 60, food: 25, activities: 30 },
      medium: { accommodation: 120, food: 50, activities: 60 },
      luxury: { accommodation: 350, food: 120, activities: 150 },
    },
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    overview: "Discover the perfect blend of ancient traditions and cutting-edge modernity in Japan's vibrant capital",
    description: "Tokyo is a mesmerizing metropolis where ancient temples stand beside futuristic skyscrapers. Experience cutting-edge technology, serene gardens, incredible cuisine, and vibrant nightlife.",
    bestTime: "March-May, September-November",
    language: "Japanese",
    currency: "JPY",
    timezone: "JST",
    attractions: [
      {
        name: "Senso-ji Temple",
        category: "Religious",
        description: "Tokyo's oldest temple with iconic red lantern. Browse traditional souvenirs and street food in surrounding lanes.",
        timeToSpend: "1-2 hours",
        cost: "Free to enter, donations welcome",
        openHours: "24 hours (best 6-9 AM)",
        tips: "Visit early morning to avoid crowds and enjoy peaceful atmosphere",
      },
      {
        name: "Tokyo Skytree",
        category: "Modern Landmark",
        description: "Tallest structure in Japan offering 360-degree views from two observation decks. Restaurant and shopping available.",
        timeToSpend: "2-3 hours",
        cost: "$18-25",
        openHours: "8:00 AM - 11:00 PM",
        tips: "Sunrise or sunset visits offer spectacular photo opportunities",
      },
      {
        name: "Shibuya Crossing",
        category: "Urban Experience",
        description: "The world's busiest pedestrian crossing. Best viewed from the Starbucks overlooking the square.",
        timeToSpend: "30 minutes - 1 hour",
        cost: "Free",
        openHours: "24/7",
        tips: "Go in evening for neon-lit energy and best photography",
      },
      {
        name: "Meiji Shrine",
        category: "Religious",
        description: "Serene Shinto shrine surrounded by peaceful forest. Attend traditional rituals or write wishes on ema plaques.",
        timeToSpend: "1-2 hours",
        cost: "Free",
        openHours: "Sunrise to sunset",
        tips: "Walk through the forest trails for complete peaceful experience",
      },
      {
        name: "Tsukiji Outer Market",
        category: "Food & Market",
        description: "Historic fish market with fresh seafood, street food, and authentic Japanese breakfast experiences.",
        timeToSpend: "1-2 hours",
        cost: "$10-30",
        openHours: "5:00 AM - 2:00 PM",
        tips: "Arrive early for freshest offerings and best breakfast spots",
      },
    ],
    restaurants: {
      breakfast: [
        {
          name: "Ichiran Ramen",
          cuisine: "Ramen",
          description: "Authentic tonkotsu ramen with rich pork broth and perfectly cooked noodles",
          priceRange: "$8-12",
          rating: 4.5,
        },
        {
          name: "Yoshinoya",
          cuisine: "Gyudon Rice Bowl",
          description: "Popular chain serving beef rice bowls with simple, hearty preparation",
          priceRange: "$5-8",
          rating: 4.2,
        },
        {
          name: "Gonpachi",
          cuisine: "Japanese Fusion",
          description: "Modern Japanese breakfast with contemporary twist",
          priceRange: "$12-18",
          rating: 4.4,
        },
      ],
      lunch: [
        {
          name: "Tsukiji Outer Market Restaurants",
          cuisine: "Japanese Seafood",
          description: "Fresh sushi and seafood bowls at market prices",
          priceRange: "$15-30",
          rating: 4.6,
        },
        {
          name: "Tonki",
          cuisine: "Tonkatsu",
          description: "Legendary fried pork cutlet restaurant established in 1937",
          priceRange: "$12-18",
          rating: 4.5,
        },
        {
          name: "Genki Sushi",
          cuisine: "Conveyor Belt Sushi",
          description: "Fun, affordable sushi experience with plates moving on conveyor belts",
          priceRange: "$15-25",
          rating: 4.3,
        },
      ],
      dinner: [
        {
          name: "Sukiyabashi Jiro",
          cuisine: "Sushi Omakase",
          description: "Three Michelin star sushi restaurant with decades of tradition",
          priceRange: "$200-300",
          rating: 4.8,
        },
        {
          name: "Nabezo",
          cuisine: "Hot Pot",
          description: "Interactive hot pot dining experience with premium meats and broths",
          priceRange: "$50-80",
          rating: 4.5,
        },
        {
          name: "Goro Ramen",
          cuisine: "Ramen",
          description: "Award-winning ramen with unique broths and high-quality ingredients",
          priceRange: "$15-20",
          rating: 4.6,
        },
      ],
    },
    hotels: [
      {
        name: "Mandarin Oriental Tokyo",
        type: "Luxury Hotel",
        location: "Nihonbashi, Chuo Ward",
        description: "Ultra-luxury hotel with exceptional service, contemporary design, and fine dining",
        priceRange: "$400-800/night",
        rating: 4.8,
      },
      {
        name: "Peninsula Tokyo",
        type: "Luxury Hotel",
        location: "Ginza",
        description: "Premier luxury hotel with rooftop spa, gourmet restaurants, and impeccable service",
        priceRange: "$350-700/night",
        rating: 4.7,
      },
      {
        name: "Park Hyatt Tokyo",
        type: "Luxury Hotel",
        location: "Shinjuku",
        description: "High-rise luxury hotel featuring contemporary art, multiple restaurants, and city views",
        priceRange: "$400-800/night",
        rating: 4.7,
      },
    ],
    budget: {
      budget: { accommodation: 50, food: 20, activities: 25 },
      medium: { accommodation: 100, food: 40, activities: 50 },
      luxury: { accommodation: 300, food: 100, activities: 120 },
    },
  },
  dubai: {
    name: "Dubai",
    country: "United Arab Emirates",
    overview: "Experience luxury shopping, iconic architecture, and desert adventures in this modern desert metropolis",
    description: "Dubai seamlessly blends futuristic architecture with traditional culture. From the Burj Khalifa to pristine beaches, desert safaris to world-class shopping, Dubai offers unforgettable experiences.",
    bestTime: "November-March",
    language: "Arabic, English widely spoken",
    currency: "AED",
    timezone: "GST",
    attractions: [
      {
        name: "Burj Khalifa",
        category: "Modern Landmark",
        description: "World's tallest building with observation decks on 124th and 148th floors offering unmatched city views",
        timeToSpend: "2-3 hours",
        cost: "$25-35",
        openHours: "10:00 AM - 12:00 AM",
        tips: "Book fast-track tickets online. Visit around sunset for best views",
      },
      {
        name: "Dubai Mall",
        category: "Shopping",
        description: "World's largest shopping mall with 1200+ stores, aquarium, ice rink, and dining options",
        timeToSpend: "3-4 hours",
        cost: "Free entry, shopping prices vary",
        openHours: "10:00 AM - 11:00 PM",
        tips: "Come for waterfall shows every 30 minutes and amazing architecture",
      },
      {
        name: "Desert Safari",
        category: "Adventure",
        description: "Experience dune bashing, camel riding, and traditional Bedouin camp with live entertainment and dinner",
        timeToSpend: "4-5 hours",
        cost: "$40-80",
        openHours: "3:00 PM - 10:00 PM",
        tips: "Book with reputable companies. Wear comfortable clothes and bring sunscreen",
      },
      {
        name: "Palm Jumeirah",
        category: "Modern Development",
        description: "Man-made island shaped like a palm tree featuring luxury hotels, villas, and pristine beaches",
        timeToSpend: "2-3 hours",
        cost: "Free to visit, activities extra",
        openHours: "24/7",
        tips: "Take a monorail ride for aerial views or relax on private beach clubs",
      },
      {
        name: "Gold Souk",
        category: "Traditional Market",
        description: "Traditional Arabic market selling gold, jewelry, and souvenirs with authentic market atmosphere",
        timeToSpend: "1-2 hours",
        cost: "Free to browse, shopping prices vary",
        openHours: "10:00 AM - 10:00 PM",
        tips: "Go early morning or after 5 PM. Bargaining is expected",
      },
    ],
    restaurants: {
      breakfast: [
        {
          name: "Arabian Breakfast at Emirate Establishment",
          cuisine: "Emirati",
          description: "Traditional Emirati breakfast with fresh bread, cheese, dates, and Arabic coffee",
          priceRange: "$10-15",
          rating: 4.4,
        },
        {
          name: "Arabian Tea House",
          cuisine: "Middle Eastern",
          description: "Authentic Arabian breakfast in traditional setting with sea views",
          priceRange: "$12-18",
          rating: 4.5,
        },
        {
          name: "Modern Café",
          cuisine: "International",
          description: "Contemporary breakfast options with Arabian influences",
          priceRange: "$15-25",
          rating: 4.3,
        },
      ],
      lunch: [
        {
          name: "Al Mallah",
          cuisine: "Lebanese",
          description: "Famous for shawarma with perfect spice blend and fresh ingredients",
          priceRange: "$5-10",
          rating: 4.6,
        },
        {
          name: "Al Reef Bakery",
          cuisine: "Middle Eastern",
          description: "Traditional bakery serving flatbread, hummus, and fresh salads",
          priceRange: "$8-12",
          rating: 4.5,
        },
        {
          name: "Zaroob",
          cuisine: "Iraqi",
          description: "Contemporary Iraqi cuisine with modern presentation and authentic flavors",
          priceRange: "$12-20",
          rating: 4.4,
        },
      ],
      dinner: [
        {
          name: "Al Mahara",
          cuisine: "Seafood Fine Dining",
          description: "Michelin-recommended seafood restaurant with underwater aquarium views",
          priceRange: "$60-100",
          rating: 4.7,
        },
        {
          name: "Nobu",
          cuisine: "Japanese Fusion",
          description: "World-famous chef Nobu's innovative Japanese-Peruvian cuisine",
          priceRange: "$80-150",
          rating: 4.6,
        },
        {
          name: "Arabian Courtyard Restaurant",
          cuisine: "Arabian Fine Dining",
          description: "Upscale Arabian cuisine in traditional courtyard setting",
          priceRange: "$40-70",
          rating: 4.5,
        },
      ],
    },
    hotels: [
      {
        name: "Burj Al Arab",
        type: "Ultra-Luxury Hotel",
        location: "Jumeirah Beach",
        description: "Iconic sail-shaped luxury hotel with butler service, Michelin restaurants, and private beach",
        priceRange: "$700-2000+/night",
        rating: 4.8,
      },
      {
        name: "Emirates Palace",
        type: "Luxury Hotel",
        location: "Abu Dhabi (nearby)",
        description: "Opulent palace-style hotel with gold-gilded interior and world-class amenities",
        priceRange: "$400-1000/night",
        rating: 4.7,
      },
      {
        name: "Atlantis The Palm",
        type: "Luxury Resort",
        location: "Palm Jumeirah",
        description: "Mega resort with aquarium, water park, restaurants, and beach access",
        priceRange: "$300-800/night",
        rating: 4.6,
      },
    ],
    budget: {
      budget: { accommodation: 80, food: 30, activities: 40 },
      medium: { accommodation: 150, food: 60, activities: 80 },
      luxury: { accommodation: 400, food: 150, activities: 200 },
    },
  },
}

// Cache for other destinations
const destinationCache: Map<string, DestinationData> = new Map()

export async function getDestination(destinationName: string): Promise<DestinationData> {
  const cacheKey = destinationName.toLowerCase()

  // Check main database first
  if (destinationDatabase[cacheKey]) {
    console.log("[v0] Using database destination data for:", destinationName)
    return destinationDatabase[cacheKey]
  }

  // Check cache for previously generated destinations
  if (destinationCache.has(cacheKey)) {
    console.log("[v0] Using cached destination data for:", destinationName)
    return destinationCache.get(cacheKey)!
  }

  // For any other destination, return a carefully crafted generic response
  console.log("[v0] Generating generic destination response for:", destinationName)

  const genericDestination: DestinationData = {
    name: destinationName,
    country: "Country",
    overview: `Experience the unique charm and culture of ${destinationName}`,
    description: `${destinationName} is a wonderful destination with rich history, culture, and attractions waiting to be explored. From historical sites to local cuisine, enjoy authentic experiences.`,
    bestTime: "Best to check local tourism website for current recommendations",
    language: "Local language",
    currency: "Local currency",
    timezone: "Local timezone",
    attractions: [
      {
        name: `${destinationName} Main Museum`,
        category: "Museum",
        description: "Learn about local history and culture at the main museum",
        timeToSpend: "2-3 hours",
        cost: "$10-15",
        openHours: "9:00 AM - 5:00 PM",
        tips: "Check for guided tours",
      },
      {
        name: `${destinationName} Historic Center`,
        category: "Historical",
        description: "Walk through historic streets and discover local architecture",
        timeToSpend: "2-3 hours",
        cost: "Free",
        openHours: "24/7",
        tips: "Best explored on foot",
      },
      {
        name: `${destinationName} Local Market`,
        category: "Market",
        description: "Experience authentic local market with crafts and local goods",
        timeToSpend: "1-2 hours",
        cost: "Shopping prices vary",
        openHours: "9:00 AM - 6:00 PM",
        tips: "Bargaining may be possible",
      },
      {
        name: `${destinationName} Park/Nature`,
        category: "Nature",
        description: "Relax in local parks and enjoy nature",
        timeToSpend: "1-2 hours",
        cost: "Free",
        openHours: "Dawn to dusk",
        tips: "Great for photo opportunities",
      },
      {
        name: `${destinationName} Local Restaurant Area`,
        category: "Dining",
        description: "Explore local dining culture and street food",
        timeToSpend: "1-2 hours",
        cost: "$5-20 per meal",
        openHours: "Varies by venue",
        tips: "Ask locals for recommendations",
      },
    ],
    restaurants: {
      breakfast: [
        {
          name: "Local Café",
          cuisine: "Local",
          description: "Traditional local breakfast",
          priceRange: "$5-10",
          rating: 4.0,
        },
        {
          name: "Heritage Breakfast Place",
          cuisine: "Local Traditional",
          description: "Authentic local breakfast experience",
          priceRange: "$8-12",
          rating: 4.1,
        },
        {
          name: "Modern Café",
          cuisine: "Contemporary Local",
          description: "Modern take on local breakfast",
          priceRange: "$10-15",
          rating: 4.0,
        },
      ],
      lunch: [
        {
          name: "Local Bistro",
          cuisine: "Local",
          description: "Popular local lunch spot",
          priceRange: "$8-15",
          rating: 4.0,
        },
        {
          name: "Traditional Restaurant",
          cuisine: "Regional",
          description: "Serves traditional local dishes",
          priceRange: "$10-18",
          rating: 4.1,
        },
        {
          name: "Street Food Vendor Area",
          cuisine: "Local Street Food",
          description: "Authentic street food experience",
          priceRange: "$3-8",
          rating: 4.0,
        },
      ],
      dinner: [
        {
          name: "Local Fine Dining",
          cuisine: "Local Contemporary",
          description: "Upscale local cuisine",
          priceRange: "$20-40",
          rating: 4.2,
        },
        {
          name: "Traditional Dinner House",
          cuisine: "Regional",
          description: "Authentic local dinner specialties",
          priceRange: "$15-30",
          rating: 4.1,
        },
        {
          name: "Popular Local Restaurant",
          cuisine: "Local Favorite",
          description: "Local favorite with signature dishes",
          priceRange: "$12-25",
          rating: 4.1,
        },
      ],
    },
    hotels: [
      {
        name: "City Center Hotel",
        type: "Mid-range Hotel",
        location: "City Center",
        description: "Comfortable hotel in central location with good amenities",
        priceRange: "$80-120/night",
        rating: 4.1,
      },
      {
        name: "Budget Inn",
        type: "Budget Hotel",
        location: "Local Area",
        description: "Affordable accommodation with basic amenities",
        priceRange: "$40-70/night",
        rating: 4.0,
      },
      {
        name: "Luxury Resort",
        type: "Luxury Hotel",
        location: "Premium Area",
        description: "Upscale accommodation with premium services and amenities",
        priceRange: "$200-400/night",
        rating: 4.3,
      },
    ],
    budget: {
      budget: { accommodation: 50, food: 20, activities: 25 },
      medium: { accommodation: 100, food: 40, activities: 50 },
      luxury: { accommodation: 250, food: 80, activities: 100 },
    },
  }

  destinationCache.set(cacheKey, genericDestination)
  return genericDestination
}
