import { useState, useEffect, useCallback } from 'react';
import type { Card } from '../types/card';
import { defaultStorageRepository, ICardStorageRepository } from '../services/storage/cardStorage';

export interface UseFavoritesReturn {
  favorites: Card[];
  toggleFavorite: (card: Card) => void;
  isFavorite: (cardId: string) => boolean;
  clearFavorites: () => void;
}

export function useFavorites(
  storageRepo: ICardStorageRepository = defaultStorageRepository
): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Card[]>(() => storageRepo.getFavorites());

  // Persistir en el repositorio cada vez que cambien
  useEffect(() => {
    storageRepo.saveFavorites(favorites);
  }, [favorites, storageRepo]);

  const toggleFavorite = useCallback((card: Card) => {
    setFavorites((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      if (exists) {
        return prev.filter((c) => c.id !== card.id);
      }
      return [card, ...prev];
    });
  }, []);

  const isFavorite = useCallback(
    (cardId: string) => favorites.some((c) => c.id === cardId),
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
