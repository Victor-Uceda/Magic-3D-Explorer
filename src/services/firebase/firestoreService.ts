/**
 * Servicio de Persistencia Firestore en 3 Niveles (firestoreService.ts)
 * 
 * Arquitectura de Base de Datos Optimizada:
 * - Nivel 1: `/decks/{deckId}` -> Snapshot ligero (O(1), Cero N+1, stats precalculadas)
 * - Nivel 2: `/cards/{cardId}` -> Catálogo canónico centralizado con series de tiempo (30 días)
 * - Nivel 3: `/users/{userId}/inventory` + `/booster_openings` -> Transacciones atómicas (WriteBatch ACID)
 * - Nivel 4: `/users/{userId}/favorites` -> Favoritos del usuario
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { DeckItem } from '../../pages/DeckBuilderPage';
import type { Card } from '../../types/card';
import type {
  DeckDocument,
  DeckSlotLight,
  CanonicalCardDocument,
  BoosterOpeningRecord,
  UserInventoryItem,
} from '../../types/database';

function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      return value === undefined ? null : value;
    })
  );
}

// =================================================================
// 1. NIVEL 1: MAZOS (Lectura O(1), Snapshot Ligero & Compatibilidad)
// =================================================================

/** Guarda o actualiza un mazo en la nube (Actualiza tanto /users/decks como /cards en catálogo) */
export async function saveCloudDeck(userId: string, deck: DeckItem): Promise<void> {
  try {
    const cleanDeck = sanitizeForFirestore(deck);
    const deckRef = doc(db, 'users', userId, 'decks', deck.id);
    await setDoc(deckRef, cleanDeck, { merge: true });

    // Sincronizar simultáneamente en segundo plano con el Catálogo Canónico /cards
    if (Array.isArray(deck.cards)) {
      deck.cards.forEach((item) => {
        if (item?.card?.id) {
          upsertCanonicalCard(item.card).catch((err) => {
            console.debug('[Firestore] Sync canónico omitido para carta:', item.card.id, err);
          });
        }
      });
    }

    console.log(`[Firestore] Mazo "${deck.name}" sincronizado exitosamente.`);
  } catch (error) {
    console.error('[Firestore] Error al guardar mazo en la nube:', error);
    throw error;
  }
}

