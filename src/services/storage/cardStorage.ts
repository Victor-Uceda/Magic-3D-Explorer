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
  /** Configura el usuario activo para aislar datos */
  setUserId(userId: string | null): void;
  /** Obtiene la lista de cartas favoritas guardadas */
  getFavorites(): Card[];
  /** Guarda la colección completa de favoritos */
  saveFavorites(favorites: Card[]): void;
  /** Obtiene la lista de mazos creados */
  getDecks(): DeckItem[];
  /** Guarda la lista completa de mazos */
  saveDecks(decks: DeckItem[]): void;
}

/**
 * Implementación concreta del repositorio usando el almacenamiento local del navegador (LocalStorage)
 * Aislado estrictamente por Usuario (Multi-user Data Isolation)
 */
export class LocalStorageCardRepository implements ICardStorageRepository {
  private userId: string | null = null;

  constructor(userId?: string | null) {
    this.userId = userId || null;
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  private getDecksKey(): string {
    return this.userId ? `magic3d_decks_user_${this.userId}` : `magic3d_decks_guest`;
  }

  private getFavoritesKey(): string {
    return this.userId ? `magic3d_favorites_user_${this.userId}` : `magic3d_favorites_guest`;
  }

  getFavorites(): Card[] {
    try {
      const saved = localStorage.getItem(this.getFavoritesKey());
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Error al leer favoritos desde localStorage:', e);
      return [];
    }
  }

  saveFavorites(favorites: Card[]): void {
    try {
      localStorage.setItem(this.getFavoritesKey(), JSON.stringify(favorites));
    } catch (e) {
      console.warn('Error al guardar favoritos en localStorage:', e);
    }
  }

  getDecks(): DeckItem[] {
    try {
      const saved = localStorage.getItem(this.getDecksKey());
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
      localStorage.setItem(this.getDecksKey(), JSON.stringify(decks));
    } catch (e) {
      console.warn('Error al guardar mazos en localStorage:', e);
    }
  }
}

/**
 * Instancia global por defecto del repositorio (Inyección por defecto)
 */
export const defaultStorageRepository: LocalStorageCardRepository = new LocalStorageCardRepository();
