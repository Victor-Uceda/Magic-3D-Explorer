import React, { useState } from 'react';
import { X } from 'lucide-react';

interface DeckCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDeck: (name: string, format: string) => void;
}

export const DeckCreateModal: React.FC<DeckCreateModalProps> = ({
  isOpen,
  onClose,
  onCreateDeck,
}) => {
  const [deckName, setDeckName] = useState('');
  const [deckFormat, setDeckFormat] = useState('commander');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName.trim()) return;
    onCreateDeck(deckName.trim(), deckFormat);
    setDeckName('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="deck-form-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0 }}>Crear Nuevo Mazo</h3>
          <button type="button" onClick={onClose} className="deck-delete-btn" title="Cerrar modal">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="deckNameInput">Nombre del Mazo</label>
            <input
              id="deckNameInput"
              type="text"
              placeholder="ej. Dragones de Tarkir, Control Azorius..."
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="deckFormatSelect">Formato</label>
            <select
              id="deckFormatSelect"
              value={deckFormat}
              onChange={(e) => setDeckFormat(e.target.value)}
            >
              <option value="commander">Commander / EDH (100 cartas)</option>
              <option value="modern">Modern (60 cartas)</option>
              <option value="standard">Standard (60 cartas)</option>
              <option value="pioneer">Pioneer (60 cartas)</option>
              <option value="pauper">Pauper (60 cartas)</option>
              <option value="legacy">Legacy (60 cartas)</option>
              <option value="vintage">Vintage (60 cartas)</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Guardar Mazo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
