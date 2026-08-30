export * from './card';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface FavoriteItem {
  id: string;
  cardId: string;
  cardName: string;
  imageUrl: string;
  setName: string;
  createdAt: number;
}
