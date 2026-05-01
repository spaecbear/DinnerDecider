import { useState } from 'react'
import SearchPanel from './components/SearchPanel'
import CardDeck from './components/CardDeck'
import CardDetail from './components/CardDetail'
import FavoritesTab from './components/FavoritesTab'
import { useFavorites } from './hooks/useFavorites'
import {
  getCurrentLocation,
  geocodeAddress,
  driveTimeToRadius,
  searchNearbyRestaurants,
} from './services/mapsService'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [restaurants, setRestaurants] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [locationLabel, setLocationLabel] = useState('')
  const [detailRestaurant, setDetailRestaurant] = useState(null)
  const [activeTab, setActiveTab] = useState('search')

  const { favorites, isFavorite, toggleFavorite } = useFavorites()

  const handleSearch = async ({ useCurrentLocation, locationQuery, maxDriveTime, category, maxPrice }) => {
    setLoading(true)
    setSearchError(null)
    setRestaurants([])
    setHasSearched(false)

    try {
      let location
      if (useCurrentLocation) {
        location = await getCurrentLocation()
        setLocationLabel('your location')
      } else {
        location = await geocodeAddress(locationQuery)
        setLocationLabel(location.label ?? locationQuery)
      }

      const radius = driveTimeToRadius(maxDriveTime)
      const results = await searchNearbyRestaurants(location, radius, category, maxPrice)
      setRestaurants(results)
      setHasSearched(true)
    } catch (e) {
      setSearchError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="felt-bg" />

      {activeTab === 'search' && (
        <>
          <SearchPanel onSearch={handleSearch} loading={loading} />

          {searchError && (
            <div className="search-error">
              <span>⚠️</span> {searchError}
            </div>
          )}

          {loading && (
            <div className="loading-deck">
              <div className="loading-cards">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="loading-card" style={{ '--i': i }} />
                ))}
              </div>
              <p>Searching near {locationLabel || '…'}</p>
            </div>
          )}

          {hasSearched && !loading && restaurants.length === 0 && (
            <div className="no-results">
              <span className="no-results-suits">♠ ♥ ♦ ♣</span>
              <p>No restaurants found. Try increasing your drive time.</p>
            </div>
          )}

          {restaurants.length > 0 && !loading && (
            <CardDeck
              restaurants={restaurants}
              onInfoClick={setDetailRestaurant}
              isFavorite={isFavorite}
              onFavoriteClick={toggleFavorite}
            />
          )}
        </>
      )}

      {activeTab === 'favorites' && (
        <FavoritesTab
          favorites={favorites}
          onInfoClick={setDetailRestaurant}
          isFavorite={isFavorite}
          onFavoriteClick={toggleFavorite}
        />
      )}

      {detailRestaurant && (
        <CardDetail
          restaurant={detailRestaurant}
          onClose={() => setDetailRestaurant(null)}
          isFavorite={isFavorite(detailRestaurant.id)}
          onFavoriteClick={toggleFavorite}
        />
      )}

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <button
          className={`nav-btn${activeTab === 'search' ? ' active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <span className="nav-btn-icon">🔍</span>
          <span className="nav-btn-label">Search</span>
        </button>
        <button
          className={`nav-btn${activeTab === 'favorites' ? ' active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          <span className="nav-btn-icon">{favorites.length > 0 ? '♥' : '♡'}</span>
          <span className="nav-btn-label">
            Favorites{favorites.length > 0 ? ` (${favorites.length})` : ''}
          </span>
        </button>
      </nav>
    </div>
  )
}
