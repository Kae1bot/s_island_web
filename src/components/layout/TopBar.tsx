import { useGameStore } from '../../store/game-store';
import { selectEnergyPerTurn, selectCardPlayLimit } from '../../store/selectors';
import { useT } from '../../i18n';
import { SettingsMenu } from './SettingsMenu';
import type { PhaseStep } from '../../models/phase';
import type { TranslationKey } from '../../i18n';
import styles from './TopBar.module.css';

const ELEMENT_SYMBOLS: Record<string, string> = {
  sun: '☀', moon: '☾', fire: '🔥', water: '💧',
  earth: '⛰', plant: '🌿', animal: '🐾', air: '💨',
};

const PHASE_LABEL_KEYS: Record<PhaseStep, TranslationKey> = {
  GROWTH_SELECTION: 'phaseSelectGrowth',
  PLACE_PRESENCE: 'phasePresence',
  GAIN_ENERGY: 'phaseGainEnergy',
  PLAY_CARDS: 'phasePlayCards',
  RESOLVE_FEAR_CARDS: 'phaseResolveFear',
  RESOLVE_FAST: 'phaseResolveFast',
  RAVAGE: 'phaseRavage',
  BUILD: 'phaseBuild',
  EXPLORE: 'phaseExplore',
  ADVANCE_INVADER_CARDS: 'phaseAdvanceCards',
  RESOLVE_SLOW: 'phaseResolveSlow',
  DISCARD_CARDS: 'phaseDiscard',
  RESET_TURN: 'phaseReset',
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function TopBar() {
  const gameState = useGameStore(s => s.gameState);
  const { phaseStep, turn, fear, gameResult, spirit, invaders } = gameState;
  const undo = useGameStore(s => s.undo);
  const openSpiritSelect = useGameStore(s => s.openSpiritSelect);
  const { t } = useT();

  const energyPerTurn = selectEnergyPerTurn(gameState);
  const cardPlayLimit = selectCardPlayLimit(gameState);
  const elements = Object.entries(spirit.elements).filter(([, v]) => v && v > 0);

  return (
    <header className={styles.topbar}>
      {/* Left: turn + phase + quick stats */}
      <div className={styles.left}>
        <span className={styles.turn}>{t('turn')} {turn}</span>
        <span className={styles.phase}>{t(PHASE_LABEL_KEYS[phaseStep])}</span>

        <span className={styles.sep} />

        <span className={styles.info}>
          <span className={styles.infoLabel}>{t('energyShort')}</span>
          <span className={styles.infoVal}>{spirit.energy}</span>
          <span className={styles.infoSub}>+{energyPerTurn}</span>
        </span>

        <span className={styles.info}>
          <span className={styles.infoLabel}>{t('cards')}</span>
          <span className={styles.infoVal}>{spirit.playedThisTurn.length}/{cardPlayLimit}</span>
        </span>

        {elements.length > 0 && (
          <span className={styles.info}>
            {elements.map(([el, count]) => (
              <span key={el} className={styles.elBadge}>
                {ELEMENT_SYMBOLS[el] ?? el}{count}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Right: invader cards + fear + buttons */}
      <div className={styles.right}>
        <span className={styles.invaderInfo}>
          <InvaderSlot label="R" card={invaders.ravage} variant="danger" />
          <InvaderSlot label="B" card={invaders.build} variant="warn" />
          <InvaderSlot label="X" card={invaders.explore} variant="default" />
        </span>

        <span className={styles.fear} title="Fear Progress">
          T{fear.terrorLevel} | {fear.generatedFear}/{fear.fearPerCard}
        </span>
        <button className={styles.btn} onClick={undo} title={t('undo')}>↩</button>
        <button className={styles.btn} onClick={openSpiritSelect} title={t('newGame')}>⟳</button>
        <SettingsMenu />
        {gameResult !== 'playing' && (
          <span className={gameResult === 'victory' ? styles.victory : styles.defeat}>
            {gameResult === 'victory' ? t('victory') : t('defeat')}
          </span>
        )}
      </div>
    </header>
  );
}

function InvaderSlot({
  label,
  card,
  variant,
}: {
  label: string;
  card: { terrain: string } | null;
  variant: 'danger' | 'warn' | 'default';
}) {
  const cls = variant === 'danger'
    ? styles.invDanger
    : variant === 'warn'
      ? styles.invWarn
      : styles.invDefault;

  return (
    <span className={`${styles.invSlot} ${cls}`}>
      <span className={styles.invLabel}>{label}</span>
      {card ? cap(card.terrain) : '—'}
    </span>
  );
}
