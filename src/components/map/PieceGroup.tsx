import type { Pieces } from '../../models/land';
import styles from './PieceGroup.module.css';

interface PieceGroupProps {
  pieces: Pieces;
  x: number;
  y: number;
}

export function PieceGroup({ pieces, x, y }: PieceGroupProps) {
  const items: { label: string; count: number; cls: string }[] = [];

  if (pieces.cities > 0) items.push({ label: 'C', count: pieces.cities, cls: styles.city });
  if (pieces.towns > 0) items.push({ label: 'T', count: pieces.towns, cls: styles.town });
  if (pieces.explorers > 0) items.push({ label: 'E', count: pieces.explorers, cls: styles.explorer });
  if (pieces.dahan > 0) items.push({ label: 'D', count: pieces.dahan, cls: styles.dahan });
  if (pieces.presence > 0) items.push({ label: 'P', count: pieces.presence, cls: styles.presence });
  if (pieces.blight > 0) items.push({ label: 'B', count: pieces.blight, cls: styles.blight });

  if (items.length === 0) return null;

  const spacing = 14;
  const totalWidth = items.length * spacing;
  const startX = x - totalWidth / 2 + spacing / 2;

  return (
    <g>
      {items.map((item, i) => (
        <g key={item.label} transform={`translate(${startX + i * spacing}, ${y})`}>
          <circle r="6" className={item.cls} />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            className={styles.label}
          >
            {item.count > 1 ? `${item.label}${item.count}` : item.label}
          </text>
        </g>
      ))}
    </g>
  );
}
