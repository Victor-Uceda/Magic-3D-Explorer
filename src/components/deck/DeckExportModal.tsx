import React, { useState, useMemo } from 'react';
import { Share2, X, Link2, Check, Download, Copy } from 'lucide-react';
import { getDeckShareUrl } from '../../utils/sharing';
import type { DeckItem } from '../../pages/DeckBuilderPage';

interface DeckExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  deck: DeckItem;
}

export const DeckExportModal: React.FC<DeckExportModalProps> = ({
  isOpen,
  onClose,
  deck,
}) => {
  const [copiedLinkSuccess, setCopiedLinkSuccess] = useState(false);
  const [copiedArenaSuccess, setCopiedArenaSuccess] = useState(false);

  // Formato MTG Arena / Moxfield
  const formattedDeckText = useMemo(() => {
    const lines = [`// ${deck.name} (${deck.format.toUpperCase()})`, 'Deck'];
    for (const item of deck.cards) {
      const setCode = item.card.setCode ? item.card.setCode.toUpperCase() : 'MTG';
      const colNum = item.card.collectorNumber || '1';
      lines.push(`${item.quantity} ${item.card.name} (${setCode}) ${colNum}`);
    }
    return lines.join('\n');
  }, [deck]);

  if (!isOpen) return null;

  const handleCopyShareLink = async () => {
    try {
      const shareUrl = getDeckShareUrl(deck);
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLinkSuccess(true);
      setTimeout(() => setCopiedLinkSuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([formattedDeckText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name.replace(/\s+/g, '_')}_Deck.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyArenaText = async () => {
    try {
      await navigator.clipboard.writeText(formattedDeckText);
      setCopiedArenaSuccess(true);
      setTimeout(() => setCopiedArenaSuccess(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="deck-form-modal"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Share2 size={16} color="var(--accent-gold)" />
            <h3 style={{ margin: 0 }}>Exportar Lista — {deck.name}</h3>
          </div>
          <button type="button" onClick={onClose} className="deck-delete-btn" title="Cerrar modal">
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
          Formato estándar compatible con MTG Arena, Moxfield y Cockatrice:
        </p>

        <textarea
          readOnly
          value={formattedDeckText}
          rows={10}
          style={{
            width: '100%',
            background: '#0a0c10',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: '#cbd5e1',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            padding: '0.75rem',
            outline: 'none',
            resize: 'none',
          }}
        />

        <div
          className="form-actions"
          style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}
        >
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="deck-btn-secondary"
            style={{ color: 'var(--accent-gold)' }}
            title="Generar y copiar un enlace para que cualquier persona vea este mazo en 3D"
          >
            {copiedLinkSuccess ? <Check size={14} /> : <Link2 size={14} />}
            <span>{copiedLinkSuccess ? '¡Enlace 3D Copiado!' : 'Copiar Enlace 3D'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            <button
              type="button"
              onClick={handleDownloadTxt}
              className="btn-cancel"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Descargar archivo de texto .txt"
            >
              <Download size={13} />
              <span>Descargar .TXT</span>
            </button>

            <button
              type="button"
              onClick={handleCopyArenaText}
              className="btn-submit"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {copiedArenaSuccess ? <Check size={14} /> : <Copy size={14} />}
              <span>
                {copiedArenaSuccess ? '¡Copiado Formato Arena!' : 'Copiar Formato MTG Arena'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
