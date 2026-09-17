import { useState, useEffect } from 'react';

const STORAGE_KEY = 'frameify_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Gagal menyimpan favorit ke localStorage', e);
    }
  }, [favorites]);

  const toggleFavorite = (photo) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === photo.id);
      if (exists) {
        return prev.filter((item) => item.id !== photo.id);
      } else {
        return [photo, ...prev];
      }
    });
  };

  const isFavorite = (photoId) => {
    return favorites.some((item) => item.id === photoId);
  };

  return { favorites, toggleFavorite, isFavorite };
}
