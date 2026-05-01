import { useState, useEffect } from 'react'

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dd-favorites') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('dd-favorites', JSON.stringify(favorites))
  }, [favorites])

  const isFavorite = (id) => favorites.some((f) => f.id === id)

  const toggleFavorite = (restaurant) => {
    setFavorites((prev) =>
      isFavorite(restaurant.id)
        ? prev.filter((f) => f.id !== restaurant.id)
        : [...prev, restaurant]
    )
  }

  return { favorites, isFavorite, toggleFavorite }
}
