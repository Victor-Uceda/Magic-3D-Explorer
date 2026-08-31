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

/** Guarda o actualiza un mazo en la nube */
export async function saveCloudDeck(userId: string, deck: DeckItem): Promise<void> {
  const deckRef = doc(db, 'users', userId, 'decks', deck.id);
  await setDoc(deckRef, deck, { merge: true });
}

/** Obtiene todos los mazos del usuario desde Firestore */
export async function getCloudDecks(userId: string): Promise<DeckItem[]> {
  const decksCol = collection(db, 'users', userId, 'decks');
  const snap = await getDocs(decksCol);
  const list: DeckItem[] = [];
  snap.forEach((d) => {
    list.push(d.data() as DeckItem);
  });
  return list;
}

/** Suscripción en tiempo real a los mazos del usuario (Sincronización Automática sin botones) */
export function subscribeToCloudDecks(userId: string, onUpdate: (decks: DeckItem[]) => void): () => void {
  const decksCol = collection(db, 'users', userId, 'decks');
  return onSnapshot(decksCol, (snap) => {
    const list: DeckItem[] = [];
    snap.forEach((d) => {
      list.push(d.data() as DeckItem);
    });
    onUpdate(list);
  }, (err) => {
    console.warn('Error en listener de Firestore:', err);
  });
}

/** Elimina un mazo de la nube */
export async function deleteCloudDeck(userId: string, deckId: string): Promise<void> {
  const deckRef = doc(db, 'users', userId, 'decks', deckId);
  await deleteDoc(deckRef);
}

/** Guarda la colección completa de favoritos en la nube */
export async function saveCloudFavorites(userId: string, favorites: Card[]): Promise<void> {
  const favDoc = doc(db, 'users', userId, 'favorites', 'all');
  await setDoc(favDoc, { list: favorites }, { merge: true });
}

/** Obtiene la colección de favoritos desde Firestore */
export async function getCloudFavorites(userId: string): Promise<Card[]> {
  const favDoc = doc(db, 'users', userId, 'favorites', 'all');
  const snap = await getDoc(favDoc);
  if (snap.exists()) {
    const data = snap.data();
    if (data && Array.isArray(data.list)) {
      return data.list as Card[];
    }
  }
  return [];
}
