/**
 * Capa de Persistencia: Patrón Repository (cardStorage.ts)
 * 
 * ¿Por qué se utiliza el Patrón Repository?
 * 1. Desacoplamiento: Aísla la interfaz de usuario (UI) de los detalles de bajo nivel del almacenamiento.
 * 2. Extensibilidad: Permite sustituir la implementación actual (LocalStorage) por una base de datos
 *    en la nube como Firebase Firestore o Supabase simplemente creando una nueva clase que implemente ICardStorageRepository.
 * 3. Robustez: Captura de forma segura excepciones por cuota de almacenamiento excedida o navegación privada.
 */

import type { Card } from '../../types/card';
import type { DeckItem } from '../../pages/DeckBuilderPage';

/**
 * Contrato formal de persistencia para favoritos y mazos
 */
export interface ICardStorageRepository {
  /** Obtiene la lista de cartas favoritas guardadas */
  getFavorites(): Card[];
  /** Guarda la colección completa de favoritos */
  saveFavorites(favorites: Card[]): void;
  /** Obtiene la lista de mazos creados */
  getDecks(): DeckItem[];
  /** Guarda la lista completa de mazos */
  saveDecks(decks: DeckItem[]): void;
}

const FAVORITES_STORAGE_KEY = 'magic3d_favorites_v2';
const DECKS_STORAGE_KEY = 'magic3d_decks_v2';

/**
 * Implementación concreta del repositorio usando el almacenamiento local del navegador (LocalStorage)
 */
export class LocalStorageCardRepository implements ICardStorageRepository {
  getFavorites(): Card[] {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Error al leer favoritos desde localStorage:', e);
      return [];
    }
  }

  saveFavorites(favorites: Card[]): void {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Error al guardar favoritos en localStorage:', e);
    }
  }

  getDecks(): DeckItem[] {
    try {
      const saved = localStorage.getItem(DECKS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error al leer mazos desde localStorage:', e);
    }
    return [];
  }

  saveDecks(decks: DeckItem[]): void {
    try {
      localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
    } catch (e) {
      console.warn('Error al guardar mazos en localStorage:', e);
    }
  }
}

/**
 * Instancia global por defecto del repositorio (Inyección por defecto)
 */
export const defaultStorageRepository: ICardStorageRepository = new LocalStorageCardRepository();
