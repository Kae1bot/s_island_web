import type { InnateAbility } from '../../models/spirit';
import type { ElementMap } from '../../models/elements';
import { meetsThreshold } from '../../models/elements';
import { useT } from '../../i18n';
import { getInnateText, getSpeedLabel, getInnateBadgeLabel } from '../../i18n/cards';
import styles from './InnateCardView.module.css';

const ELEMENT_SYMBOLS: Record<string, string> = {
  sun: '☀', moon: '☾', fire: '🔥', water: '💧',
  earth: '⛰', plant: '🌿', animal: '🐾', air: '💨',
};

interface InnateCardViewProps {
  innate: InnateAbility;
  activeLevel: number;
  elements: ElementMap;
  playable?: boolean;
  resolved?: boolean;
  onResolve?: () => void;
}

export function InnateCardView({ innate, activeLevel, elements, playable = false, resolved = false, onResolve }: InnateCardViewProps) {
  const { locale } = useT();
  const localized = getInnateText(innate.id, locale);

  const name = localized?.name ?? innate.name;

  return (
    <div
      className={`${styles.card} ${playable ? styles.playable : ''} ${resolved ? styles.resolved : ''}`}
      onClick={playable ? onResolve : undefined}
    >
      <div className={styles.header}>
        <span className={styles.speed}>
          {getSpeedLabel(innate.speed, locale)}
        </span>
        <span className={styles.badge}>{getInnateBadgeLabel(locale)}</span>
      </div>
      <div className={styles.name}>{name}</div>
      <div className={styles.levels}>
        {innate.levels.map((level, i) => {
          const met = meetsThreshold(elements, level.threshold);
          const isActive = i <= activeLevel;
          const thresholdStr = Object.entries(level.threshold)
            .map(([el, n]) => `${n}${ELEMENT_SYMBOLS[el] ?? el}`)
            .join(' ');
          const desc = localized?.levels[i] ?? level.description;
          return (
            <div
              key={i}
              className={`${styles.level} ${isActive ? styles.levelActive : styles.levelInactive}`}
            >
              <span className={styles.levelNum}>Lv{i + 1}</span>
              <span className={met ? styles.thresholdMet : styles.thresholdUnmet}>
                {thresholdStr}
              </span>
              <span className={styles.levelDesc}>{desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