/** Guarda un mazo utilizando el modelo optimizado de Snapshot Ligero */
export async function saveDeckOptimized(
  userId: string,
  deckId: string,
  name: string,
  format: DeckDocument['format'],
  fullCards: { card: Card; quantity: number; finish?: 'normal' | 'foil' | 'etched' }[]
): Promise<void> {
  try {
    const slots: DeckSlotLight[] = fullCards.map((item) => ({
      cardId: item.card.id,
      name: item.card.name,
      cmc: item.card.cmc ?? 0,
      imageSmall: item.card.imageUris?.small || item.card.imageUris?.normal || '',
      quantity: item.quantity,
      finish: item.finish || 'normal',
    }));

    const totalCards = slots.reduce((acc, s) => acc + s.quantity, 0);
    const totalCmc = slots.reduce((acc, s) => acc + s.cmc * s.quantity, 0);
    const avgCmc = totalCards > 0 ? Number((totalCmc / totalCards).toFixed(2)) : 0;

    const estimatedValueUsd = Number(
      fullCards
        .reduce((acc, item) => {
          const p = parseFloat(item.card.prices?.usd || '0');
          return acc + p * item.quantity;
        }, 0)
        .toFixed(2)
    );

    const deckData: DeckDocument = {
      id: deckId,
      userId,
      name,
      format,
      stats: {
        totalCards,
        avgCmc,
        estimatedValueUsd,
        colorDistribution: {},
      },
      slots,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const deckRef = doc(db, 'decks', deckId);
    await setDoc(deckRef, deckData, { merge: true });
  } catch (error) {
    console.error('[Firestore] Error al guardar mazo optimizado:', error);
    throw error;
  }
}

/** Obtiene todos los mazos del usuario desde Firestore */
export async function getCloudDecks(userId: string): Promise<DeckItem[]> {
  try {
    const decksCol = collection(db, 'users', userId, 'decks');
    const snap = await getDocs(decksCol);
    const list: DeckItem[] = [];
    snap.forEach((d) => {
      list.push(d.data() as DeckItem);
    });
    return list;
  } catch (error) {
    console.error('[Firestore] Error al obtener mazos de la nube:', error);
    return [];
  }
}

/** Suscripción en tiempo real a los mazos del usuario */
export function subscribeToCloudDecks(userId: string, onUpdate: (decks: DeckItem[]) => void): () => void {
  try {
    const decksCol = collection(db, 'users', userId, 'decks');
    return onSnapshot(
      decksCol,
      (snap) => {
        const list: DeckItem[] = [];
        snap.forEach((d) => {
          list.push(d.data() as DeckItem);
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[Firestore] Error en listener de Firestore:', err);
      }
    );
  } catch (e) {
    console.warn('[Firestore] Excepción al suscribir listener:', e);
    return () => { };
  }
}

/** Elimina un mazo de la nube */
export async function deleteCloudDeck(userId: string, deckId: string): Promise<void> {
  try {
    const deckRef = doc(db, 'users', userId, 'decks', deckId);
    await deleteDoc(deckRef);
    console.log(`[Firestore] Mazo ${deckId} eliminado de la nube.`);
  } catch (error) {
    console.error('[Firestore] Error al eliminar mazo de la nube:', error);
    throw error;
  }
}

// =================================================================
// 2. NIVEL 2: CATÁLOGO CANÓNICO & SERIES DE TIEMPO (/cards)
// =================================================================

/**
 * Inserta o actualiza una carta en el catálogo canónico (/cards/{id})
 * Implementa estrategia Read-Through Cache y series temporales rotativas de 30 días
 */
export async function upsertCanonicalCard(card: Card): Promise<void> {
  try {
    const cardRef = doc(db, 'cards', card.id);
    const snap = await getDoc(cardRef);

    const today = new Date().toISOString().split('T')[0];
    const currentUsd = card.prices?.usd ? parseFloat(card.prices.usd) : null;
    const currentEur = card.prices?.eur ? parseFloat(card.prices.eur) : null;
    const currentPen = currentUsd ? Number((currentUsd * 3.75).toFixed(2)) : null;

    if (!snap.exists()) {
      const newDoc: CanonicalCardDocument = {
        id: card.id,
        name: card.name,
        manaCost: card.manaCost,
        cmc: card.cmc ?? 0,
        typeLine: card.typeLine,
        oracleText: card.oracleText,
        colors: card.colors || [],
        colorIdentity: card.colorIdentity || [],
        imageNormal: card.imageUris?.normal || '',
        currentPrice: { usd: currentUsd, eur: currentEur, pen: currentPen },
        priceHistory: [{ date: today, usd: currentUsd, eur: currentEur, pen: currentPen }],
        lastSyncedAt: new Date().toISOString(),
      };
      await setDoc(cardRef, newDoc);
    } else {
      const existing = snap.data() as CanonicalCardDocument;
      const history = existing.priceHistory || [];
      const hasToday = history.some((h) => h.date === today);

      let updatedHistory = history;
      if (!hasToday && (currentUsd !== null || currentEur !== null)) {
        updatedHistory = [...history, { date: today, usd: currentUsd, eur: currentEur, pen: currentPen }];
        if (updatedHistory.length > 30) {
          updatedHistory = updatedHistory.slice(updatedHistory.length - 30);
        }
      }

      await setDoc(
        cardRef,
        {
          currentPrice: { usd: currentUsd, eur: currentEur, pen: currentPen },
          priceHistory: updatedHistory,
          lastSyncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.debug('[Firestore] No se pudo actualizar carta canónica:', error);
  }
}

// =================================================================
// 3. NIVEL 3: SIMULADOR DE SOBRES & INVENTARIO TRANSACCIONAL (WriteBatch ACID)
// =================================================================

/**
 * Registra de forma atómica la apertura de un sobre de 15 cartas:
 * 1. Crea el documento inmutable de auditoría en /booster_openings
 * 2. Incrementa las cantidades en /users/{userId}/inventory/{cardId}
 * Total: 16 escrituras atómicas (garantía ACID sin condiciones de carrera)
 */
export async function commitBoosterOpeningAtomic(
  userId: string,
  setCode: string,
  openedCards: { card: Card; isFoil: boolean }[],
  costPen: number
): Promise<string> {
  try {
    const batch = writeBatch(db);
    const openingId = `booster_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Registro de auditoría
    const auditRef = doc(db, 'booster_openings', openingId);
    const auditData: BoosterOpeningRecord = {
      id: openingId,
      userId,
      setCode,
      openedAt: new Date().toISOString(),
      costPen,
      cardsRevealed: openedCards.map((c) => ({
        cardId: c.card.id,
        name: c.card.name,
        rarity: c.card.rarity,
        isFoil: c.isFoil,
      })),
    };
    batch.set(auditRef, auditData);

    // 2. Incrementar cartas en inventario del usuario
    const now = new Date().toISOString();
    for (const item of openedCards) {
      const invRef = doc(db, 'users', userId, 'inventory', item.card.id);
      batch.set(
        invRef,
        {
          cardId: item.card.id,
          quantity: increment(1),
          lastUpdated: now,
          firstAcquiredAt: now,
        },
        { merge: true }
      );
    }

    // Ejecución atómica
    await batch.commit();
    console.log(`[Firestore] Sobre ${setCode} guardado atómicamente en inventario (${openingId}).`);
    return openingId;
  } catch (error) {
    console.error('[Firestore] Error en transacción atómica de sobre:', error);
    throw error;
  }
}

/** Obtiene el inventario de cartas obtenidas por el usuario */
export async function getUserInventory(userId: string): Promise<UserInventoryItem[]> {
  try {
    const invCol = collection(db, 'users', userId, 'inventory');
    const snap = await getDocs(invCol);
    const list: UserInventoryItem[] = [];
    snap.forEach((d) => {
      list.push(d.data() as UserInventoryItem);
    });
    return list;
  } catch (error) {
    console.error('[Firestore] Error al obtener inventario:', error);
    return [];
  }
}

// =================================================================
// 4. FAVORITOS
// =================================================================

/** Guarda la colección completa de favoritos en la nube */
export async function saveCloudFavorites(userId: string, favorites: Card[]): Promise<void> {
  try {
    const cleanList = sanitizeForFirestore(favorites);
    const favDoc = doc(db, 'users', userId, 'favorites', 'all');
    await setDoc(favDoc, { list: cleanList }, { merge: true });
  } catch (error) {
    console.error('[Firestore] Error al guardar favoritos en la nube:', error);
    throw error;
  }
}

/** Obtiene la colección de favoritos desde Firestore */
export async function getCloudFavorites(userId: string): Promise<Card[]> {
  try {
    const favDoc = doc(db, 'users', userId, 'favorites', 'all');
    const snap = await getDoc(favDoc);
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.list)) {
        return data.list as Card[];
      }
    }
  } catch (error) {
    console.error('[Firestore] Error al obtener favoritos de la nube:', error);
  }
  return [];
}
