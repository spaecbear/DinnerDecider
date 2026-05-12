import CardDeck from './CardDeck'

export default function DiscardsTab({ discards, onInfoClick, isFavorite, onFavoriteClick, onRestore, onClearAll }) {
  if (discards.length === 0) {
    return (
      <div className="discards-empty">
        <span className="discards-empty-icon">♠</span>
        <p>No discarded restaurants.</p>
        <p className="discards-empty-hint">
          Tap ✕ on any card during a search to hide it from future results.
        </p>
      </div>
    )
  }

  return (
    <div className="discards-tab-wrapper">
      <div className="discards-tab-header">
        <button className="discards-clear-btn" onClick={onClearAll}>
          ↩ Restore All
        </button>
      </div>
      <CardDeck
        restaurants={discards}
        onInfoClick={onInfoClick}
        isFavorite={isFavorite}
        onFavoriteClick={onFavoriteClick}
        onRestoreClick={onRestore}
        countLabel="discarded"
      />
    </div>
  )
}
