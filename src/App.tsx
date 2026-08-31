/**
 * Magic 3D Explorer — Orquestador Principal de la Aplicación (App.tsx)
 * 
 * Arquitectura y Patrones Implementados:
 * 1. Enrutamiento SPA Declarativo (React Router v7): Rutas reales para navegación directa y compartible.
 * 2. Composición de Custom Hooks: Desacopla la lógica de negocio y estado en hooks especializados.
 * 3. Patrón ErrorBoundary: Protege la interfaz contra caídas catastróficas de WebGL o peticiones de red.
 * 4. Sincronización de Historial: Soporte nativo para botones Atrás/Adelante y enlaces profundos (Deep Links).
 */

import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

// Componentes de Navegación y UI Global
import { Navbar } from './components/navigation/Navbar';
import { AdvancedFilters } from './components/AdvancedFilters';
import { HotkeyHelpModal } from './components/HotkeyHelpModal';
import { DeckPickerModal } from './components/DeckPickerModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ArcaneLoader } from './components/common/ArcaneLoader';
import { AuthModal } from './components/auth/AuthModal';

// Páginas Principales
import { HomeFeed } from './pages/HomeFeed';
import { CatalogGrid } from './pages/CatalogGrid';
import { DeckBuilderPage } from './pages/DeckBuilderPage';
import { CollectionPage } from './pages/CollectionPage';

// Páginas 3D con Carga Perezosa (Dynamic Code-Splitting para WebGL / Three.js)
const CardDetailPage = React.lazy(() => import('./pages/CardDetailPage'));
const Deck3DPage = React.lazy(() => import('./pages/Deck3DPage'));
const BoosterOpener = React.lazy(() => import('./components/BoosterOpener'));

// Utilidades y Tipos
import { decodeSharedDeck } from './utils/sharing';
import { defaultStorageRepository } from './services/storage/cardStorage';
import {
  saveCloudDeck,
  deleteCloudDeck,
  subscribeToCloudDecks,
  saveCloudFavorites,
  getCloudFavorites,
} from './services/firebase/firestoreService';
import type { Card } from './types/card';
import type { AppRoute } from './types/navigation';

// Custom Hooks Especializados
import { useAuth } from './hooks/useAuth';
import { useCardSearch } from './hooks/useCardSearch';
import { useCardFilters } from './hooks/useCardFilters';
import { useFavorites } from './hooks/useFavorites';
import { useDecks } from './hooks/useDecks';
import { useStudio3D } from './hooks/useStudio3D';
import { useToast } from './hooks/useToast';
import { useDeckPicker } from './hooks/useDeckPicker';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys';

