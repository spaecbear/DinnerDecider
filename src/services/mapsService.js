// All free, no API key required.
// Geocoding: Nominatim (OpenStreetMap)
// Restaurant search: Overpass API (OpenStreetMap)

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
    headers: { 'Accept-Language': 'en', 'User-Agent': 'DinnerDecider/1.0' },
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

// 25 mph average city speed ≈ 670 m/min
export function driveTimeToRadius(minutes) {
  return Math.min(Math.round(670 * minutes), 50000)
}

// Overpass sub-queries per category
const CATEGORY_NODES = {
  all: (a) => `
    node["amenity"="restaurant"]${a};
    node["amenity"="cafe"]${a};
    node["amenity"="fast_food"]${a};
    node["amenity"="bar"]${a};
    way["amenity"="restaurant"]${a};
    way["amenity"="cafe"]${a};
    way["amenity"="fast_food"]${a};
  `,
  breakfast: (a) => `
    node["amenity"="cafe"]${a};
    node["amenity"="restaurant"]["cuisine"~"breakfast|brunch|pancake|waffle|crepe",i]${a};
    node["amenity"="fast_food"]["cuisine"~"breakfast|brunch",i]${a};
    way["amenity"="cafe"]${a};
    way["amenity"="restaurant"]["cuisine"~"breakfast|brunch|pancake|waffle|crepe",i]${a};
  `,
  lunch: (a) => `
    node["amenity"="restaurant"]${a};
    node["amenity"="fast_food"]${a};
    node["amenity"="cafe"]${a};
    way["amenity"="restaurant"]${a};
    way["amenity"="fast_food"]${a};
    way["amenity"="cafe"]${a};
  `,
  dinner: (a) => `
    node["amenity"="restaurant"]${a};
    node["amenity"="bar"]["name"]${a};
    way["amenity"="restaurant"]${a};
    way["amenity"="bar"]["name"]${a};
  `,
  treat: (a) => `
    node["amenity"="ice_cream"]${a};
    node["amenity"="cafe"]["cuisine"~"ice_cream|cake|dessert|donut|waffle|crepe|pastry|frozen_yogurt|bubble_tea",i]${a};
    node["amenity"="fast_food"]["cuisine"~"ice_cream|dessert|donut|frozen_yogurt",i]${a};
    node["shop"="bakery"]${a};
    node["shop"="confectionery"]${a};
    way["amenity"="ice_cream"]${a};
    way["shop"="bakery"]${a};
  `,
}

export async function searchNearbyRestaurants(location, radius, category = 'all', maxPrice = 0) {
  const { lat, lng } = location
  const around = `(around:${radius},${lat},${lng})`
  const nodes = CATEGORY_NODES[category] ?? CATEGORY_NODES.all
  const query = `[out:json][timeout:30];\n(\n${nodes(around)});\nout body;`

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })
  if (!res.ok) throw new Error('Restaurant search failed. The free Overpass server may be busy — please try again in a moment.')

  const data = await res.json()
  let results = data.elements
    .map(mapElement)
    .filter((r) => r.name)

  // Soft price filter: only exclude results that have price data AND exceed the budget
  if (maxPrice > 0) {
    results = results.filter((r) => r.priceLevel === null || r.priceLevel <= maxPrice)
  }

  // Shuffle so results aren't always in the same geographic order
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]]
  }

  return results.slice(0, 20)
}

// ── Helpers ──────────────────────────────

function buildAddress(tags) {
  const parts = []
  const num = tags['addr:housenumber']
  const street = tags['addr:street']
  if (num && street) parts.push(`${num} ${street}`)
  else if (street) parts.push(street)
  if (tags['addr:city']) parts.push(tags['addr:city'])
  if (tags['addr:state']) parts.push(tags['addr:state'])
  if (tags['addr:postcode']) parts.push(tags['addr:postcode'])
  return parts.join(', ') || null
}

function parsePriceLevel(tags) {
  const raw = tags.price_range || tags['price:range'] || tags['price_range']
  if (!raw) return null
  const dollars = (raw.match(/\$/g) || []).length
  if (dollars > 0) return Math.min(dollars, 4)
  const lower = raw.toLowerCase()
  if (/cheap|budget|low|inexpensive/.test(lower)) return 1
  if (/moderate|medium|mid|average/.test(lower)) return 2
  if (/expensive|high|upscale/.test(lower)) return 3
  if (/luxury|very\s*exp|fine\s*dining/.test(lower)) return 4
  return null
}

const SUIT_MAP = [
  {
    keywords: ['japanese', 'sushi', 'chinese', 'thai', 'asian', 'korean', 'vietnamese', 'ramen', 'noodle', 'dim_sum', 'indian', 'curry', 'pho', 'dumpling'],
    suit: '♠', color: '#1a1a2e',
  },
  {
    keywords: ['italian', 'french', 'mediterranean', 'pizza', 'european', 'spanish', 'greek', 'seafood', 'pasta', 'wine'],
    suit: '♥', color: '#8b0000',
  },
  {
    keywords: ['american', 'burger', 'bbq', 'barbecue', 'steak', 'pub', 'diner', 'sandwich', 'wings', 'grill', 'hot_dog', 'sports_bar'],
    suit: '♦', color: '#8b0000',
  },
  {
    keywords: ['mexican', 'latin', 'middle_eastern', 'ethiopian', 'african', 'caribbean', 'cafe', 'coffee', 'bakery', 'tacos', 'shawarma', 'falafel', 'ice_cream', 'dessert', 'cake', 'donut', 'waffle', 'crepe', 'breakfast', 'brunch'],
    suit: '♣', color: '#1a1a2e',
  },
]

function getSuit(cuisine, amenity, shop) {
  const text = `${cuisine ?? ''} ${amenity ?? ''} ${shop ?? ''}`.toLowerCase()
  for (const entry of SUIT_MAP) {
    if (entry.keywords.some((k) => text.includes(k))) return { suit: entry.suit, color: entry.color }
  }
  return { suit: '♣', color: '#1a1a2e' }
}

const AMENITY_LABELS = {
  restaurant: 'Restaurant',
  cafe: 'Café',
  fast_food: 'Fast Food',
  bar: 'Bar & Grill',
  ice_cream: 'Ice Cream',
}

const SHOP_LABELS = {
  bakery: 'Bakery',
  confectionery: 'Sweets',
}

function mapElement(el) {
  const tags = el.tags || {}
  const rawCuisine = tags.cuisine?.split(';')[0].replace(/_/g, ' ').trim() ?? null
  const cuisine = rawCuisine ? rawCuisine.charAt(0).toUpperCase() + rawCuisine.slice(1) : null
  const amenity = tags.amenity || null
  const shop = tags.shop || null
  const { suit, color } = getSuit(rawCuisine, amenity, shop)
  const priceLevel = parsePriceLevel(tags)

  return {
    id: `${el.type}-${el.id}`,
    name: tags.name ?? null,
    cuisine: cuisine ?? AMENITY_LABELS[amenity] ?? SHOP_LABELS[shop] ?? 'Restaurant',
    address: buildAddress(tags),
    phone: tags.phone ?? tags['contact:phone'] ?? null,
    website: tags.website ?? tags['contact:website'] ?? null,
    openingHours: tags.opening_hours ?? null,
    priceLevel,
    priceLabel: priceLevel ? '$'.repeat(priceLevel) : null,
    lat: el.lat ?? null,
    lng: el.lon ?? null,
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    suit,
    suitColor: color,
  }
}
