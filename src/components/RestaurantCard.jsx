export default function RestaurantCard({
  restaurant,
  isFlipped,
  isHighlighted,
  isDimmed,
  style,
  onClick,
  onInfoClick,
  isFavorite,
  onFavoriteClick,
}) {
  const { name, cuisine, address, priceLabel, suit, suitColor } = restaurant

  return (
    <div
      className={[
        'card',
        isFlipped     ? 'flipped'     : '',
        isHighlighted ? 'highlighted' : '',
        isDimmed      ? 'dimmed'      : '',
      ].join(' ')}
      style={style}
      onClick={onClick}
      title={isFlipped ? 'Click for more info' : ''}
    >
      <div className="card-inner">

        {/* ── BACK (face-down) ── */}
        <div className="card-face card-back-face">
          <div className="card-back-border">
            <div className="card-back-pattern">
              <div className="back-diamond-grid">
                {Array.from({ length: 35 }).map((_, i) => (
                  <span key={i} className="back-diamond">◆</span>
                ))}
              </div>
              <div className="back-center-emblem">
                <span>🍽️</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FRONT (face-up) ── */}
        <div className="card-face card-front-face">

          {/* Top-left corner */}
          <div className="card-corner tl">
            <div className="corner-cuisine">{cuisine.slice(0, 3).toUpperCase()}</div>
            <div className="corner-suit" style={{ color: suitColor }}>{suit}</div>
          </div>

          {/* Card body */}
          <div className="card-body">
            <div className="card-suit-display" style={{ color: suitColor }}>{suit}</div>
            <div className="card-name">{name}</div>
            <div className="card-cuisine-label">{cuisine}</div>
            {priceLabel && (
              <div className="card-price-tag" style={{ color: suitColor }}>{priceLabel}</div>
            )}
            {address && <div className="card-address">{address}</div>}
          </div>

          {/* Bottom-right corner (rotated 180°) */}
          <div className="card-corner br">
            <div className="corner-cuisine">{cuisine.slice(0, 3).toUpperCase()}</div>
            <div className="corner-suit" style={{ color: suitColor }}>{suit}</div>
          </div>

          {/* Bottom action buttons — always visible when face-up */}
          <div className="card-bottom-actions">
            <button
              className="card-info-btn"
              title="More details"
              onClick={(e) => { e.stopPropagation(); onInfoClick?.(restaurant) }}
            >
              ℹ
            </button>
            <button
              className={`card-fav-btn${isFavorite ? ' is-favorite' : ''}`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={(e) => { e.stopPropagation(); onFavoriteClick?.(restaurant) }}
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