export const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================
  // 1. DERIVACIÓN DE RUTA ACTIVA
  // ==========================================
  // Calcula la pestaña activa a partir de la URL del navegador
  const currentRoute: AppRoute = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '') return 'home';
    if (path.startsWith('/catalog')) return 'catalog';
    if (path.startsWith('/card')) return 'card';
    if (path.startsWith('/deck-3d')) return 'deck-3d';
    if (path.startsWith('/decks')) return 'decks';
    if (path.startsWith('/collection')) return 'collection';
    if (path.startsWith('/booster')) return 'booster';
    return 'home';
  }, [location.pathname]);

  // ==========================================
  // 2. INTEGRACIÓN DE CUSTOM HOOKS
  // ==========================================
  
  // Hook para notificaciones flotantes con temporizador de auto-cierre
  const { toast, showToast } = useToast();

  // Hook para gestión de filtros avanzados y ordenamiento
  const {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    isFilterModalOpen,
    setIsFilterModalOpen,
    activeFilterCount,
    resetFilters,
  } = useCardFilters();

  // Hook para búsqueda en Scryfall, debounce, sugerencias y catálogo
  const {
    searchQuery,
    setSearchQuery,
    currentCard,
    setCurrentCard,
    catalogCards,
    featuredCards,
    searchSummary,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCardsCount,
    errorMessage,
    loadFeatured,
    executeSearch,
    loadMoreCatalog,
    getRandomCard,
    fetchCardById,
  } = useCardSearch(filters);

  // Hook para gestión de cartas favoritas (conectado al Repositorio de Almacenamiento)
  const { favorites, setFavorites, toggleFavorite, isFavorite } = useFavorites();

  // Hook para gestión de mazos (crear, editar, eliminar, importar)
  const { decks, setDecks, deleteDeck, updateDeck, importDeck } = useDecks();

  // Hook para parámetros del visor 3D (acabados de carta, volteo, partículas, cámara)
  const {
    autoRotate,
    toggleAutoRotate,
    resetCameraTrigger,
    triggerResetCamera,
    isFlipped,
    setIsFlipped,
    toggleFlipped,
    cardFinish,
    setCardFinish,
    enableParticles,
    toggleParticles,
  } = useStudio3D();

  // Hook de Autenticación con Firebase
  const { user, logoutCurrentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sincronización y aislamiento estricto por usuario con Cloud Firestore y LocalStorage
  useEffect(() => {
    // 1. Configurar el scope de almacenamiento para el usuario activo
    const activeUid = user && !user.isAnonymous ? user.uid : null;
    defaultStorageRepository.setUserId(activeUid);

    if (!user || user.isAnonymous) {
      // Sesión no autenticada / cerrada: cargar únicamente los datos de invitado (limpio)
      const guestDecks = defaultStorageRepository.getDecks();
      setDecks(guestDecks);
      const guestFavorites = defaultStorageRepository.getFavorites();
      setFavorites(guestFavorites);
      return;
    }

    // 2. Usuario autenticado: Cargar sus propios mazos y favoritos aislados de Firestore
    let isMounted = true;

    const unsubscribeDecks = subscribeToCloudDecks(user.uid, (cloudDecks) => {
      if (!isMounted) return;
      setDecks(cloudDecks);
      defaultStorageRepository.saveDecks(cloudDecks);
    });

    getCloudFavorites(user.uid).then((cloudFavs) => {
      if (!isMounted) return;
      setFavorites(cloudFavs);
      defaultStorageRepository.saveFavorites(cloudFavs);
    }).catch(console.warn);

    return () => {
      isMounted = false;
      unsubscribeDecks();
    };
  }, [user, setDecks, setFavorites]);

  // Hook para orquestar la asignación de cartas a mazos desde cualquier pantalla
  const {
    pendingCards,
    openDeckPicker,
    closeDeckPicker,
    confirmAddToDeck,
    createNewDeckWithPending,
  } = useDeckPicker({
    decks,
    updateDeck: (updated) => {
      updateDeck(updated);
      if (user && !user.isAnonymous) {
        saveCloudDeck(user.uid, updated).catch(console.warn);
      }
    },
    setDecks,
    showToast,
  });

  // Estado local para el modal de ayuda de atajos
  const [isHotkeyModalOpen, setIsHotkeyModalOpen] = React.useState(false);

  // ==========================================
  // 3. ATAJOS DE TECLADO GLOBALES
  // ==========================================
  // Registra atajos: ESPACIO (voltear), F (foil), E (etched), N (normal), R (rotar), ? (ayuda)
  useGlobalHotkeys({
    isCardRoute: currentRoute === 'card',
    toggleFlipped,
    setCardFinish,
    toggleAutoRotate,
    toggleHotkeyModal: () => setIsHotkeyModalOpen((prev) => !prev),
  });

  // ==========================================
  // 4. EFECTOS INICIALES Y DEEP LINKS
  // ==========================================
  
  // Carga inicial de cartas destacadas en Scryfall
  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  // Resolución de enlaces compartidos (?deck=... o legado ?card=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      
      // 1. Enlace de mazo compartido codificado en Base64
      const sharedDeckData = params.get('deck');
      if (sharedDeckData) {
        const decoded = decodeSharedDeck(sharedDeckData);
        if (decoded && decoded.cards.length > 0) {
          importDeck(decoded);
          navigate('/deck-3d');
          showToast(`¡Mazo "${decoded.name}" cargado en 3D!`, `${decoded.cards.length} cartas listas`);
        }
      }

      // 2. Redirección de formato legado (?card=id) a ruta SPA limpia (/card/:id)
      const sharedCardParam = params.get('card');
      if (sharedCardParam) {
        navigate(`/card/${sharedCardParam}`);
      }
    } catch (e) {
      console.warn('Error al procesar parámetros de URL:', e);
    }
  }, [importDeck, navigate, showToast]);

  // ==========================================
  // 5. MANEJADORES DE NAVEGACIÓN Y ACCIONES
  // ==========================================
  
  const handleNavigate = useCallback(
    (route: AppRoute) => {
      if (route === 'home') navigate('/');
      else if (route === 'card') navigate(currentCard ? `/card/${currentCard.id}` : '/card');
      else navigate(`/${route}`);
    },
    [currentCard, navigate]
  );

  const handleInspectIn3D = useCallback(
    (card: Card) => {
      setCurrentCard(card);
      setIsFlipped(false);
      navigate(`/card/${card.id}`);
    },
    [navigate, setCurrentCard, setIsFlipped]
  );

  const handleToggleFavoriteWithFeedback = useCallback(
    (card: Card) => {
      const alreadyFav = isFavorite(card.id);
      toggleFavorite(card);
      if (user && !user.isAnonymous) {
        const next = alreadyFav ? favorites.filter((c) => c.id !== card.id) : [card, ...favorites];
        saveCloudFavorites(user.uid, next).catch(console.warn);
      }
      showToast(
        alreadyFav ? `"${card.name}" eliminada de Favoritos` : `¡"${card.name}" guardada en Favoritos!`
      );
    },
    [isFavorite, showToast, toggleFavorite, user, favorites]
  );

  // ==========================================
  // 6. SUBCOMPONENTES DE RUTA (/card/:id y /deck-3d/:deckId)
  // ==========================================
  
  // Extrae el ID de la URL y descarga la carta si el usuario entra por un enlace directo
  const CardDetailRoute: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    useEffect(() => {
      if (id && currentCard.id !== id) {
        fetchCardById(id);
      }
    }, [id]);

    return (
      <CardDetailPage
        card={currentCard}
        allCards={catalogCards}
        onSelectCard={handleInspectIn3D}
        onBackToCatalog={() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/catalog');
          }
        }}
        autoRotate={autoRotate}
        onToggleAutoRotate={toggleAutoRotate}
        resetCameraTrigger={resetCameraTrigger}
        onResetCamera={triggerResetCamera}
        isFlipped={isFlipped}
        onToggleFlip={toggleFlipped}
        cardFinish={cardFinish}
        onChangeFinish={setCardFinish}
        enableParticles={enableParticles}
        onToggleParticles={toggleParticles}
        searchSummary={searchSummary}
        onAddToDeck={(c) => openDeckPicker([c])}
        onToggleFavorite={handleToggleFavoriteWithFeedback}
        isFavorite={isFavorite(currentCard.id)}
      />
    );
  };

  // Resuelve el mazo específico solicitado en la URL (/deck-3d/:deckId o /deck-3d?deck=...)
  const Deck3DRoute: React.FC = () => {
    const { deckId } = useParams<{ deckId?: string }>();
    const [searchParams] = useSearchParams();
    const sharedDeckQuery = searchParams.get('deck');

    const targetDeck = useMemo(() => {
      // 1. Si viene un payload de mazo compartido en el query parameter (?deck=...)
      if (sharedDeckQuery) {
        const decoded = decodeSharedDeck(sharedDeckQuery);
        if (decoded) return decoded;
      }

      // 2. Si viene un deckId específico (/deck-3d/:deckId)
      if (deckId) {
        return decks.find((d) => d.id === deckId) || null;
      }

      // 3. Fallback al primer mazo guardado
      return decks[0] || null;
    }, [deckId, sharedDeckQuery]);

    if (!targetDeck) {
      return <Navigate to="/decks" replace />;
    }

    const isSharedNotSaved = !decks.some((d) => d.id === targetDeck.id);

    return (
      <Deck3DPage
        deck={targetDeck}
        isSharedDeck={isSharedNotSaved}
        onSaveSharedDeck={(deckToSave) => {
          importDeck(deckToSave);
          if (user && !user.isAnonymous) {
            saveCloudDeck(user.uid, deckToSave).catch(console.warn);
          }
          showToast('Mazo Guardado', `"${deckToSave.name}" se guardó en tu biblioteca`);
        }}
        onBackToDecks={() => handleNavigate('decks')}
        onInspectCard={handleInspectIn3D}
      />
    );
  };

  // ==========================================
  // 7. RENDERIZADO PRINCIPAL
  // ==========================================
  return (
    <div className="app-layout">
      {/* Navbar Superior Persistente (oculta en modo visor 3D inmersivo y simulador de sobre) */}
      {currentRoute !== 'booster' && currentRoute !== 'card' && (
        <Navbar
          currentRoute={currentRoute}
          onRouteChange={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={async (q) => {
            await executeSearch(q, filters);
            navigate('/catalog');
          }}
          onRandomCard={async () => {
            const card = await getRandomCard();
            if (card) {
              setIsFlipped(false);
              navigate(`/card/${card.id}`);
            }
          }}
          user={user}
          deckCount={decks.length}
          favoritesCount={favorites.length}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={async () => {
            await logoutCurrentUser();
            defaultStorageRepository.setUserId(null);
            setDecks([]);
            setFavorites([]);
            showToast('Sesión Cerrada', 'Has cerrado sesión correctamente');
          }}
          isLoading={isLoading}
        />
      )}

      {/* Contenedor Principal Enrutado con Protección de ErrorBoundary */}
      <main
        className={`app-main-content ${
          currentRoute === 'card' || currentRoute === 'booster' ? 'fullscreen-3d-main' : ''
        }`}
      >
        <ErrorBoundary fallbackTitle="Error al cargar la vista 3D o de datos">
          <React.Suspense fallback={<ArcaneLoader />}>
            <Routes>
              <Route
                path="/"
                element={
                  <HomeFeed
                    featuredCards={featuredCards}
                    onSelectCard={handleInspectIn3D}
                    onNavigate={handleNavigate}
                  />
                }
              />
              <Route
                path="/catalog"
                element={
                  <CatalogGrid
                    cards={catalogCards}
                    isLoading={isLoading}
                    isLoadingMore={isLoadingMore}
                    hasMore={hasMore}
                    onLoadMore={loadMoreCatalog}
                    totalCardsCount={totalCardsCount}
                    errorMessage={errorMessage}
                    searchSummary={searchSummary}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    filters={filters}
                    onRemoveFilter={(k, v) => {
                      let updated = { ...filters };
                      if (k === 'colors' && v) updated = { ...filters, colors: filters.colors.filter((c) => c !== v) };
                      else if (k === 'types' && v) updated = { ...filters, types: filters.types.filter((t) => t !== v) };
                      else if (k === 'format') updated = { ...filters, format: null };
                      else if (k === 'rarity') updated = { ...filters, rarity: null };
                      setFilters(updated);
                      executeSearch(undefined, updated);
                    }}
                    onSelectCard={handleInspectIn3D}
                    onOpenFilters={() => setIsFilterModalOpen(true)}
                    onRetry={() => executeSearch(undefined, filters)}
                    activeFilterCount={activeFilterCount}
                  />
                }
              />
              <Route path="/card/:id?" element={<CardDetailRoute />} />
              <Route
                path="/decks"
                element={
                  <DeckBuilderPage
                    decks={decks}
                    onCreateDeck={(name, format) => {
                      const newDeck = {
                        id: `deck-${Date.now()}`,
                        name,
                        format,
                        description: '',
                        cards: [],
                        createdAt: Date.now(),
                      };
                      setDecks((prev) => [newDeck, ...prev]);
                      if (user && !user.isAnonymous) {
                        saveCloudDeck(user.uid, newDeck).catch(console.warn);
                      }
                    }}
                    onDeleteDeck={(deckId) => {
                      deleteDeck(deckId);
                      if (user && !user.isAnonymous) {
                        deleteCloudDeck(user.uid, deckId).catch(console.warn);
                      }
                    }}
                    onUpdateCardQuantity={(deckId, cardId, delta) => {
                      const d = decks.find((x) => x.id === deckId);
                      if (!d) return;
                      const cards = d.cards
                        .map((e) => (e.card.id === cardId ? { ...e, quantity: e.quantity + delta } : e))
                        .filter((e) => e.quantity > 0);
                      const updated = { ...d, cards };
                      updateDeck(updated);
                      if (user && !user.isAnonymous) {
                        saveCloudDeck(user.uid, updated).catch(console.warn);
                      }
                    }}
                    onRemoveCardFromDeck={(deckId, cardId) => {
                      const d = decks.find((x) => x.id === deckId);
                      if (!d) return;
                      const updated = { ...d, cards: d.cards.filter((e) => e.card.id !== cardId) };
                      updateDeck(updated);
                      if (user && !user.isAnonymous) {
                        saveCloudDeck(user.uid, updated).catch(console.warn);
                      }
                    }}
                    onInspectCard={handleInspectIn3D}
                    onInspectDeck3D={(deckId) => navigate(`/deck-3d/${deckId}`)}
                    onNavigate={handleNavigate}
                  />
                }
              />
              <Route path="/deck-3d/:deckId?" element={<Deck3DRoute />} />
              <Route
                path="/collection"
                element={
                  <CollectionPage
                    favoriteCards={favorites}
                    onSelectCard={handleInspectIn3D}
                    onRemoveFavorite={(id) => {
                      const c = favorites.find((x) => x.id === id);
                      if (c) toggleFavorite(c);
                    }}
                    onNavigate={handleNavigate}
                  />
                }
              />
              <Route
                path="/booster"
                element={
                  <BoosterOpener
                    onBackToViewer={() => handleNavigate('catalog')}
                    onInspectCardInViewer={handleInspectIn3D}
                    onAddToDeck={(c) => openDeckPicker([c])}
                    onAddAllToDeck={(cards) => openDeckPicker(cards)}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </React.Suspense>
        </ErrorBoundary>
      </main>

      {/* Notificación Toast Flotante */}
      {toast && (
        <div className="global-toast-notification" role="status" aria-live="polite">
          <CheckCircle2 size={18} color="var(--accent-gold)" />
          <div className="toast-content">
            <span className="toast-title">{toast.title}</span>
            {toast.subtitle && <span className="toast-subtitle">{toast.subtitle}</span>}
          </div>
        </div>
      )}

      {/* Modal de Filtros Avanzados */}
      <AdvancedFilters
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        onApply={() => {
          setIsFilterModalOpen(false);
          executeSearch(undefined, filters);
          navigate('/catalog');
        }}
        onReset={resetFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* Modal de Atajos de Teclado */}
      <HotkeyHelpModal isOpen={isHotkeyModalOpen} onClose={() => setIsHotkeyModalOpen(false)} />

      {/* Modal Global de Asignación a Mazos */}
      {pendingCards.length > 0 && (
        <DeckPickerModal
          pendingCards={pendingCards}
          decks={decks.map((d) => ({
            id: d.id,
            name: d.name,
            format: d.format,
            cardCount: d.cards.reduce((sum, c) => sum + c.quantity, 0),
          }))}
          onSelectDeck={confirmAddToDeck}
          onCreateNewDeck={createNewDeckWithPending}
          onClose={closeDeckPicker}
        />
      )}

      {/* Modal de Autenticación Firebase (Login, Registro, Google, Invitado) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessToast={(title, subtitle) => showToast(title, subtitle)}
      />
    </div>
  );
};

export default App;
