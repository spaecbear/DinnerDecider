export default function CardDetail({ restaurant, onClose }) {
  const { name, cuisine, address, phone, website, openingHours, osmUrl, suit, suitColor } = restaurant

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
          <button className="detail-close" onClick={onClose}>✕</button>
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

          {openingHours && (
            <div className="detail-section">
              <h3>🕐 Hours</h3>
              <p className="hours-raw">{openingHours}</p>
            </div>
          )}

          <div className="detail-section">
            <h3>🗺 Map</h3>
            <p>
              <a href={osmUrl} target="_blank" rel="noreferrer">
                View on OpenStreetMap ↗
              </a>
            </p>
            {address && (
              <p style={{ marginTop: '0.35rem' }}>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(`${name} ${address}`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Search on Google Maps ↗
                </a>
              </p>
            )}
          </div>

          {!address && !phone && !website && !openingHours && (
            <p className="detail-sparse">
              No additional details available for this location in OpenStreetMap.
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
