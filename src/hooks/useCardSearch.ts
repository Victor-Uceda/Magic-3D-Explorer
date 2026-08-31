/**
 * Custom Hook: useCardSearch
 * 
 * Responsabilidad:
 * Gestiona el ciclo completo de búsqueda de cartas, autocompletado en vivo,
 * paginación infinita mediante cursores y obtención de cartas destacadas/aleatorias en Scryfall.
 * 
 * Patrones & Optimizaciones:
 * 1. Debounce Seguro: Retarda 200ms las peticiones de autocompletado para no saturar el rate limit.
 * 2. Construcción Declarativa de Consultas: Transforma filtros (colores, tipos, formato) a sintaxis Scryfall.
 * 3. Limpieza de Efectos: Previene fugas de memoria con clearTimeout al desmontar o teclear.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { scryfallClient, mapScryfallCardToDomain, ScryfallError } from '../services/scryfall';
import { FilterState } from '../types/filters';
import {
  DEFAULT_CATALOG_QUERY,
  FEATURED_QUERY,
  DEFAULT_FALLBACK_CARD,
  SCRYFALL_CONFIG,
} from '../constants/scryfall';
import type { Card } from '../types/card';

export interface UseCardSearchReturn {
  /** Término de búsqueda escrito por el usuario en la Navbar */
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  /** Lista de nombres sugeridos en el desplegable de autocompletado */
  suggestions: string[];
  setSuggestions: React.Dispatch<React.SetStateAction<string[]>>;
  /** Carta actualmente seleccionada para inspección 3D */
  currentCard: Card;
  setCurrentCard: React.Dispatch<React.SetStateAction<Card>>;
  /** Lista de cartas renderizadas en la cuadrícula del catálogo */
  catalogCards: Card[];
  setCatalogCards: React.Dispatch<React.SetStateAction<Card[]>>;
  /** Cartas destacadas de alta fidelidad mostradas en la pantalla de inicio */
  featuredCards: Card[];
  /** Resumen textual de la consulta activa (ej. 'c>=WURG t:creature') */
  searchSummary: string;
  setSearchSummary: React.Dispatch<React.SetStateAction<string>>;
  /** Estado de carga de búsqueda principal */
  isLoading: boolean;
  /** Estado de carga del scroll infinito */
  isLoadingMore: boolean;
  /** Indica si Scryfall tiene páginas subsiguientes disponibles */
  hasMore: boolean;
  /** Total de cartas encontradas según el conteo de Scryfall */
  totalCardsCount: number | undefined;
  /** Mensaje de error para mostrar al usuario en caso de fallo de red */
  errorMessage: string | null;
  setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
  /** Descarga las cartas destacadas iniciales */
  loadFeatured: () => Promise<void>;
  /** Ejecuta una búsqueda compuesta por texto y filtros */
  executeSearch: (queryText?: string, customFilters?: FilterState) => Promise<void>;
  /** Paginación: Carga el siguiente lote de cartas mediante el cursor de Scryfall */
  loadMoreCatalog: () => Promise<void>;
  /** Obtiene una carta aleatoria para descubrir en 3D */
  getRandomCard: () => Promise<Card | null>;
  /** Descarga una carta específica a partir de su ID único */
  fetchCardById: (id: string) => Promise<Card | null>;
}

