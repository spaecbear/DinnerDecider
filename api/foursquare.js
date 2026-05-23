export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.FOURSQUARE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Foursquare API key not configured' })
  }

  const params = new URLSearchParams(req.query)
  const url = `https://api.foursquare.com/v3/places/search?${params}`

  try {
    const upstream = await fetch(url, {
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      return res.status(upstream.status).json({ error: err })
    }

    const data = await upstream.json()
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return res.status(200).json(data)
  } catch {
    return res.status(503).json({ error: 'Foursquare API unavailable. Please try again.' })
  }
}
