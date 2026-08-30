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

// Fixed orbital node configurations
const NODES_CONFIG: Array<{
  type: NodeType;
  position: [number, number, number];
  title: string;
  color: string;
  getSubtitle: (card?: Card | null) => string;
}> = [
  {
    type: 'PRICE',
    position: [-2.6, 1.1, 0.5],
    title: 'PRICE',
    color: '#f59e0b',
    getSubtitle: (c) => (c?.prices?.usd ? `$${c.prices.usd}` : '$3.21 USD'),
  },
  {
    type: 'LEGALITY',
    position: [2.6, 1.1, 0.5],
    title: 'LEGALITY',
    color: '#10b981',
    getSubtitle: (c) => (c ? `${Object.values(c.legalities).filter((s) => s === 'legal').length} Formatos` : 'Legal (Modern)'),
  },
  {
    type: 'PRINTINGS',
    position: [-2.4, -0.9, 0.8],
    title: 'PRINTINGS',
    color: '#8b5cf6',
    getSubtitle: (c) => (c?.setName ? c.setName : 'Alpha / Beta / Unlimited'),
  },
  {
    type: 'DETAILS',
    position: [2.4, -0.9, 0.8],
    title: 'DETAILS',
    color: '#06b6d4',
    getSubtitle: (c) => (c?.rarity ? `${c.rarity.toUpperCase()}` : 'Rare Artifact'),
  },
];

export const Scene: React.FC<SceneProps> = ({
  card,
  selectedNode,
  onSelectNode,
  autoRotate = false,
  resetCameraTrigger = 0,
}) => {
  const frontImageUrl = card?.imageUris?.normal || card?.imageUris?.large;
  const cardName = card?.name || 'Black Lotus';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0.8, 5.8], fov: 45 }}
        style={{ width: '100%', height: '100%', background: 'radial-gradient(circle at center, #171b29 0%, #0a0b10 100%)' }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          {/* Subtle cosmic background stars */}
          <Stars
            radius={50}
            depth={30}
            count={1200}
            factor={3}
            saturation={0.5}
            fade
            speed={0.8}
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

          {/* Orbital Information Nodes & Energy Connections */}
          {NODES_CONFIG.map((node) => {
            const isSelected = selectedNode === node.type;
            return (
              <React.Fragment key={node.type}>
                <Connection
                  start={[0, 0.2, 0]}
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

          {/* Orbit Controls */}
          <CameraController
            autoRotate={autoRotate}
            resetTrigger={resetCameraTrigger}
            minDistance={3.2}
            maxDistance={11}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
