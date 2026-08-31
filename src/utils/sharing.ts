import type { Card } from '../types/card';
import type { DeckItem } from '../pages/DeckBuilderPage';

interface CompactSharedDeck {
  n: string; // name
  f: string; // format
  c: Array<{
    id?: string;
    n: string; // card name
    m?: string; // mana cost
    t?: string; // type line
    s?: string; // set code
    cn?: string; // collector number
    img: string; // image normal uri
    q: number; // quantity
    p?: string | null; // price USD
    r?: string; // rarity
  }>;
}

/**
 * Generates a shareable URL to inspect any card in 3D
 */
export function getCardShareUrl(card: Card): string {
  const origin = window.location.origin;
  return `${origin}/card/${encodeURIComponent(card.id)}`;
}

/**
 * Generates a self-contained shareable URL for an entire deck in 3D
 */
export function getDeckShareUrl(deck: DeckItem): string {
  const origin = window.location.origin;

  const compact: CompactSharedDeck = {
    n: deck.name,
    f: deck.format,
    c: deck.cards.map((entry) => ({
      id: entry.card.id,
      n: entry.card.name,
      m: entry.card.manaCost,
      t: entry.card.typeLine,
      s: entry.card.setCode,
      cn: entry.card.collectorNumber,
      img: entry.card.imageUris.normal || entry.card.imageUris.small,
      q: entry.quantity,
      p: entry.card.prices.usd,
      r: entry.card.rarity,
    })),
  };

  const json = JSON.stringify(compact);
  // Base64 encode string safely for Unicode
  const base64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));

  return `${origin}/deck-3d?deck=${encodeURIComponent(base64)}`;
}

/**
 * Decodes a shareable deck URL payload back into a full DeckItem
 */
export function decodeSharedDeck(encoded: string): DeckItem | null {
  try {
    const decodedBase64 = decodeURIComponent(
      Array.prototype.map
        .call(atob(encoded), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const data: CompactSharedDeck = JSON.parse(decodedBase64);
    if (!data || !data.n || !Array.isArray(data.c)) return null;

    const cards = data.c.map((item) => {
      const imgUrl = item.img || 'https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg';
      const card: Card = {
        id: item.id || `shared-card-${Date.now()}-${Math.random()}`,
        name: item.n,
        manaCost: item.m || '',
        cmc: 0,
        typeLine: item.t || 'Card',
        oracleText: '',
        colors: [],
        colorIdentity: [],
        rarity: item.r || 'rare',
        setName: 'Shared Deck Set',
        setCode: item.s || 'mtg',
        collectorNumber: item.cn || '1',
        artist: 'Magic Artist',
        imageUris: {
          small: imgUrl,
          normal: imgUrl,
          large: imgUrl,
          png: imgUrl,
          artCrop: imgUrl,
          borderCrop: imgUrl,
        },
        prices: {
          usd: item.p || '1.00',
          usdFoil: null,
          eur: null,
          eurFoil: null,
        },
        legalities: {
          standard: 'legal',
          modern: 'legal',
          legacy: 'legal',
          vintage: 'legal',
          commander: 'legal',
          pioneer: 'legal',
          pauper: 'legal',
        },
        releasedAt: '2024-01-01',
      };
      return { card, quantity: item.q || 1 };
    });

    return {
      id: `shared-deck-${Date.now()}`,
      name: data.n,
      format: data.f || 'commander',
      description: 'Mazo cargado desde enlace compartido',
      cards,
      createdAt: Date.now(),
    };
  } catch (err) {
    console.error('Error al decodificar el mazo compartido:', err);
    return null;
  }
}
