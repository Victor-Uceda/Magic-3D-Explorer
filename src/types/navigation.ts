/**
 * Navigation and Routing types for Magic 3D Explorer SPA
 */

export type AppRoute = 'home' | 'catalog' | 'card' | 'decks' | 'booster' | 'collection';

export interface NavigationState {
  currentRoute: AppRoute;
  selectedCardId?: string;
  selectedDeckId?: string;
  searchQuery?: string;
}
