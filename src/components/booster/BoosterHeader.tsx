import React from 'react';
import { ChevronLeft, PackageOpen } from 'lucide-react';

interface BoosterHeaderProps {
  onBackToViewer: () => void;
  selectedSetCode: string;
  onSelectSet: (code: string) => void;
  availableSets: { code: string; name: string }[];
  isOpening: boolean;
}

export const BoosterHeader: React.FC<BoosterHeaderProps> = ({
  onBackToViewer,
  selectedSetCode,
  onSelectSet,
  availableSets,
  isOpening,
}) => {
  return (
    <header className="viewer-top-bar" role="banner">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBackToViewer}
        className="viewer-back-btn"
        title="Volver al Catálogo"
      >
        <ChevronLeft size={16} />
        <span>Volver</span>
      </button>

      {/* Set Selector Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '420px', margin: '0 1rem', pointerEvents: 'auto' }}>
        <PackageOpen size={16} color="var(--accent-gold)" />
        <select
          value={selectedSetCode}
          onChange={(e) => onSelectSet(e.target.value)}
          disabled={isOpening}
          style={{
            width: '100%',
            background: 'rgba(10, 13, 19, 0.65)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#f8fafc',
            borderRadius: '9999px',
            padding: '0.45rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 700,
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          }}
        >
          {availableSets.map((s) => (
            <option key={s.code} value={s.code} style={{ background: '#141722', color: '#f8fafc' }}>
              {s.name} [{s.code.toUpperCase()}]
            </option>
          ))}
        </select>
      </div>

      {/* Logo Title */}
      <div className="viewer-card-title-badge">
        <span className="badge-card-name">MAGIC 3D</span>
        <span className="badge-separator">•</span>
        <span className="badge-set">SOBRES</span>
      </div>
    </header>
  );
};

export default BoosterHeader;
