export const config = {
  api: { bodyParser: false },
}

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const body = Buffer.concat(chunks).toString()

  for (const mirror of MIRRORS) {
    try {
      const upstream = await fetch(mirror, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'DinnerDecider/1.0 (https://dinner-decider-ivory.vercel.app)',
        },
        body,
        signal: AbortSignal.timeout(25000),
      })

      if (!upstream.ok) continue

      const data = await upstream.json()
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      return res.status(200).json(data)
    } catch {
      continue
    }
  }

  return res.status(503).json({ error: 'All Overpass mirrors are unavailable. Please try again.' })
}
