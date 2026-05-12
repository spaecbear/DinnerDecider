import { useState, useEffect } from 'react'

export function useDiscards() {
  const [discards, setDiscards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dd-discards') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('dd-discards', JSON.stringify(discards))
  }, [discards])

  const isDiscarded = (id) => discards.some((d) => d.id === id)

  const discard = (restaurant) => {
    setDiscards((prev) =>
      isDiscarded(restaurant.id) ? prev : [...prev, restaurant]
    )
  }

  const restore = (restaurant) => {
    setDiscards((prev) => prev.filter((d) => d.id !== restaurant.id))
  }

  const clearDiscards = () => setDiscards([])

  return { discards, isDiscarded, discard, restore, clearDiscards }
}
