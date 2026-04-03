import { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/game-store';
import { BOARD_D_SVG, OCEAN_PATH, BOARD_VIEWBOX } from './board-d-paths';
import { LandTile } from './LandTile';
import styles from './IslandMap.module.css';

export function IslandMap() {
  const lands = useGameStore(s => s.gameState.lands);
  const [selectedLand, setSelectedLand] = useState<string | null>(null);

  // Simple pan/zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'touch' || e.button === 0) {
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: transform.x,
        origY: transform.y,
      };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  }, [transform.x, transform.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTransform(prev => ({
      ...prev,
      x: dragRef.current!.origX + dx,
      y: dragRef.current!.origY + dy,
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.5, Math.min(3, prev.scale - e.deltaY * 0.001)),
    }));
  }, []);

  return (
    <div
      className={styles.container}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <svg
        viewBox={BOARD_VIEWBOX}
        className={styles.svg}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        }}
      >
        {/* Ocean background */}
        <path d={OCEAN_PATH} fill="var(--terrain-ocean)" opacity={0.6} />

        {/* Land tiles */}
        {BOARD_D_SVG.map(svg => {
          const land = lands[svg.id];
          if (!land) return null;
          return (
            <LandTile
              key={svg.id}
              land={land}
              svg={svg}
              selected={selectedLand === svg.id}
              onSelect={setSelectedLand}
            />
          );
        })}
      </svg>
    </div>
  );
}
