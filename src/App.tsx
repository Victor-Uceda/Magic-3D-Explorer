import React from 'react';
import { Sparkles, Layers, Box, Database, ShieldCheck, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header
        className="glass-panel"
        style={{
          margin: '1.25rem 2rem 0 2rem',
          padding: '1rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Box size={22} color="#ffffff" />
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                background: 'linear-gradient(to right, #f8fafc, var(--accent-cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MAGIC 3D EXPLORER
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Interactive 3D MTG Inspector
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: 'var(--accent-emerald)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-emerald)',
                boxShadow: '0 0 8px var(--accent-emerald)',
              }}
            />
            Fase 1: Setup Completado
          </span>
        </div>
      </header>

      {/* Hero Section */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#a5b4fc',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={16} />
          <span>Arquitectura limpia + React Three Fiber + Scryfall</span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '-0.02em',
          }}
        >
          Explora el Multiverso de Magic en{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dimensión 3D
          </span>
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.125rem',
            lineHeight: 1.6,
            maxWidth: '650px',
            marginBottom: '3rem',
          }}
        >
          Visualizador espacial con inspección de precios en tiempo real, formatos legales,
          variantes de impresión y datos de lore orbitando cada carta.
        </p>

        {/* Status Architecture Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            marginBottom: '2rem',
          }}
        >
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-cyan)', marginBottom: '0.75rem' }}>
              <Box size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Three.js & R3F
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Renderizado 3D de alta performance con cámara orbital e iluminación dinámica.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem' }}>
              <Database size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Scryfall Integration
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Cliente HTTP resiliente con control de rate limit, DTO mapper y caché inteligente.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-amber)', marginBottom: '0.75rem' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Firebase & Security
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Autenticación segura de usuarios y gestión de favoritos aislados por usuario.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
            <div style={{ color: 'var(--accent-emerald)', marginBottom: '0.75rem' }}>
              <Layers size={24} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Clean Architecture
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              TypeScript estricto, separación de responsabilidades y modularidad por capas.
            </p>
          </div>
        </div>

        {/* Ready for Phase 2 CTA Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.75rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}
        >
          <Cpu size={18} color="var(--accent-indigo)" />
          <span>
            Siguiente paso: <strong>FASE 2 — 3D Scene (Three.js & Canvas Setup)</strong>
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-glass)',
          padding: '1.25rem 2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
        }}
      >
        Magic 3D Explorer &bull; Built with React, TypeScript & Three.js &bull; Data from Scryfall API
      </footer>
    </div>
  );
};

export default App;
