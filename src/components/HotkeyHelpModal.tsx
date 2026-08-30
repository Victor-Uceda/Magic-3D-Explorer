import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface HotkeyHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Espacio', desc: 'Voltear carta (Anverso / Reverso)' },
  { key: '/', desc: 'Enfocar buscador' },
  { key: 'F', desc: 'Activar acabado Foil Tradicional' },
  { key: 'E', desc: 'Activar acabado Foil Grabado (Etched)' },
  { key: 'N', desc: 'Activar acabado Normal (Cartulina estándar)' },
  { key: 'R', desc: 'Alternar rotación automática 3D' },
  { key: '← / →', desc: 'Navegar por las cartas de la lista' },
  { key: 'Esc', desc: 'Cerrar ventanas / Limpiar foco' },
];

export const HotkeyHelpModal: React.FC<HotkeyHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.15rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Keyboard size={18} color="var(--text-secondary)" />
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Atajos de Teclado del Estudio
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* List of shortcuts */}
        <div style={{ padding: '0.85rem 1.15rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>{s.desc}</span>
              <span className="kbd-badge">{s.key}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.65rem 1.15rem',
            background: 'var(--bg-app)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Command size={13} />
          <span>Atajos activos en cualquier momento de la sesión</span>
        </div>
      </div>
    </div>
  );
};

export default HotkeyHelpModal;
