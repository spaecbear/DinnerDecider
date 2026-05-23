export default function CardDetail({ restaurant, onClose, isFavorite, onFavoriteClick }) {
  const { name, cuisine, address, phone, website, rating, reviewCount, suit, suitColor } = restaurant

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-card" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="detail-header-simple" style={{ '--suit-color': suitColor }}>
          <span className="detail-suit-large" style={{ color: suitColor }}>{suit}</span>
          <div className="detail-title-block">
            <h2 className="detail-name">{name}</h2>
            <div className="detail-cuisine-badge">{cuisine}</div>
          </div>
          <div className="detail-header-actions">
            <button
              className={`detail-fav-btn${isFavorite ? ' is-favorite' : ''}`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={() => onFavoriteClick?.(restaurant)}
            >
              {isFavorite ? '♥' : '♡'}
            </button>
            <button className="detail-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="detail-body">

          {address && (
            <div className="detail-section">
              <h3>📍 Address</h3>
              <p>{address}</p>
            </div>
          )}

          {phone && (
            <div className="detail-section">
              <h3>📞 Phone</h3>
              <p><a href={`tel:${phone}`}>{phone}</a></p>
            </div>
          )}

          {website && (
            <div className="detail-section">
              <h3>🌐 Website</h3>
              <p>
                <a href={website} target="_blank" rel="noreferrer">
                  {website.replace(/^https?:\/\//, '').replace(/\/$/, '')} ↗
                </a>
              </p>
            </div>
          )}

          {rating && (
            <div className="detail-section">
              <h3>⭐ Rating</h3>
              <p>{rating} / 5{reviewCount ? ` (${reviewCount.toLocaleString()} reviews)` : ''}</p>
            </div>
          )}

          {address && (
            <div className="detail-section">
              <h3>🗺 Map</h3>
              <p>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${name} ${address}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Search on Google Maps ↗
                </a>
              </p>
            </div>
          )}

          {!address && !phone && !website && !rating && (
            <p className="detail-sparse">
              No additional details available for this location.
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
