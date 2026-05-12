export default function DiscardsTab({ discards, onRestore, onRemove, onClearAll }) {
  if (discards.length === 0) {
    return (
      <div className="discards-empty">
        <span className="discards-empty-icon">🚫</span>
        <p>No discarded restaurants.</p>
        <p className="discards-empty-hint">
          Tap ✕ on any card during a search to hide it from future results.
        </p>
      </div>
    )
  }

  return (
    <div className="discards-tab">
      <div className="discards-header">
        <span className="discards-header-count">{discards.length} discarded</span>
        <button className="discards-clear-btn" onClick={onClearAll}>
          Restore All
        </button>
      </div>

      <ul className="discards-list">
        {discards.map((r) => (
          <li key={r.id} className="discard-item">
            <span className="discard-item-suit" style={{ color: r.suitColor }}>{r.suit}</span>
            <div className="discard-item-info">
              <span className="discard-item-name">{r.name}</span>
              <span className="discard-item-meta">{r.cuisine}{r.address ? ` · ${r.address}` : ''}</span>
            </div>
            <div className="discard-item-actions">
              <button
                className="discard-restore-btn"
                title="Restore to search results"
                onClick={() => onRestore(r)}
              >
                ↩ Restore
              </button>
              <button
                className="discard-remove-btn"
                title="Remove from list"
                onClick={() => onRemove(r)}
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
