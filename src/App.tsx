import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/navigation/Navbar';
import { HomeFeed } from './pages/HomeFeed';
import { CatalogGrid, SortOption } from './pages/CatalogGrid';
import { CardDetailPage } from './pages/CardDetailPage';
import { DeckBuilderPage, DeckItem } from './pages/DeckBuilderPage';
import { CollectionPage } from './pages/CollectionPage';
import { BoosterOpener } from './components/BoosterOpener';
import { AdvancedFilters } from './components/AdvancedFilters';
import { HotkeyHelpModal } from './components/HotkeyHelpModal';
import { scryfallClient, mapScryfallCardToDomain, ScryfallError } from './services/scryfall';
import { FilterState, INITIAL_FILTERS } from './types/filters';
import type { Card } from './types/card';
import type { AppRoute } from './types/navigation';
import type { CardFinish } from './three/Card3D';

// High-fidelity fallback card for instant startup
const DEFAULT_CARD: Card = {
  id: 'fallback-black-lotus',
  name: 'Black Lotus',
  manaCost: '{0}',
  cmc: 0,
  typeLine: 'Artifact',
  oracleText: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
  colors: [],
  colorIdentity: [],
  rarity: 'rare',
  setName: 'Limited Edition Alpha',
  setCode: 'lea',
  collectorNumber: '232',
  artist: 'Christopher Rush',
  imageUris: {
    small: 'https://cards.scryfall.io/small/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    normal: 'https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    large: 'https://cards.scryfall.io/large/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    png: 'https://cards.scryfall.io/png/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.png',
    artCrop: 'https://cards.scryfall.io/art_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    borderCrop: 'https://cards.scryfall.io/border_crop/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
  },
  prices: {
    usd: '42000.00',
    usdFoil: null,
    eur: '38500.00',
    eurFoil: null,
  },
  legalities: {
    standard: 'not_legal',
    modern: 'not_legal',
    legacy: 'banned',
    vintage: 'restricted',
    commander: 'banned',
    pioneer: 'not_legal',
    pauper: 'not_legal',
  },
  releasedAt: '1993-08-05',
  flavorText: 'Still prized by collectors, feared by tables, and watched by every rules committee.',
};

const FEATURED_QUERY = '(name:"Black Lotus" or name:"Mox Sapphire" or name:"Dark Confidant" or name:"Snapcaster Mage" or name:"Liliana of the Veil" or name:"Jace, the Mind Sculptor" or name:"Tarmogoyf" or name:"Force of Will" or name:"Counterspell" or name:"Lightning Bolt" or name:"Path to Exile" or name:"Thoughtseize" or name:"Wrenn and Six" or name:"Ragavan, Nimble Pilferer" or name:"Orcish Bowmasters") not:digital game:paper';

