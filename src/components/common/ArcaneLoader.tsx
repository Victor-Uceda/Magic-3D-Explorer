import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface ArcaneLoaderProps {
  message?: string;
}

export const ArcaneLoader: React.FC<ArcaneLoaderProps> = ({
  message = 'Cargando motor 3D...',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: '60vh',
        width: '100%',
        gap: '1rem',
        color: '#94a3b8',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2
          size={36}
          color="var(--accent-gold)"
          style={{ animation: 'spin 1.2s linear infinite' }}
        />
        <Sparkles
          size={16}
          color="var(--accent-gold)"
          style={{ position: 'absolute', opacity: 0.75 }}
        />
      </div>
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#cbd5e1',
          letterSpacing: '0.04em',
          fontFamily: 'var(--font-heading)',
        }}
      >
        {message}
      </span>
    </div>
  );
};

export default ArcaneLoader;
