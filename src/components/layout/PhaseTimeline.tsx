import { useGameStore } from '../../store/game-store';
import { useT } from '../../i18n';
import type { TurnPhase, PhaseStep } from '../../models/phase';
import type { TranslationKey } from '../../i18n';
import { PHASE_ORDER } from '../../models/phase';
import styles from './PhaseTimeline.module.css';

interface PhaseGroup {
  phase: TurnPhase;
  labelKey: TranslationKey;
  steps: { step: PhaseStep; labelKey: TranslationKey }[];
}

const PHASE_GROUPS: PhaseGroup[] = [
  {
    phase: 'SPIRIT_PHASE',
    labelKey: 'groupSpirit',
    steps: [
      { step: 'GROWTH_SELECTION', labelKey: 'stepGrowth' },
      { step: 'PLACE_PRESENCE', labelKey: 'stepPresence' },
      { step: 'GAIN_ENERGY', labelKey: 'stepEnergy' },
      { step: 'PLAY_CARDS', labelKey: 'stepCards' },
    ],
  },
  {
    phase: 'FAST_POWERS',
    labelKey: 'groupFast',
    steps: [
      { step: 'RESOLVE_FEAR_CARDS', labelKey: 'stepFear' },
      { step: 'RESOLVE_FAST', labelKey: 'stepPowers' },
    ],
  },
  {
    phase: 'INVADER_PHASE',
    labelKey: 'groupInvader',
    steps: [
      { step: 'RAVAGE', labelKey: 'stepRavage' },
      { step: 'BUILD', labelKey: 'stepBuild' },
      { step: 'EXPLORE', labelKey: 'stepExplore' },
      { step: 'ADVANCE_INVADER_CARDS', labelKey: 'stepAdvance' },
    ],
  },
  {
    phase: 'SLOW_POWERS',
    labelKey: 'groupSlow',
    steps: [
      { step: 'RESOLVE_SLOW', labelKey: 'stepPowers' },
    ],
  },
  {
    phase: 'CLEANUP',
    labelKey: 'groupClean',
    steps: [
      { step: 'DISCARD_CARDS', labelKey: 'stepDiscard' },
      { step: 'RESET_TURN', labelKey: 'stepReset' },
    ],
  },
];

function getStepIndex(phase: TurnPhase, step: PhaseStep): number {
  return PHASE_ORDER.findIndex(p => p.phase === phase && p.step === step);
}

export function PhaseTimeline() {
  const { phase: currentPhase, phaseStep: currentStep } = useGameStore(s => s.gameState);
  const currentIndex = getStepIndex(currentPhase, currentStep);
  const { t } = useT();

  return (
    <div className={styles.timeline}>
      {PHASE_GROUPS.map(group => {
        const isActiveGroup = group.phase === currentPhase;
        return (
          <div
            key={group.phase}
            className={`${styles.group} ${isActiveGroup ? styles.activeGroup : ''}`}
          >
            <div className={styles.groupLabel}>{t(group.labelKey)}</div>
            <div className={styles.steps}>
              {group.steps.map(({ step, labelKey }) => {
                const stepIndex = getStepIndex(group.phase, step);
                const isCurrent = stepIndex === currentIndex;
                const isDone = stepIndex < currentIndex;

                const cls = isCurrent
                  ? styles.current
                  : isDone
                    ? styles.done
                    : styles.future;

                return (
                  <div
                    key={step}
                    className={`${styles.step} ${cls}`}
                    title={t(labelKey)}
                  >
                    <div className={styles.dot} />
                    {isCurrent && (
                      <div className={styles.stepLabel}>{t(labelKey)}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