export const App: React.FC = () => {
  // Navigation state
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [currentCard, setCurrentCard] = useState<Card>(DEFAULT_CARD);
  const [featuredCards, setFeaturedCards] = useState<Card[]>([DEFAULT_CARD]);
  const [catalogCards, setCatalogCards] = useState<Card[]>([DEFAULT_CARD]);
  const [searchSummary, setSearchSummary] = useState<string>('Cartas destacadas');

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalCardsCount, setTotalCardsCount] = useState<number | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isHotkeyModalOpen, setIsHotkeyModalOpen] = useState<boolean>(false);

  // 3D Studio configuration state
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [resetCameraTrigger, setResetCameraTrigger] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [cardFinish, setCardFinish] = useState<CardFinish>('normal');
  const [enableParticles, setEnableParticles] = useState<boolean>(false);

  // User Decks & Favorites state
  const [favorites, setFavorites] = useState<Card[]>([]);
  const [decks, setDecks] = useState<DeckItem[]>([
    {
      id: 'default-commander-deck',
      name: 'Mazo de Prueba (Commander)',
      format: 'commander',
      description: 'Mazo inicial de exploración',
      cards: [{ card: DEFAULT_CARD, quantity: 1 }],
      createdAt: Date.now(),
    },
  ]);

  // Active filters count
  const activeFilterCount = useMemo(
    () =>
      filters.colors.length +
      filters.types.length +
      (filters.format ? 1 : 0) +
      (filters.rarity ? 1 : 0),
    [filters]
  );

  // Load initial featured cards
  const loadFeatured = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await scryfallClient.searchCards(FEATURED_QUERY);
      if (response.data && response.data.length > 0) {
        const domainCards = response.data.map(mapScryfallCardToDomain);
        setFeaturedCards(domainCards);
        setCatalogCards(domainCards);
        setCurrentCard(domainCards[0]);
        setHasMore(response.has_more || false);
        setNextPageUrl(response.next_page || null);
        setTotalCardsCount(response.total_cards);
      }
    } catch {
      setFeaturedCards([DEFAULT_CARD]);
      setCatalogCards([DEFAULT_CARD]);
      setHasMore(false);
      setNextPageUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  // Execute Scryfall search
  const handleExecuteSearch = async (queryText?: string, customFilters?: FilterState) => {
    const activeFilters = customFilters || filters;
    const textToSearch = queryText !== undefined ? queryText.trim() : searchQuery.trim();
    const queryParts: string[] = [];

    if (textToSearch) {
      queryParts.push(textToSearch);
    }

    if (activeFilters.colors.length > 0) {
      if (activeFilters.colors.includes('C')) {
        queryParts.push('c:c');
      } else {
        queryParts.push(`c>=${activeFilters.colors.join('')}`);
      }
    }

    if (activeFilters.types.length > 0) {
      const typeConditions = activeFilters.types.map((t) => `t:${t}`).join(' or ');
      queryParts.push(`(${typeConditions})`);
    }

    if (activeFilters.format) {
      queryParts.push(`f:${activeFilters.format}`);
    }

    if (activeFilters.rarity) {
      queryParts.push(`r:${activeFilters.rarity}`);
    }

    if (queryParts.length === 0) {
      setCatalogCards(featuredCards);
      setSearchSummary('Cartas destacadas');
      setHasMore(false);
      setNextPageUrl(null);
      setCurrentRoute('catalog');
      return;
    }

    const fullQuery = queryParts.join(' ');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await scryfallClient.searchCards(fullQuery);
      if (response.data && response.data.length > 0) {
        const domainCards = response.data.map(mapScryfallCardToDomain);
        setCatalogCards(domainCards);
        setSearchSummary(fullQuery);
        setHasMore(response.has_more || false);
        setNextPageUrl(response.next_page || null);
        setTotalCardsCount(response.total_cards);
        setCurrentRoute('catalog');
      } else {
        setCatalogCards([]);
        setHasMore(false);
        setNextPageUrl(null);
        setTotalCardsCount(0);
        setErrorMessage('No se encontraron cartas que coincidan con la búsqueda.');
        setCurrentRoute('catalog');
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
      setCurrentRoute('catalog');
    } finally {
      setIsLoading(false);
    }
  };

  // Infinite Scroll: Load More batch via Scryfall cursor next_page
  const handleLoadMore = async () => {
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
  };

  // Remove individual filter chip
  const handleRemoveFilter = (key: keyof FilterState, value?: string) => {
    let updated: FilterState;
    if (key === 'colors' && value) {
      updated = { ...filters, colors: filters.colors.filter((c) => c !== value) };
    } else if (key === 'types' && value) {
      updated = { ...filters, types: filters.types.filter((t) => t !== value) };
    } else if (key === 'format') {
      updated = { ...filters, format: null };
    } else if (key === 'rarity') {
      updated = { ...filters, rarity: null };
    } else {
      updated = filters;
    }

    setFilters(updated);
    handleExecuteSearch(undefined, updated);
  };

  // Random card fetch - opens directly in 3D
  const handleRandomCard = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const rawCard = await scryfallClient.getRandomCard();
      const domainCard = mapScryfallCardToDomain(rawCard);
      setCurrentCard(domainCard);
      setSearchQuery(domainCard.name);
      setIsFlipped(false);
      setCurrentRoute('card');
    } catch {
      setErrorMessage('No se pudo obtener una carta aleatoria.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sorting logic
  const sortedCatalogCards = useMemo(() => {
    const list = [...catalogCards];
    switch (sortBy) {
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-desc':
        return list.sort((a, b) => {
          const pA = a.prices.usd ? parseFloat(a.prices.usd) : -1;
          const pB = b.prices.usd ? parseFloat(b.prices.usd) : -1;
          return pB - pA;
        });
      case 'price-asc':
        return list.sort((a, b) => {
          const pA = a.prices.usd ? parseFloat(a.prices.usd) : 999999;
          const pB = b.prices.usd ? parseFloat(b.prices.usd) : 999999;
          return pA - pB;
        });
      case 'cmc-desc':
        return list.sort((a, b) => b.cmc - a.cmc);
      case 'cmc-asc':
        return list.sort((a, b) => a.cmc - b.cmc);
      case 'rarity': {
        const rarityWeight: Record<string, number> = { mythic: 4, rare: 3, uncommon: 2, common: 1 };
        return list.sort((a, b) => (rarityWeight[b.rarity] || 0) - (rarityWeight[a.rarity] || 0));
      }
      default:
        return list;
    }
  }, [catalogCards, sortBy]);

  // Actions
  const handleInspectIn3D = (card: Card) => {
    setCurrentCard(card);
    setIsFlipped(false);
    setCurrentRoute('card');
  };

  const handleToggleFavorite = (card: Card) => {
    setFavorites((prev) => {
      const exists = prev.some((c) => c.id === card.id);
      if (exists) {
        return prev.filter((c) => c.id !== card.id);
      }
      return [card, ...prev];
    });
  };

  const handleAddToDeck = (card: Card) => {
    if (decks.length === 0) {
      const newDeck: DeckItem = {
        id: `deck-${Date.now()}`,
        name: 'Nuevo Mazo',
        format: 'commander',
        description: 'Mazo creado automáticamente',
        cards: [{ card, quantity: 1 }],
        createdAt: Date.now(),
      };
      setDecks([newDeck]);
      return;
    }

    setDecks((prev) => {
      const updated = [...prev];
      const targetDeck = { ...updated[0] };
      const cardIndex = targetDeck.cards.findIndex((c) => c.card.id === card.id);
      if (cardIndex >= 0) {
        targetDeck.cards[cardIndex].quantity += 1;
      } else {
        targetDeck.cards = [{ card, quantity: 1 }, ...targetDeck.cards];
      }
      updated[0] = targetDeck;
      return updated;
    });
  };

  const handleCreateDeck = (name: string, format: string) => {
    const newDeck: DeckItem = {
      id: `deck-${Date.now()}`,
      name,
      format,
      description: '',
      cards: [],
      createdAt: Date.now(),
    };
    setDecks((prev) => [newDeck, ...prev]);
  };

  const handleDeleteDeck = (id: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== id));
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (isInputActive) return;

      if (e.code === 'Space' && currentRoute === 'card') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if ((e.key === 'f' || e.key === 'F') && currentRoute === 'card') {
        setCardFinish((prev) => (prev === 'foil' ? 'normal' : 'foil'));
      } else if ((e.key === 'e' || e.key === 'E') && currentRoute === 'card') {
        setCardFinish((prev) => (prev === 'etched' ? 'normal' : 'etched'));
      } else if ((e.key === 'n' || e.key === 'N') && currentRoute === 'card') {
        setCardFinish('normal');
      } else if ((e.key === 'r' || e.key === 'R') && currentRoute === 'card') {
        setAutoRotate((prev) => !prev);
      } else if (e.key === '?') {
        setIsHotkeyModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRoute]);

  return (
    <div className="app-layout">
      {/* Persistent App Navbar (hidden in full 3D studio and booster mode to avoid overlapping bars) */}
      {currentRoute !== 'booster' && currentRoute !== 'card' && (
        <Navbar
          currentRoute={currentRoute}
          onRouteChange={setCurrentRoute}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={(q) => handleExecuteSearch(q)}
          onRandomCard={handleRandomCard}
          onOpenFilters={() => setIsFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
          isLoading={isLoading}
        />
      )}

      {/* Main Viewport Content Managed by SPA Routing */}
      <main className={`app-main-content ${(currentRoute === 'card' || currentRoute === 'booster') ? 'fullscreen-3d-main' : ''}`}>
        {currentRoute === 'home' && (
          <HomeFeed
            featuredCards={featuredCards}
            onSelectCard={handleInspectIn3D}
            onNavigate={setCurrentRoute}
          />
        )}

        {currentRoute === 'catalog' && (
          <CatalogGrid
            cards={sortedCatalogCards}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            totalCardsCount={totalCardsCount}
            errorMessage={errorMessage}
            searchSummary={searchSummary}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onSelectCard={handleInspectIn3D}
            onOpenFilters={() => setIsFilterModalOpen(true)}
            onRetry={() => handleExecuteSearch()}
            activeFilterCount={activeFilterCount}
          />
        )}

        {currentRoute === 'card' && (
          <CardDetailPage
            card={currentCard}
            allCards={catalogCards}
            onSelectCard={(c) => {
              setCurrentCard(c);
              setIsFlipped(false);
            }}
            onBackToCatalog={() => setCurrentRoute('catalog')}
            autoRotate={autoRotate}
            onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
            resetCameraTrigger={resetCameraTrigger}
            onResetCamera={() => setResetCameraTrigger((p) => p + 1)}
            isFlipped={isFlipped}
            onToggleFlip={() => setIsFlipped((prev) => !prev)}
            cardFinish={cardFinish}
            onChangeFinish={setCardFinish}
            enableParticles={enableParticles}
            onToggleParticles={() => setEnableParticles((prev) => !prev)}
            searchSummary={searchSummary}
            onAddToDeck={handleAddToDeck}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favorites.some((f) => f.id === currentCard.id)}
          />
        )}

        {currentRoute === 'decks' && (
          <DeckBuilderPage
            decks={decks}
            onCreateDeck={handleCreateDeck}
            onDeleteDeck={handleDeleteDeck}
            onInspectCard={handleInspectIn3D}
            onNavigate={setCurrentRoute}
          />
        )}

        {currentRoute === 'collection' && (
          <CollectionPage
            favoriteCards={favorites}
            onSelectCard={handleInspectIn3D}
            onRemoveFavorite={(id) => setFavorites((prev) => prev.filter((c) => c.id !== id))}
            onNavigate={setCurrentRoute}
          />
        )}

        {currentRoute === 'booster' && (
          <BoosterOpener
            onBackToViewer={() => setCurrentRoute('catalog')}
            onInspectCardInViewer={(card) => {
              setCurrentCard(card);
              setCurrentRoute('card');
            }}
          />
        )}
      </main>

      {/* Advanced Filters Modal */}
      <AdvancedFilters
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onApply={() => {
          setIsFilterModalOpen(false);
          handleExecuteSearch();
        }}
        onReset={() => setFilters(INITIAL_FILTERS)}
        activeFilterCount={activeFilterCount}
      />

      {/* Keyboard Shortcuts Help Modal */}
      <HotkeyHelpModal
        isOpen={isHotkeyModalOpen}
        onClose={() => setIsHotkeyModalOpen(false)}
      />
    </div>
  );
};

export default App;
