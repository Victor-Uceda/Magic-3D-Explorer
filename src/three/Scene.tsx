import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import Lighting from './Lighting';
import CameraController from './CameraController';
import Table from './Table';
import Card3D from './Card3D';
import InfoNode, { NodeType } from './InfoNode';
import Connection from './Connection';
import type { Card } from '../types/card';

export interface SceneProps {
  card?: Card | null;
  selectedNode?: NodeType | null;
  onSelectNode?: (node: NodeType | null) => void;
  autoRotate?: boolean;
  resetCameraTrigger?: number;
}

// Orbital node coordinates and styling
const NODES_CONFIG: Array<{
  type: NodeType;
  position: [number, number, number];
  title: string;
  color: string;
  getSubtitle: (card?: Card | null) => string;
}> = [
  {
    type: 'PRICE',
    position: [-2.5, 1.0, 0.4],
    title: 'PRICE',
    color: '#f59e0b',
    getSubtitle: (c) => (c?.prices?.usd ? `$${c.prices.usd}` : c?.prices?.eur ? `€${c.prices.eur}` : 'Market'),
  },
  {
    type: 'LEGALITY',
    position: [2.5, 1.0, 0.4],
    title: 'LEGALITY',
    color: '#10b981',
    getSubtitle: (c) => {
      if (!c) return 'Formats';
      const legals = Object.values(c.legalities).filter((s) => s === 'legal').length;
      return `${legals} Legal`;
    },
  },
  {
    type: 'PRINTINGS',
    position: [-2.3, -0.9, 0.7],
    title: 'PRINTINGS',
    color: '#8b5cf6',
    getSubtitle: (c) => (c?.setName ? (c.setName.length > 14 ? `${c.setName.slice(0, 12)}...` : c.setName) : 'Editions'),
  },
  {
    type: 'DETAILS',
    position: [2.3, -0.9, 0.7],
    title: 'DETAILS',
    color: '#06b6d4',
    getSubtitle: (c) => (c?.rarity ? c.rarity.toUpperCase() : 'Attributes'),
  },
];

export const Scene: React.FC<SceneProps> = ({
  card,
  selectedNode,
  onSelectNode,
  autoRotate = false,
  resetCameraTrigger = 0,
}) => {
  const frontImageUrl = card?.imageUris?.normal || card?.imageUris?.large || card?.imageUris?.png;
  const cardName = card?.name || 'Black Lotus';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows={false} // Performance boost: soft direct lighting looks great without shadow map recalculation
        dpr={[1, 1.5]} // High performance DPR clamping
        camera={{ position: [0, 0.6, 5.4], fov: 44 }}
        style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at center, #151824 0%, #08090d 100%)' }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
        }}
      >
        <Suspense fallback={null}>
          {/* Subtle cosmic background stars */}
          <Stars
            radius={40}
            depth={25}
            count={450}
            factor={2.5}
            saturation={0.4}
            fade
            speed={0.6}
          />

          {/* Dynamic Scene Lighting */}
          <Lighting accentColor={selectedNode ? '#06b6d4' : '#6366f1'} />

          {/* Pedestal Platform */}
          <Table />

          {/* Main 3D Card Model */}
          <Card3D
            frontImageUrl={frontImageUrl}
            name={cardName}
            isFloating={true}
            onCardClick={() => onSelectNode?.(null)}
          />

          {/* Orbital Information Nodes & Connections */}
          {NODES_CONFIG.map((node) => {
            const isSelected = selectedNode === node.type;
            return (
              <React.Fragment key={node.type}>
                <Connection
                  start={[0, 0.15, 0]}
                  end={node.position}
                  color={node.color}
                  isActive={isSelected}
                />
                <InfoNode
                  type={node.type}
                  position={node.position}
                  title={node.title}
                  subtitle={node.getSubtitle(card)}
                  color={node.color}
                  isSelected={isSelected}
                  onClick={(t) => {
                    onSelectNode?.(selectedNode === t ? null : t);
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Smooth Orbit Controls */}
          <CameraController
            autoRotate={autoRotate}
            resetTrigger={resetCameraTrigger}
            minDistance={3.0}
            maxDistance={9.5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
