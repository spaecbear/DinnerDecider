# Dinner Decider

Can't decide where to eat? Let fate choose. Dinner Decider finds nearby restaurants and deals them out as playing cards. Browse the options or hit **Pick a Card** to let the app decide for you.

## Features

- Uses your current location or any address / zip code
- Filter by category — All, Breakfast, Lunch, Dinner, or Treat
- Set a max drive time to only see places you can actually get to
- Avg cost filter ($ to $$$$) when price data is available
- Restaurants displayed as playing cards — suit assigned by cuisine type
- **Pick a Card** — flips all cards face-down, shuffles positions, then you choose which card to reveal
- Save to your home screen for a native app experience (see below)
- Tap any card for address, hours, phone, website, and map links
- 100% free — no API keys, no sign-up required (powered by OpenStreetMap)

## Install on Your Phone

Dinner Decider is a Progressive Web App (PWA) — you can save it to your home screen and use it like a native app, no App Store required.

### iPhone / iPad (Safari)

1. Open [dinner-decider-ivory.vercel.app](https://dinner-decider-ivory.vercel.app) in **Safari**
2. Tap the **Share** button (the box with an arrow pointing up) at the bottom of the screen
3. Scroll down and tap **Add to Home Screen**
4. Give it a name and tap **Add**

> Safari is required on iOS — Chrome and other iOS browsers don't support PWA installation.

### Android (Chrome)

1. Open the site in **Chrome**
2. Tap the **three-dot menu** (⋮) in the top-right corner
3. Tap **Add to Home screen**
4. Tap **Add** to confirm

Once installed, the app opens full-screen with no browser chrome, just like a native app.

---

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
