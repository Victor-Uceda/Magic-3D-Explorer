import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  Dices,
  PackageOpen,
  Castle,
  BookOpen,
  Swords,
  Crown,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { scryfallClient } from '../../services/scryfall';
import type { AppRoute } from '../../types/navigation';

interface NavbarProps {
  currentRoute: AppRoute;
  onRouteChange: (route: AppRoute) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  onRandomCard: () => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  isLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onRandomCard,
  onOpenFilters,
  activeFilterCount,
  isLoading = false,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autocomplete debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await scryfallClient.autocomplete(searchQuery);
        setSuggestions(results.slice(0, 5));
      } catch {
        setSuggestions([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  const handleSelectSuggestion = (name: string) => {
    onSearchChange(name);
    setShowSuggestions(false);
    onSearchSubmit(name);
  };

  return (
    <header className="app-navbar" role="banner">
      <div className="app-navbar-inner">
        {/* Brand Logo - Medieval Typography (No M3D icon) */}
        <button
          type="button"
          onClick={() => onRouteChange('home')}
          className="app-navbar-logo"
          title="Magic 3D Explorer — Inicio"
        >
          <div className="logo-text">
            <span>MAGIC</span>
            <strong>3D</strong>
          </div>
        </button>

        {/* Primary Navigation Tabs with Distinct Medieval Icons */}
        <nav className="app-navbar-nav" aria-label="Navegación principal">
          <button
            type="button"
            onClick={() => onRouteChange('home')}
            className={`nav-link ${currentRoute === 'home' ? 'nav-link-active' : ''}`}
            title="Inicio"
          >
            <Castle size={16} className="nav-tab-icon" />
            <span>Inicio</span>
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('catalog')}
            className={`nav-link ${currentRoute === 'catalog' ? 'nav-link-active' : ''}`}
            title="Catálogo de Cartas"
          >
            <BookOpen size={16} className="nav-tab-icon" />
            <span>Catálogo</span>
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('decks')}
            className={`nav-link ${currentRoute === 'decks' ? 'nav-link-active' : ''}`}
            title="Mazos de Batalla"
          >
            <Swords size={16} className="nav-tab-icon" />
            <span>Mazos</span>
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('collection')}
            className={`nav-link ${currentRoute === 'collection' ? 'nav-link-active' : ''}`}
            title="Colección y Favoritos"
          >
            <Crown size={16} className="nav-tab-icon" />
            <span>Colección</span>
          </button>
        </nav>

        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="app-navbar-search">
          <form onSubmit={handleSubmit} className="search-form">
            {isLoading ? (
              <Loader2 size={14} className="spin search-icon" color="var(--accent-gold)" />
            ) : (
              <Search size={14} className="search-icon" color="var(--text-muted)" />
            )}
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por nombre (ej. Black Lotus, Lightning Bolt)..."
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              aria-label="Buscar cartas de Magic"
            />
            <span className="kbd-shortcut" title="Presiona '/' para buscar">/</span>
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  onSearchChange('');
                  setSuggestions([]);
                }}
                title="Limpiar búsqueda"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions-dropdown">
              {suggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectSuggestion(name)}
                  className="suggestion-item"
                >
                  <span>{name}</span>
                  <ExternalLink size={11} color="var(--text-muted)" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="app-navbar-actions">
          <button
            type="button"
            onClick={onOpenFilters}
            className={`nav-action-btn ${activeFilterCount > 0 ? 'nav-action-btn-active' : ''}`}
            title="Filtros avanzados de búsqueda"
          >
            <SlidersHorizontal size={14} />
            <span className="btn-label">Filtros</span>
            {activeFilterCount > 0 && <span className="filter-count-badge">{activeFilterCount}</span>}
          </button>

          <button
            type="button"
            onClick={onRandomCard}
            disabled={isLoading}
            className="nav-icon-btn"
            title="Descubrir carta aleatoria en 3D"
          >
            <Dices size={15} />
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('booster')}
            className={`nav-action-btn booster-btn ${currentRoute === 'booster' ? 'booster-btn-active' : ''}`}
            title="Simulador de Sobres de Cartas"
          >
            <PackageOpen size={14} />
            <span className="btn-label">Sobres</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
