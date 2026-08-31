import { useState, useCallback } from 'react';
import type { Card } from '../types/card';
import type { DeckItem } from '../pages/DeckBuilderPage';

interface UseDeckPickerOptions {
  decks: DeckItem[];
  updateDeck: (updated: DeckItem) => void;
  setDecks: React.Dispatch<React.SetStateAction<DeckItem[]>>;
  showToast: (title: string, subtitle?: string) => void;
}

export interface UseDeckPickerReturn {
  pendingCards: Card[];
  openDeckPicker: (cards: Card[]) => void;
  closeDeckPicker: () => void;
  confirmAddToDeck: (deckId: string) => void;
  createNewDeckWithPending: () => void;
}

export function useDeckPicker({
  decks,
  updateDeck,
  setDecks,
  showToast,
}: UseDeckPickerOptions): UseDeckPickerReturn {
  const [pendingCards, setPendingCards] = useState<Card[]>([]);

  const openDeckPicker = useCallback((cards: Card[]) => {
    if (cards.length === 0) return;
    setPendingCards(cards);
  }, []);

  const closeDeckPicker = useCallback(() => {
    setPendingCards([]);
  }, []);

  const confirmAddToDeck = useCallback(
    (deckId: string) => {
      if (pendingCards.length === 0) return;
      const targetDeck = decks.find((d) => d.id === deckId);
      if (!targetDeck) return;

      const deckCardsMap = new Map<string, { card: Card; quantity: number }>();
      targetDeck.cards.forEach((entry) => deckCardsMap.set(entry.card.id, { ...entry }));

      pendingCards.forEach((card) => {
        const existing = deckCardsMap.get(card.id);
        if (existing) {
          existing.quantity += 1;
        } else {
          deckCardsMap.set(card.id, { card, quantity: 1 });
        }
      });

      const updatedDeck: DeckItem = {
        ...targetDeck,
        cards: Array.from(deckCardsMap.values()),
      };
      updateDeck(updatedDeck);

      const isBulk = pendingCards.length > 1;
      showToast(
        isBulk
          ? `¡${pendingCards.length} cartas añadidas al mazo!`
          : `¡"${pendingCards[0].name}" agregada al mazo!`,
        `${targetDeck.name} • Total: ${updatedDeck.cards.reduce((s, i) => s + i.quantity, 0)} cartas`
      );
      setPendingCards([]);
    },
    [decks, pendingCards, showToast, updateDeck]
  );

  const createNewDeckWithPending = useCallback(() => {
    if (pendingCards.length === 0) return;
    const newDeck: DeckItem = {
      id: `deck-${Date.now()}`,
      name: `Nuevo Mazo #${decks.length + 1}`,
      format: 'commander',
      description: 'Mazo creado rápidamente',
      cards: pendingCards.map((card) => ({ card, quantity: 1 })),
      createdAt: Date.now(),
    };
    setDecks((prev) => [...prev, newDeck]);
    showToast(
      pendingCards.length > 1
        ? `¡${pendingCards.length} cartas en nuevo mazo!`
        : `¡"${pendingCards[0].name}" en nuevo mazo!`,
      `Creado "${newDeck.name}"`
    );
    setPendingCards([]);
  }, [decks.length, pendingCards, setDecks, showToast]);

  return {
    pendingCards,
    openDeckPicker,
    closeDeckPicker,
    confirmAddToDeck,
    createNewDeckWithPending,
  };
}
