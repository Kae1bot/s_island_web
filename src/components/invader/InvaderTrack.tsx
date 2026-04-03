import { useGameStore } from '../../store/game-store';
import { selectTotalInvaders } from '../../store/selectors';
import { useT } from '../../i18n';
import styles from './InvaderTrack.module.css';

export function InvaderTrack() {
  const gameState = useGameStore(s => s.gameState);
  const { invaders, blight } = gameState;
  const totals = selectTotalInvaders(gameState);
  const { t } = useT();

  return (
    <div className={styles.container}>
      {/* Invader pipeline */}
      <div className={styles.pipeline}>
        <InvaderSlot
          label={t('ravage')}
          terrain={invaders.ravage?.terrain ?? null}
          stage={invaders.ravage?.stage ?? null}
          variant="danger"
        />
        <div className={styles.arrow}>→</div>
        <InvaderSlot
          label={t('build')}
          terrain={invaders.build?.terrain ?? null}
          stage={invaders.build?.stage ?? null}
          variant="warning"
        />
        <div className={styles.arrow}>→</div>
        <InvaderSlot
          label={t('explore')}
          terrain={invaders.explore?.terrain ?? null}
          stage={invaders.explore?.stage ?? null}
          variant="default"
        />
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('deck')}</span>
          <span className={styles.statValue}>{invaders.deck.length}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('explorers')}</span>
          <span className={styles.statValue}>{totals.explorers}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('towns')}</span>
          <span className={styles.statValue}>{totals.towns}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('cities')}</span>
          <span className={styles.statValue}>{totals.cities}</span>
        </div>
        <div className={`${styles.stat} ${blight.remaining <= 2 ? styles.blightDanger : ''}`}>
          <span className={styles.statLabel}>{t('blight')}</span>
          <span className={styles.statValue}>{blight.remaining}</span>
        </div>
      </div>
    </div>
  );
}

function InvaderSlot({
  label,
  terrain,
  stage,
  variant,
}: {
  label: string;
  terrain: string | null;
  stage: number | null;
  variant: 'danger' | 'warning' | 'default';
}) {
  const { t } = useT();
  const variantCls = variant === 'danger'
    ? styles.slotDanger
    : variant === 'warning'
      ? styles.slotWarning
      : styles.slotDefault;

  return (
    <div className={`${styles.slot} ${variantCls}`}>
      <div className={styles.slotLabel}>{label}</div>
      {terrain ? (
        <>
          <div className={styles.terrain}>{terrain}</div>
          <div className={styles.stage}>{t('stage', stage ?? 0)}</div>
        </>
      ) : (
        <div className={styles.empty}>—</div>
      )}
    </div>
  );
}
