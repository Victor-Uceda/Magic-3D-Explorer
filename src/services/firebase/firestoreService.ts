/**
 * Servicio de Sincronización Cloud Firestore (firestoreService.ts)
 * 
 * Gestiona el almacenamiento de mazos y cartas favoritas en la nube
 * organizados por usuario:
 * - `users/{userId}/decks/{deckId}`
 * - `users/{userId}/favorites/collection`
 */

import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { DeckItem } from '../../pages/DeckBuilderPage';
import type { Card } from '../../types/card';

function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      return value === undefined ? null : value;
    })
  );
}

/** Guarda o actualiza un mazo en la nube */
export async function saveCloudDeck(userId: string, deck: DeckItem): Promise<void> {
  try {
    const cleanDeck = sanitizeForFirestore(deck);
    const deckRef = doc(db, 'users', userId, 'decks', deck.id);
    await setDoc(deckRef, cleanDeck, { merge: true });
    console.log(`[Firestore] Mazo "${deck.name}" guardado en la nube exitosamente.`);
  } catch (error) {
    console.error('[Firestore] Error al guardar mazo en la nube:', error);
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

/** Suscripción en tiempo real a los mazos del usuario (Sincronización Automática sin botones) */
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
    return () => {};
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
