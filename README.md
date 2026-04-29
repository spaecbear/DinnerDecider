# Dinner Decider

Can't decide where to eat? Let fate choose. Dinner Decider finds nearby restaurants and deals them out as playing cards. Browse the options or hit **Pick a Card** to let the app decide for you.

## Features

- Uses your current location or any address / zip code
- Filter by category — All, Breakfast, Lunch, Dinner, or Treat
- Set a max drive time to only see places you can actually get to
- Avg cost filter ($ to $$$$) when price data is available
- Restaurants displayed as playing cards — suit assigned by cuisine type
- **Pick a Card** — flips all cards face-down, shuffles, and reveals one winner
- Tap any card for address, hours, phone, website, and map links
- 100% free — no API keys, no sign-up required (powered by OpenStreetMap)

## Getting Started

### Requirements

- [Node.js](https://nodejs.org) (v18 or higher)

### Install & Run

```bash
git clone https://github.com/spaecbear/DinnerDecider.git
cd DinnerDecider
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

## How It Works

| Service | What it does | Cost |
|---|---|---|
| Browser Geolocation API | Gets your current location | Free |
| [Nominatim](https://nominatim.org) (OpenStreetMap) | Converts addresses to coordinates | Free |
| [Overpass API](https://overpass-api.de) (OpenStreetMap) | Finds nearby restaurants | Free |

## Built With

- [React](https://react.dev) + [Vite](https://vitejs.dev)
- OpenStreetMap (Nominatim + Overpass API)
- Vanilla CSS with playing card animations
