// Geocoding: Nominatim (OpenStreetMap) — free, no key required
// Restaurant search: Foursquare Places API v3 — requires FOURSQUARE_API_KEY server-side

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Unable to get your location. Please allow location access or enter an address.'))
    )
  })
}

export async function geocodeAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'LuckyTable/1.0' },
  })
  if (!res.ok) throw new Error('Geocoding service unavailable. Please try again.')
  const data = await res.json()
  if (!data.length) throw new Error(`Could not find "${query}". Try a city name, zip code, or full address.`)
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    label: data[0].display_name,
  }
}

// ~15 mph effective straight-line speed (25 mph road speed × ~0.6 road-to-straight-line correction)
export function driveTimeToRadius(minutes) {
  return Math.min(Math.round(400 * minutes), 40000)
}

// Foursquare's server-side `categories` param is silently ignored in the current
// Places API — use `query` to bias results by meal type instead.
const MEAL_QUERIES = {
  all:       'restaurant',
  breakfast: 'breakfast brunch cafe',
  lunch:     'restaurant',
  dinner:    'restaurant',
  treat:     'dessert ice cream bakery',
}

// Client-side safety net: keywords that identify food/drink venues.
// Filters out non-food results (parks, shoe stores, libraries, etc.) that slip through.
const FOOD_WORDS = [
  'restaurant', 'café', 'cafe', 'bistro', 'diner', 'grill', 'kitchen', 'eatery',
  'gastropub', 'pub', 'tavern', 'bar', 'lounge', 'brewpub', 'taproom',
  'pizza', 'pizzeria', 'burger', 'sandwich', 'taco', 'sushi', 'noodle', 'ramen',
  'steak', 'steakhouse', 'seafood', 'bbq', 'barbecue', 'wings', 'chophouse',
  'breakfast', 'brunch', 'bakery', 'bagel', 'donut', 'waffle', 'crepe',
  'dessert', 'ice cream', 'gelato', 'frozen yogurt',
  'coffee', 'espresso', 'tea', 'juice', 'smoothie',
  'deli', 'buffet', 'food court', 'food hall',
  'chinese', 'japanese', 'korean', 'thai', 'vietnamese', 'indian', 'curry',
  'mexican', 'italian', 'french', 'greek', 'mediterranean', 'spanish',
  'caribbean', 'cuban', 'latin', 'ethiopian', 'african', 'middle eastern',
  'kebab', 'shawarma', 'falafel', 'gyro', 'pho', 'dim sum', 'dumpling',
]

function isFoodVenue(categories) {
  if (!categories?.length) return false
  const text = categories.map((c) => (c.name ?? '').toLowerCase()).join(' ')
  return FOOD_WORDS.some((w) => text.includes(w))
}

// price/rating/stats are premium fields — omit to stay on free tier
const FSQ_FIELDS = 'fsq_place_id,name,location,latitude,longitude,categories,tel,website'

export async function searchNearbyRestaurants(location, radius, category = 'all', maxPrice = 0) {
  const { lat, lng } = location

  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
    radius: Math.min(radius, 40000),
    query: MEAL_QUERIES[category] ?? MEAL_QUERIES.all,
    limit: 50,
    sort: 'RELEVANCE',
    fields: FSQ_FIELDS,
  })

  // Foursquare price param is comma-separated list of tiers to INCLUDE (1=$ 2=$$ 3=$$$ 4=$$$$)
  if (maxPrice > 0) {
    params.set('price', Array.from({ length: maxPrice }, (_, i) => i + 1).join(','))
  }

  const apiBase = import.meta.env.VITE_API_BASE ?? ''
  const res = await fetch(`${apiBase}/api/foursquare?${params}`)
  if (!res.ok) throw new Error('Restaurant search failed. Please try again.')

  const data = await res.json()
  if (data.error) throw new Error(data.error)

  let results = (data.results ?? [])
    .filter((biz) => isFoodVenue(biz.categories))
    .map(mapFoursquareBusiness)

  // Shuffle so results aren't always in the same geographic order
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[results[i], results[j]] = [results[j], results[i]]
  }

  return results.slice(0, 20)
}

// ── Helpers ──────────────────────────────

const SUIT_MAP = [
  {
    keywords: ['japanese', 'sushi', 'chinese', 'thai', 'asian', 'korean', 'vietnamese', 'ramen', 'noodle', 'dim sum', 'indian', 'curry', 'pho', 'dumpling'],
    suit: '♠', color: '#1a1a2e',
  },
  {
    keywords: ['italian', 'french', 'mediterranean', 'pizza', 'european', 'spanish', 'greek', 'seafood', 'pasta', 'wine'],
    suit: '♥', color: '#8b0000',
  },
  {
    keywords: ['american', 'burger', 'bbq', 'barbecue', 'steak', 'pub', 'diner', 'sandwich', 'wings', 'grill', 'hot dog', 'sports bar'],
    suit: '♦', color: '#8b0000',
  },
  {
    keywords: ['mexican', 'latin', 'middle eastern', 'ethiopian', 'african', 'caribbean', 'cafe', 'coffee', 'bakery', 'tacos', 'shawarma', 'falafel', 'ice cream', 'dessert', 'cake', 'donut', 'waffle', 'crepe', 'breakfast', 'brunch'],
    suit: '♣', color: '#1a1a2e',
  },
]

function getSuit(categoryName) {
  const text = (categoryName ?? '').toLowerCase()
  for (const entry of SUIT_MAP) {
    if (entry.keywords.some((k) => text.includes(k))) return { suit: entry.suit, color: entry.color }
  }
  return { suit: '♣', color: '#1a1a2e' }
}

function mapFoursquareBusiness(biz) {
  const cat = biz.categories?.[0]
  const categoryName = cat?.name ?? 'Restaurant'
  const { suit, color } = getSuit(categoryName)

  // New API: locality/region instead of city/state, lat/lng at root level
  const loc = biz.location ?? {}
  const addressParts = [loc.address, loc.locality, loc.region, loc.postcode].filter(Boolean)
  const address = addressParts.length > 0 ? addressParts.join(', ') : null

  return {
    id: biz.fsq_place_id,
    name: biz.name,
    cuisine: categoryName,
    address,
    phone: biz.tel ?? null,
    website: biz.website ?? null,
    openingHours: null,
    priceLevel: null,
    priceLabel: null,
    rating: null,
    reviewCount: null,
    lat: biz.latitude ?? null,
    lng: biz.longitude ?? null,
    suit,
    suitColor: color,
  }
}
