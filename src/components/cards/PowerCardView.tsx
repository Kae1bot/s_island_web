import type { PowerCard } from '../../models/power-card';
import { useT } from '../../i18n';
import { getCardText, getSpeedLabel, getThresholdLabel } from '../../i18n/cards';
import styles from './PowerCardView.module.css';

interface PowerCardViewProps {
  card: PowerCard;
  playable?: boolean;
  resolved?: boolean;
  variant?: 'default' | 'played' | 'discarded';
  onPlay?: () => void;
}

const ELEMENT_SYMBOLS: Record<string, string> = {
  sun: '☀',
  moon: '☾',
  fire: '🔥',
  water: '💧',
  earth: '⛰',
  plant: '🌿',
  animal: '🐾',
  air: '💨',
};

export function PowerCardView({ card, playable = false, resolved = false, variant = 'default', onPlay }: PowerCardViewProps) {
  const { locale } = useT();
  const localized = getCardText(card.id as string, locale);

  const name = localized?.name ?? card.name;
  const description = localized?.description ?? card.description;
  const thresholdDesc = localized?.threshold ?? card.threshold?.description;

  const speedCls = card.speed === 'fast' ? styles.fast : styles.slow;
  const variantCls = variant === 'played' ? styles.played
    : variant === 'discarded' ? styles.discarded
    : '';

  return (
    <div
      className={`${styles.card} ${playable ? styles.playable : ''} ${resolved ? styles.resolved : ''} ${variantCls}`}
      onClick={playable ? onPlay : undefined}
    >
      <div className={styles.header}>
        <span className={`${styles.speed} ${speedCls}`}>
          {getSpeedLabel(card.speed, locale)}
        </span>
        <span className={styles.cost}>{card.cost}</span>
      </div>
      <div className={styles.name}>{name}</div>
      <div className={styles.elements}>
        {card.elements.map((el, i) => (
          <span key={i} className={styles.element} title={el}>
            {ELEMENT_SYMBOLS[el] ?? el}
          </span>
        ))}
      </div>
      <div className={styles.description}>{description}</div>
      {card.threshold && (
        <div className={styles.threshold}>
          <span className={styles.thresholdLabel}>{getThresholdLabel(locale)}</span>{' '}
          {thresholdDesc}
        </div>
      )}
    </div>
  );
}
