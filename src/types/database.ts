/**
 * src/types/database.ts
 * Contratos de datos para la persistencia en 3 niveles de Firestore
 * Arquitectura optimizada para costo $0, Cero N+1 y consistencia ACID.
 */

// ==========================================
// NIVEL 1: COLECCIÓN /decks/{deckId}
// (Lectura instantánea O(1) sin problema N+1)
// ==========================================

export interface DeckSlotLight {
  cardId: string;             // UUID canónico de Scryfall
  name: string;               // Nombre para renderizado rápido
  cmc: number;                // Costo convertido para curva de maná
  imageSmall: string;         // URL optimizada para cuadrícula/pila 3D
  quantity: number;           // Cantidad (ej. 1 a 4, o más en tierras)
  finish: 'normal' | 'foil' | 'etched'; // Acabado visual para el shader R3F
}

export interface DeckStatsPrecomputed {
  totalCards: number;         // Suma de cantidades (ej. 60 o 100)
  avgCmc: number;             // Costo de maná promedio precalculado
  estimatedValueUsd: number;  // Valor monetario aproximado
  colorDistribution: Record<string, number>; // { W: 12, U: 0, B: 4, R: 25, G: 0 }
}

export interface DeckDocument {
  id: string;
  userId: string;             // ID del creador (Firebase Auth UID o Guest)
  name: string;
  format: 'commander' | 'standard' | 'modern' | 'draft';
  description?: string;
  featuredCardId?: string;    // Carta usada como portada/arte del mazo
  stats: DeckStatsPrecomputed;
  slots: DeckSlotLight[];     // Snapshot ligero: Evita 100 lecturas a /cards
  createdAt: string;          // ISO Date
  updatedAt: string;          // ISO Date
}

// ==========================================
// NIVEL 2: COLECCIÓN /cards/{cardId}
// (Catálogo Canónico Centralizado + Series de Tiempo)
// ==========================================

export interface PriceSnapshot {
  date: string;               // 'YYYY-MM-DD'
  usd: number | null;
  eur: number | null;
  pen: number | null;         // Soles calculados
}

export interface CanonicalCardDocument {
  id: string;                 // Scryfall ID directo
  name: string;
  manaCost?: string;
  cmc: number;
  typeLine: string;
  oracleText?: string;
  colors: string[];
  colorIdentity: string[];
  imageNormal: string;
  imageLarge?: string;
  currentPrice: {
    usd: number | null;
    eur: number | null;
    pen: number | null;
  };
  // Serie temporal embebida: Array rotativo de los últimos 30 días
  // Ahorra miles de documentos individuales en Firestore
  priceHistory: PriceSnapshot[];
  lastSyncedAt: string;       // ISO Date del último barrido de precios
}

// ==========================================
// NIVEL 3: INVENTARIO Y SIMULADOR DE SOBRES
// (Consistencia ACID con WriteBatch)
// ==========================================

export interface UserInventoryItem {
  cardId: string;
  quantity: number;           // Incremental con FieldValue.increment()
  firstAcquiredAt: string;
  lastUpdated: string;
  foilQuantity?: number;
}

export interface BoosterOpeningRecord {
  id: string;
  userId: string;
  setCode: string;
  openedAt: string;
  cardsRevealed: {
    cardId: string;
    name: string;
    rarity: string;
    isFoil: boolean;
  }[];
  costPen: number;
}