export function useCardSearch(initialFilters: FilterState): UseCardSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState<Card>(DEFAULT_FALLBACK_CARD);
  const [featuredCards, setFeaturedCards] = useState<Card[]>([DEFAULT_FALLBACK_CARD]);
  const [catalogCards, setCatalogCards] = useState<Card[]>([DEFAULT_FALLBACK_CARD]);
  const [searchSummary, setSearchSummary] = useState<string>('Catálogo');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalCardsCount, setTotalCardsCount] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mantiene una referencia síncrona a los filtros actuales para evitar recrear executeSearch
  const currentFiltersRef = useRef<FilterState>(initialFilters);
  useEffect(() => {
    currentFiltersRef.current = initialFilters;
  }, [initialFilters]);

  // =========================================================================
  // 1. AUTOCOMPLETADO CON DEBOUNCE
  // =========================================================================
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    // Espera 200ms tras la última tecla pulsada antes de consultar la API
    const timer = setTimeout(async () => {
      try {
        const results = await scryfallClient.autocomplete(trimmed);
        setSuggestions(results.slice(0, SCRYFALL_CONFIG.MAX_SUGGESTIONS));
      } catch {
        setSuggestions([]);
      }
    }, SCRYFALL_CONFIG.AUTOCOMPLETE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // =========================================================================
  // 2. CARGA INICIAL (DESTACADAS Y CATÁLOGO POR DEFECTO)
  // =========================================================================
  const loadFeatured = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [featuredRes, catalogRes] = await Promise.all([
        scryfallClient.searchCards(FEATURED_QUERY),
        scryfallClient.searchCards(DEFAULT_CATALOG_QUERY),
      ]);

      if (featuredRes.data && featuredRes.data.length > 0) {
        const domainFeatured = featuredRes.data.map(mapScryfallCardToDomain);
        setFeaturedCards(domainFeatured);
        setCurrentCard(domainFeatured[0]);
      }

      if (catalogRes.data && catalogRes.data.length > 0) {
        const domainCatalog = catalogRes.data.map(mapScryfallCardToDomain);
        setCatalogCards(domainCatalog);
        setHasMore(catalogRes.has_more || false);
        setNextPageUrl(catalogRes.next_page || null);
        setTotalCardsCount(catalogRes.total_cards);
      }
    } catch {
      // Respaldo de contingencia ante caída de red
      setFeaturedCards([DEFAULT_FALLBACK_CARD]);
      setCatalogCards([DEFAULT_FALLBACK_CARD]);
      setHasMore(false);
      setNextPageUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================================
  // 3. EJECUCIÓN DE BÚSQUEDA COMPUESTA
  // =========================================================================
  const executeSearch = useCallback(
    async (queryText?: string, customFilters?: FilterState) => {
      const activeFilters = customFilters || currentFiltersRef.current;
      const textToSearch = queryText !== undefined ? queryText.trim() : searchQuery.trim();
      const queryParts: string[] = [];

      if (textToSearch) {
        queryParts.push(textToSearch);
      }

      // Filtro de color de maná
      if (activeFilters.colors.length > 0) {
        if (activeFilters.colors.includes('C')) {
          queryParts.push('c:c');
        } else {
          queryParts.push(`c>=${activeFilters.colors.join('')}`);
        }
      }

      // Filtro de tipo de carta (Criatura, Instantáneo, etc.)
      if (activeFilters.types.length > 0) {
        const typeConditions = activeFilters.types.map((t) => `t:${t}`).join(' or ');
        queryParts.push(`(${typeConditions})`);
      }

      // Filtro de formato de juego (Commander, Modern, etc.)
      if (activeFilters.format) {
        queryParts.push(`f:${activeFilters.format}`);
      }

      // Filtro de rareza (Mítica, Rara, etc.)
      if (activeFilters.rarity) {
        queryParts.push(`r:${activeFilters.rarity}`);
      }

      const fullQuery = queryParts.length > 0 ? queryParts.join(' ') : DEFAULT_CATALOG_QUERY;
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await scryfallClient.searchCards(fullQuery);
        if (response.data && response.data.length > 0) {
          const domainCards = response.data.map(mapScryfallCardToDomain);
          setCatalogCards(domainCards);
          setSearchSummary(queryParts.length > 0 ? fullQuery : 'Catálogo');
          setHasMore(response.has_more || false);
          setNextPageUrl(response.next_page || null);
          setTotalCardsCount(response.total_cards);
        } else {
          setCatalogCards([]);
          setHasMore(false);
          setNextPageUrl(null);
          setTotalCardsCount(0);
          setErrorMessage('No se encontraron cartas que coincidan con la búsqueda.');
        }
      } catch (err: unknown) {
        if (err instanceof ScryfallError) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Error al realizar la búsqueda en Scryfall.');
        }
        setCatalogCards([]);
        setHasMore(false);
        setNextPageUrl(null);
        setTotalCardsCount(0);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery]
  );

  // =========================================================================
  // 4. INFINITE SCROLL (CARGA DE PÁGINA SIGUIENTE)
  // =========================================================================
  const loadMoreCatalog = useCallback(async () => {
    if (!hasMore || !nextPageUrl || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const response = await scryfallClient.fetchNextPage(nextPageUrl);
      if (response.data && response.data.length > 0) {
        const domainCards = response.data.map(mapScryfallCardToDomain);
        setCatalogCards((prev) => [...prev, ...domainCards]);
        setHasMore(response.has_more || false);
        setNextPageUrl(response.next_page || null);
      } else {
        setHasMore(false);
        setNextPageUrl(null);
      }
    } catch {
      setHasMore(false);
      setNextPageUrl(null);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, nextPageUrl, isLoadingMore]);

  // =========================================================================
  // 5. CARTA ALEATORIA
  // =========================================================================
  const getRandomCard = useCallback(async (): Promise<Card | null> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const rawCard = await scryfallClient.getRandomCard();
      const domainCard = mapScryfallCardToDomain(rawCard);
      setCurrentCard(domainCard);
      setSearchQuery(domainCard.name);
      return domainCard;
    } catch (err: unknown) {
      if (err instanceof ScryfallError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Error al obtener una carta aleatoria.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =========================================================================
  // 6. OBTENER CARTA POR ID (DEEP LINK / URL DIRECTA)
  // =========================================================================
  const fetchCardById = useCallback(async (id: string): Promise<Card | null> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const raw = await scryfallClient.getCardById(id);
      const domain = mapScryfallCardToDomain(raw);
      setCurrentCard(domain);
      return domain;
    } catch (err: unknown) {
      if (err instanceof ScryfallError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Error al cargar la carta seleccionada.');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    suggestions,
    setSuggestions,
    currentCard,
    setCurrentCard,
    catalogCards,
    setCatalogCards,
    featuredCards,
    searchSummary,
    setSearchSummary,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCardsCount,
    errorMessage,
    setErrorMessage,
    loadFeatured,
    executeSearch,
    loadMoreCatalog,
    getRandomCard,
    fetchCardById,
  };
}
