/**
 * Menú Desplegable de Perfil de Usuario (ProfileDropdown.tsx)
 * 
 * Interfaz limpia y minimalista anclada a la cuenta:
 * - Avatar, nombre oficial, correo y tipo de cuenta.
 * - Accesos directos e interactivos a 'Mazos' y 'Favoritos'.
 * - Botón sobrio de cierre de sesión.
 */

import React, { useEffect, useRef } from 'react';
import {
  Layers,
  Heart,
  LogOut,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import type { UserProfile } from '../../services/firebase/authService';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  deckCount: number;
  favoritesCount: number;
  onNavigate: (route: 'decks' | 'collection') => void;
  onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  user,
  deckCount,
  favoritesCount,
  onNavigate,
  onLogout,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const accountType = user.isAnonymous
    ? 'Invitado'
    : user.email?.includes('@gmail.com') || user.photoURL
    ? 'Cuenta Google'
    : 'Cuenta Correo';

  return (
    <div className="profile-dropdown-menu" ref={dropdownRef} role="menu">
      {/* Header Info */}
      <div className="profile-dropdown-header">
        <div className="profile-dropdown-avatar">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Avatar'} />
          ) : (
            <span>{(user.displayName || user.email || 'P')[0].toUpperCase()}</span>
          )}
        </div>

        <div className="profile-dropdown-userinfo">
          <div className="profile-dropdown-name">
            {user.displayName || 'Planeswalker'}
          </div>
          <div className="profile-dropdown-email">
            {user.email || 'Modo Invitado'}
          </div>
          <div className="profile-dropdown-badge">
            <ShieldCheck size={10} />
            <span>{accountType}</span>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Cards */}
      <div className="profile-dropdown-stats">
        <button
          type="button"
          onClick={() => onNavigate('decks')}
          className="profile-dropdown-nav-card"
          title="Ver todos mis mazos"
        >
          <div className="profile-dropdown-stat-left">
            <Layers size={15} color="var(--accent-gold)" />
            <div>
              <div className="profile-dropdown-stat-val">{deckCount}</div>
              <div className="profile-dropdown-stat-lbl">Mazos</div>
            </div>
          </div>
          <ChevronRight size={13} color="var(--text-muted)" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('collection')}
          className="profile-dropdown-nav-card"
          title="Ver mi colección de favoritos"
        >
          <div className="profile-dropdown-stat-left">
            <Heart size={15} color="#f87171" />
            <div>
              <div className="profile-dropdown-stat-val">{favoritesCount}</div>
              <div className="profile-dropdown-stat-lbl">Favoritos</div>
            </div>
          </div>
          <ChevronRight size={13} color="var(--text-muted)" />
        </button>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={() => {
          onLogout();
          onClose();
        }}
        className="profile-dropdown-logout-btn"
      >
        <LogOut size={13} />
        <span>Cerrar Sesion</span>
      </button>
    </div>
  );
};
