import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Dices,
  PackageOpen,
  BookOpen,
  Swords,
  Heart,
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
  onOpenFilters?: () => void;
  activeFilterCount?: number;
  isLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onRouteChange,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onRandomCard,
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
      if (currentRoute !== 'catalog') {
        onRouteChange('catalog');
      }
    }
  };

  const handleSelectSuggestion = (name: string) => {
    onSearchChange(name);
    setShowSuggestions(false);
    onSearchSubmit(name);
    if (currentRoute !== 'catalog') {
      onRouteChange('catalog');
    }
  };

  return (
    <header className="app-navbar-single" role="banner">
      <div className="app-navbar-inner">
        {/* Left: Brand Logo */}
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

        {/* Center: Sleek Centered Capsule Search Bar */}
        <div ref={searchContainerRef} className="app-navbar-search centered-search-pill">
          <form onSubmit={handleSubmit} className="search-form">
            {isLoading ? (
              <Loader2 size={14} className="spin search-icon" color="#94a3b8" />
            ) : (
              <Search size={14} className="search-icon" color="#64748b" />
            )}
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar cartas, comandantes, artefactos..."
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
                  <ExternalLink size={11} color="#64748b" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Clean, Minimal Navigation Actions */}
        <div className="app-navbar-actions">
          <button
            type="button"
            onClick={() => onRouteChange('catalog')}
            className={`nav-action-btn ${currentRoute === 'catalog' ? 'nav-action-btn-active' : ''}`}
            title="Catálogo completo de cartas"
          >
            <BookOpen size={14} />
            <span className="btn-label">Catálogo</span>
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('decks')}
            className={`nav-action-btn ${currentRoute === 'decks' ? 'nav-action-btn-active' : ''}`}
            title="Constructor de Mazos"
          >
            <Swords size={14} />
            <span className="btn-label">Mazos</span>
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('booster')}
            className={`nav-action-btn ${currentRoute === 'booster' ? 'nav-action-btn-active' : ''}`}
            title="Simulador de Sobres 3D"
          >
            <PackageOpen size={14} />
            <span className="btn-label">Sobres 3D</span>
          </button>

          <button
            type="button"
            onClick={() => onRouteChange('collection')}
            className={`nav-action-btn ${currentRoute === 'collection' ? 'nav-action-btn-active' : ''}`}
            title="Mi Colección de Cartas Favoritas"
          >
            <Heart size={14} />
            <span className="btn-label">Colección</span>
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
