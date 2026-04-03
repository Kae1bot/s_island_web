import type { Land } from '../../models/land';
import type { LandSvgData } from './board-d-paths';
import { PieceGroup } from './PieceGroup';
import styles from './LandTile.module.css';

interface LandTileProps {
  land: Land;
  svg: LandSvgData;
  selected: boolean;
  onSelect: (landId: string) => void;
}

const TERRAIN_CLASS: Record<string, string> = {
  jungle: styles.jungle,
  wetland: styles.wetland,
  sand: styles.sand,
  mountain: styles.mountain,
};

export function LandTile({ land, svg, selected, onSelect }: LandTileProps) {
  return (
    <g
      onClick={() => onSelect(land.id as string)}
      className={styles.tile}
    >
      <path
        d={svg.path}
        className={`${TERRAIN_CLASS[land.terrain]} ${selected ? styles.selected : ''}`}
      />
      {/* Land label */}
      <text
        x={svg.centroid.x}
        y={svg.centroid.y - 12}
        textAnchor="middle"
        className={styles.landLabel}
      >
        {land.id}
      </text>
      {/* Pieces */}
      <PieceGroup
        pieces={land.pieces}
        x={svg.centroid.x}
        y={svg.centroid.y + 4}
      />
    </g>
  );
}
