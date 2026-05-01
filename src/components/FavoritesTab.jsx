import CardDeck from './CardDeck'

export default function FavoritesTab({ favorites, onInfoClick, isFavorite, onFavoriteClick }) {
  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <span className="favorites-empty-icon">♡</span>
        <p>No favorites yet.</p>
        <p className="favorites-empty-hint">
          Search for restaurants and tap ♥ on any card to save it here.
        </p>
      </div>
    )
  }

  return (
    <CardDeck
      restaurants={favorites}
      onInfoClick={onInfoClick}
      isFavorite={isFavorite}
      onFavoriteClick={onFavoriteClick}
    />
  )
}
