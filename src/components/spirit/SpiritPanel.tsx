import { useGameStore } from '../../store/game-store';
import { getSpiritDefinition } from '../../data/spirits';
import { selectEnergyPerTurn, selectCardPlayLimit } from '../../store/selectors';
import { useT } from '../../i18n';
import { getInnateText, getSpiritName } from '../../i18n/cards';
import styles from './SpiritPanel.module.css';

const ELEMENT_SYMBOLS: Record<string, string> = {
  sun: '☀', moon: '☾', fire: '🔥', water: '💧',
  earth: '⛰', plant: '🌿', animal: '🐾', air: '💨',
};

export function SpiritPanel() {
  const gameState = useGameStore(s => s.gameState);
  const spirit = gameState.spirit;
  const definition = getSpiritDefinition(spirit.definitionId);
  const energyPerTurn = selectEnergyPerTurn(gameState);
  const cardPlayLimit = selectCardPlayLimit(gameState);
  const { t, locale } = useT();

  const elements = Object.entries(spirit.elements)
    .filter(([, v]) => v && v > 0);

  const spiritName = getSpiritName(definition.id as string, locale) ?? definition.name;

  return (
    <div className={styles.container}>
      <div className={styles.name}>{spiritName}</div>

      {/* Energy */}
      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('energy')}</span>
          <span className={styles.statValue}>{spirit.energy}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('perTurn')}</span>
          <span className={styles.statValueSmall}>{energyPerTurn}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('cardPlays')}</span>
          <span className={styles.statValueSmall}>{cardPlayLimit}</span>
        </div>
      </div>

      {/* Presence tracks */}
      <div className={styles.trackSection}>
        <div className={styles.trackLabel}>{t('energyTrack')}</div>
        <div className={styles.track}>
          {definition.presenceTrack.energy.map((slot, i) => (
            <div
              key={i}
              className={`${styles.slot} ${i < spirit.revealedEnergyIndex ? styles.revealed : styles.covered}`}
            >
              {slot.value}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.trackSection}>
        <div className={styles.trackLabel}>{t('cardPlayTrack')}</div>
        <div className={styles.track}>
          {definition.presenceTrack.cardPlay.map((slot, i) => (
            <div
              key={i}
              className={`${styles.slot} ${i < spirit.revealedCardPlayIndex ? styles.revealed : styles.covered}`}
            >
              {slot.special === 'reclaim_one' ? 'R1' : slot.value}
            </div>
          ))}
        </div>
      </div>

      {/* Elements */}
      {elements.length > 0 && (
        <div className={styles.elementsSection}>
          <div className={styles.trackLabel}>{t('elements')}</div>
          <div className={styles.elements}>
            {elements.map(([el, count]) => (
              <span key={el} className={styles.elementBadge}>
                {ELEMENT_SYMBOLS[el] ?? el} {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Special Rules */}
      {definition.specialRules.map((rule, i) => (
        <div key={i} className={styles.specialRule}>
          <div className={styles.specialRuleTitle}>{rule.name}</div>
          <div className={styles.specialRuleText}>{rule.description}</div>
        </div>
      ))}

      {/* Innate */}
      {definition.innateAbilities.map(innate => {
        const localized = getInnateText(innate.id, locale);
        const innateName = localized?.name ?? innate.name;
        const speedSuffix = locale === 'zh'
          ? (innate.speed === 'fast' ? '（快速）' : '（慢速）')
          : ` (${innate.speed === 'fast' ? 'Fast' : 'Slow'})`;

        return (
          <div key={innate.id} className={styles.innate}>
            <div className={styles.innateTitle}>{innateName}{speedSuffix}</div>
            {innate.levels.map((level, i) => {
              const thresholdStr = Object.entries(level.threshold)
                .map(([el, n]) => `${n}${ELEMENT_SYMBOLS[el] ?? el}`)
                .join(' ');
              const desc = localized?.levels[i] ?? level.description;
              return (
                <div key={i} className={styles.innateLevel}>
                  <span className={styles.innateLevelNum}>Lv{i + 1}</span>
                  <span className={styles.innateThreshold}>{thresholdStr}</span>
                  <span className={styles.innateEffect}>{desc}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
