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

// ~15 mph effective straight-line speed (25 mph road speed × ~0.6 road-to-straight-line correction)
export function driveTimeToRadius(minutes) {
  return Math.min(Math.round(400 * minutes), 40000)
}

// Foursquare category IDs per meal type
// See: https://docs.foursquare.com/data-products/docs/categories
const FSQ_CATEGORIES = {
  all:       '13065,13032,13040',        // Restaurant, Café, Fast Food
  breakfast: '13072,13032',              // Breakfast Spot, Café
  lunch:     '13065,13040,13032',        // Restaurant, Fast Food, Café
  dinner:    '13065',                    // Restaurant
  treat:     '13035,13046,13002,13032',  // Dessert Shop, Ice Cream Parlor, Bakery, Café
}

const FSQ_FIELDS = 'fsq_id,name,location,geocodes,categories,price,rating,stats,tel,website'

export async function searchNearbyRestaurants(location, radius, category = 'all', maxPrice = 0) {
  const { lat, lng } = location

  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
    radius: Math.min(radius, 40000),
    categories: FSQ_CATEGORIES[category] ?? FSQ_CATEGORIES.all,
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

  let results = (data.results ?? []).map(mapFoursquareBusiness)

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

  const loc = biz.location ?? {}
  const addressParts = [loc.address, loc.city, loc.state, loc.postcode].filter(Boolean)
  const address = addressParts.length > 0 ? addressParts.join(', ') : null

  const priceLevel = biz.price ?? null  // already 1–4 integer from Foursquare
  const priceLabel = priceLevel ? '$'.repeat(priceLevel) : null

  // Foursquare rates out of 10; convert to out of 5 for display
  const rating = biz.rating ? Math.round((biz.rating / 2) * 10) / 10 : null
  const reviewCount = biz.stats?.total_ratings ?? null

  return {
    id: biz.fsq_id,
    name: biz.name,
    cuisine: categoryName,
    address,
    phone: biz.tel ?? null,
    website: biz.website ?? null,
    openingHours: null,
    priceLevel,
    priceLabel,
    rating,
    reviewCount,
    lat: biz.geocodes?.main?.latitude ?? null,
    lng: biz.geocodes?.main?.longitude ?? null,
    suit,
    suitColor: color,
  }
}
