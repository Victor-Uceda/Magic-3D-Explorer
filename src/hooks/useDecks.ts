import { useState, useEffect, useCallback } from 'react';
import type { DeckItem } from '../pages/DeckBuilderPage';
import type { Card } from '../types/card';
import { defaultStorageRepository, ICardStorageRepository } from '../services/storage/cardStorage';

export interface UseDecksReturn {
  decks: DeckItem[];
  setDecks: React.Dispatch<React.SetStateAction<DeckItem[]>>;
  createDeck: (name: string, format: string) => void;
  deleteDeck: (deckId: string) => void;
  updateDeck: (updated: DeckItem) => void;
  addCardsToDeck: (deckId: string, cardsToAdd: Card[]) => void;
  importDeck: (deck: DeckItem) => void;
}

export function useDecks(
  storageRepo: ICardStorageRepository = defaultStorageRepository
): UseDecksReturn {
  const [decks, setDecks] = useState<DeckItem[]>(() => storageRepo.getDecks());

  // Persistir en el repositorio
  useEffect(() => {
    storageRepo.saveDecks(decks);
  }, [decks, storageRepo]);

  const createDeck = useCallback((name: string, format: string) => {
    const newDeck: DeckItem = {
      id: `deck-${Date.now()}`,
      name,
      format,
      description: '',
      cards: [],
      createdAt: Date.now(),
    };
    setDecks((prev) => [newDeck, ...prev]);
  }, []);

  const deleteDeck = useCallback((deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  }, []);

  const updateDeck = useCallback((updated: DeckItem) => {
    setDecks((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }, []);

  const addCardsToDeck = useCallback((deckId: string, cardsToAdd: Card[]) => {
    setDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== deckId) return deck;
        const newCardsMap = new Map<string, { card: Card; quantity: number }>();
        for (const item of deck.cards) {
          newCardsMap.set(item.card.id, { ...item });
        }
        for (const card of cardsToAdd) {
          const existing = newCardsMap.get(card.id);
          if (existing) {
            existing.quantity += 1;
          } else {
            newCardsMap.set(card.id, { card, quantity: 1 });
          }
        }
        return {
          ...deck,
          cards: Array.from(newCardsMap.values()),
        };
      })
    );
  }, []);

  const importDeck = useCallback((deck: DeckItem) => {
    setDecks((prev) => [deck, ...prev.filter((d) => d.id !== deck.id)]);
  }, []);

  return {
    decks,
    setDecks,
    createDeck,
    deleteDeck,
    updateDeck,
    addCardsToDeck,
    importDeck,
  };
}
