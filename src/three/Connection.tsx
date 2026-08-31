import React from 'react';
import { QuadraticBezierLine } from '@react-three/drei';

interface ConnectionProps {
  start?: [number, number, number];
  end: [number, number, number];
  color?: string;
  lineWidth?: number;
  isActive?: boolean;
}

export const Connection: React.FC<ConnectionProps> = ({
  start = [0, 0, 0],
  end,
  color = '#64748b',
  lineWidth = 1.8,
  isActive = false,
}) => {
  // Calcula el punto medio con una curva parabólica ascendente
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2 + 0.35;
  const midZ = (start[2] + end[2]) / 2;

  const mid: [number, number, number] = [midX, midY, midZ];

  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={mid}
      color={color}
      lineWidth={isActive ? lineWidth * 1.6 : lineWidth}
      transparent
      opacity={isActive ? 0.95 : 0.45}
      dashed={false}
    />
  );
};

export default Connection;
