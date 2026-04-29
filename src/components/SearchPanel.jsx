import { useState } from 'react'

const CATEGORIES = [
  { value: 'all',       label: 'All',       emoji: '🍽️' },
  { value: 'breakfast', label: 'Breakfast',  emoji: '🥞' },
  { value: 'lunch',     label: 'Lunch',      emoji: '🥗' },
  { value: 'dinner',    label: 'Dinner',     emoji: '🍷' },
  { value: 'treat',     label: 'Treat',      emoji: '🍦' },
]

const PRICE_LABELS = ['Any', '$', '$$', '$$$', '$$$$']

export default function SearchPanel({ onSearch, loading }) {
  const [locationMode, setLocationMode] = useState('current')
  const [locationInput, setLocationInput] = useState('')
  const [maxDriveTime, setMaxDriveTime] = useState(15)
  const [category, setCategory] = useState('all')
  const [maxPrice, setMaxPrice] = useState(0)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (locationMode === 'manual' && !locationInput.trim()) return
    onSearch({
      useCurrentLocation: locationMode === 'current',
      locationQuery: locationInput.trim(),
      maxDriveTime,
      category,
      maxPrice,
    })
  }

  return (
    <div className="search-panel">
      <div className="search-panel-inner">
        <h1 className="app-title">
          <span className="suit red">♥</span>
          Dinner Decider
          <span className="suit red">♦</span>
        </h1>
        <p className="app-subtitle">Let fate choose your next meal</p>

        <form onSubmit={handleSubmit} className="search-form">

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Location</label>
            <div className="location-toggle">
              <button
                type="button"
                className={`toggle-btn ${locationMode === 'current' ? 'active' : ''}`}
                onClick={() => setLocationMode('current')}
              >
                📍 Use My Location
              </button>
              <button
                type="button"
                className={`toggle-btn ${locationMode === 'manual' ? 'active' : ''}`}
                onClick={() => setLocationMode('manual')}
              >
                🔍 Enter Address
              </button>
            </div>
            {locationMode === 'manual' && (
              <input
                className="text-input"
                type="text"
                placeholder="City, zip code, or full address…"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                autoFocus
              />
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-buttons">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${category === cat.value ? 'active' : ''}`}
                  onClick={() => setCategory(cat.value)}
                  title={cat.label}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Drive Time */}
          <div className="form-group">
            <label className="form-label">
              Max Drive Time
              <span className="form-value">{maxDriveTime} min</span>
            </label>
            <div className="slider-track">
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={maxDriveTime}
                onChange={(e) => setMaxDriveTime(Number(e.target.value))}
                className="slider"
              />
              <div className="slider-labels">
                <span>5 min</span>
                <span>30 min</span>
                <span>60 min</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">
              Avg Cost
              <span className="form-value price-value">
                {PRICE_LABELS[maxPrice]}
              </span>
            </label>
            <div className="slider-track">
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="slider price-slider"
              />
              <div className="slider-labels">
                {PRICE_LABELS.map((l, i) => (
                  <span key={i} className={maxPrice === i ? 'active-tick' : ''}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="deal-btn" disabled={loading}>
            {loading ? (
              <span className="dealing-text">Finding restaurants<span className="dots" /></span>
            ) : (
              '🃏 Deal the Cards'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
