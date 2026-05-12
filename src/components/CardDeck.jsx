import { useState, useEffect, useRef } from 'react'
import RestaurantCard from './RestaurantCard'

function cardTilt(index) {
  const tilts = [-3, 2, -1.5, 3.5, -2.5, 1, -3.5, 2.5, -1, 3, -2, 1.5]
  return tilts[index % tilts.length]
}

// phase flow:
//   idle          → all face-up, user browses
//   flipping-down → all flip face-down (700ms flip animation)
//   shuffling     → shuffle wiggle plays (1200ms)
//   selecting     → all face-down, user taps one to choose
//   revealing     → chosen card flips face-up (700ms flip animation)
//   picked        → winner shown, others dimmed

function fisherYates(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function CardDeck({ restaurants, onInfoClick, isFavorite, onFavoriteClick, onDiscardClick }) {
  const allIds = () => new Set(restaurants.map((r) => r.id))

  const [flipped, setFlipped] = useState(allIds)   // start face-up
  const [phase, setPhase] = useState('idle')
  const [pickedId, setPickedId] = useState(null)
  const [displayOrder, setDisplayOrder] = useState(() => [...restaurants])
  const timers = useRef([])

  // Reset to face-up whenever a new search comes in
  useEffect(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setFlipped(allIds())
    setPhase('idle')
    setPickedId(null)
    setDisplayOrder([...restaurants])
  }, [restaurants])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function later(fn, ms) {
    const id = setTimeout(fn, ms)
    timers.current.push(id)
  }

  const handleCardClick = (restaurant) => {
    if (phase === 'selecting' && !flipped.has(restaurant.id)) {
      // User chose a face-down card — reveal it
      timers.current.forEach(clearTimeout)
      timers.current = []
      setPickedId(restaurant.id)
      setFlipped(new Set([restaurant.id]))
      setPhase('revealing')
      later(() => setPhase('picked'), 750)
      return
    }
    // Face-up cards in idle/picked state open the detail panel
    if ((phase === 'idle' || phase === 'picked') && flipped.has(restaurant.id)) {
      onInfoClick?.(restaurant)
    }
  }

  const handlePickACard = () => {
    if (phase === 'shuffling' || phase === 'flipping-down' || phase === 'revealing') return

    timers.current.forEach(clearTimeout)
    timers.current = []

    // Step 1 — flip everything face-down
    setPhase('flipping-down')
    setPickedId(null)
    setFlipped(new Set())

    // Step 2 — reorder cards and start shuffle wiggle once face-down
    later(() => {
      setDisplayOrder(prev => fisherYates(prev))
      setPhase('shuffling')
    }, 700)

    // Step 3 — wait for shuffle to finish, then let the user choose
    later(() => setPhase('selecting'), 700 + 1200)
  }

  const handleDealAgain = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setPhase('idle')
    setPickedId(null)
    setFlipped(allIds())
    setDisplayOrder([...restaurants])
  }

  const isBusy = phase === 'flipping-down' || phase === 'shuffling' || phase === 'revealing'

  return (
    <div className="deck-section">
      <div className="deck-controls">
        <div className="deck-count">{restaurants.length} restaurants found</div>
        <div className="deck-actions">
          {(phase === 'picked' || phase === 'selecting') && (
            <button className="reset-btn" onClick={handleDealAgain}>
              ↩ Show All
            </button>
          )}
          <button
            className={`pick-btn ${isBusy ? 'shuffling' : ''}`}
            onClick={handlePickACard}
            disabled={isBusy}
          >
            {phase === 'idle'                        && '🎴 Pick a Card'}
            {(phase === 'flipping-down' ||
              phase === 'shuffling'     ||
              phase === 'revealing')                 && 'Shuffling…'}
            {phase === 'selecting'                   && '🔀 Shuffle Again'}
            {phase === 'picked'                      && '🎴 Pick Again'}
          </button>
        </div>
      </div>

      {phase === 'picked' && pickedId && (
        <div className="picked-banner">
          ✨ Tonight you're going to{' '}
          <strong>{restaurants.find((r) => r.id === pickedId)?.name}</strong>!
        </div>
      )}

      {phase === 'idle' && (
        <p className="deck-hint">Tap any card for details · or let fate decide with Pick a Card</p>
      )}

      {phase === 'selecting' && (
        <p className="deck-hint selecting-hint">✨ Choose your card — tap to reveal your dinner destiny</p>
      )}

      <div className={`card-grid ${phase === 'shuffling' ? 'is-shuffling' : ''} ${phase === 'selecting' ? 'is-selecting' : ''}`}>
        {displayOrder.map((r, i) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            isFlipped={flipped.has(r.id)}
            isHighlighted={phase === 'picked' && pickedId === r.id}
            isDimmed={phase === 'picked' && pickedId !== r.id}
            isSelectable={phase === 'selecting' && !flipped.has(r.id)}
            style={{ '--tilt': `${cardTilt(i)}deg`, '--i': i }}
            onClick={() => handleCardClick(r)}
            onInfoClick={onInfoClick}
            isFavorite={isFavorite?.(r.id)}
            onFavoriteClick={onFavoriteClick}
            onDiscardClick={onDiscardClick}
          />
        ))}
      </div>
    </div>
  )
}
