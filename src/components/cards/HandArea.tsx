import { useGameStore } from '../../store/game-store';
import { selectHandCards, selectPlayableCards } from '../../store/selectors';
import { getPowerCard } from '../../data/powers';
import { PowerCardView } from './PowerCardView';
import { InnateCardView } from './InnateCardView';
import type { PowerCardId } from '../../models/power-card';
import { getSpiritDefinition } from '../../data/spirits';
import { meetsThreshold } from '../../models/elements';
import { isResolvingPower } from '../../engine';
import { useT } from '../../i18n';
import styles from './HandArea.module.css';

export function HandArea() {
  const gameState = useGameStore(s => s.gameState);
  const playCardAction = useGameStore(s => s.playCard);
  const unplayCardAction = useGameStore(s => s.unplayCard);
  const beginResolve = useGameStore(s => s.beginResolvePower);
  const cancelResolve = useGameStore(s => s.cancelResolvePower);
  const { t } = useT();

  const hand = selectHandCards(gameState);
  const playable = selectPlayableCards(gameState);
  const playableIds = new Set(playable.map(c => c.id as string));
  const isPlayPhase = gameState.phaseStep === 'PLAY_CARDS';
  const isResolvingFast = gameState.phaseStep === 'RESOLVE_FAST';
  const isResolvingSlow = gameState.phaseStep === 'RESOLVE_SLOW';
  const isResolving = isResolvingFast || isResolvingSlow;
  const hasPendingEffects = gameState.pendingEffects.length > 0;
  const resolvedIds = new Set(gameState.resolvedPowerIds);

  const played = gameState.spirit.playedThisTurn.map(getPowerCard);
  const discarded = gameState.spirit.discard.map(getPowerCard);

  // Compute active innate abilities based on current elements
  const elements = gameState.spirit.elements;
  const definition = getSpiritDefinition(gameState.spirit.definitionId);
  const activeInnates = definition.innateAbilities
    .map(innate => {
      let highestLevel = -1;
      for (let i = innate.levels.length - 1; i >= 0; i--) {
        if (meetsThreshold(elements, innate.levels[i].threshold)) {
          highestLevel = i;
          break;
        }
      }
      return { innate, highestLevel };
    })
    .filter(a => a.highestLevel >= 0);

  const hasPlayedOrInnate = played.length > 0 || activeInnates.length > 0;

  // During resolution, determine which cards match the current speed
  const resolveSpeed = isResolvingFast ? 'fast' : isResolvingSlow ? 'slow' : null;

  return (
    <div className={styles.container}>
      {hasPlayedOrInnate && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            {t('playedThisTurn')}
            {isPlayPhase && <span className={styles.hint}> {t('hintTapCancel')}</span>}
            {isResolving && !hasPendingEffects && <span className={styles.hint}> {t('hintTapResolve')}</span>}
            {isResolving && hasPendingEffects && <span className={styles.hint}> {t('hintTapAgainCancel')}</span>}
          </div>
          <div className={styles.cardRow}>
            {played.map(card => {
              const cardId = card.id as string;
              const alreadyDone = resolvedIds.has(cardId) || (isResolvingSlow && card.speed === 'fast');
              const matchesSpeed = resolveSpeed === card.speed;
              const currentlyResolving = isResolving && isResolvingPower(gameState, cardId);
              const canResolve = isResolving && !hasPendingEffects && matchesSpeed && !alreadyDone;

              return (
                <PowerCardView
                  key={card.id}
                  card={card}
                  playable={isPlayPhase || canResolve || currentlyResolving}
                  resolved={alreadyDone && !currentlyResolving}
                  variant="played"
                  onPlay={
                    isPlayPhase
                      ? () => unplayCardAction(card.id as PowerCardId)
                      : currentlyResolving
                        ? () => cancelResolve(cardId)
                        : canResolve
                          ? () => beginResolve(cardId)
                          : undefined
                  }
                />
              );
            })}
            {activeInnates.map(({ innate, highestLevel }) => {
              const innateDone = resolvedIds.has(innate.id) || (isResolvingSlow && innate.speed === 'fast');
              const matchesSpeed = resolveSpeed === innate.speed;
              const currentlyResolving = isResolving && isResolvingPower(gameState, innate.id);
              const canResolve = isResolving && !hasPendingEffects && matchesSpeed && !innateDone;

              return (
                <InnateCardView
                  key={innate.id}
                  innate={innate}
                  activeLevel={highestLevel}
                  elements={elements}
                  playable={canResolve || currentlyResolving}
                  resolved={innateDone && !currentlyResolving}
                  onResolve={
                    currentlyResolving
                      ? () => cancelResolve(innate.id)
                      : canResolve
                        ? () => beginResolve(innate.id)
                        : undefined
                  }
                />
              );
            })}
          </div>
        </div>
      )}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>
          {t('handCount', hand.length)}
        </div>
        <div className={styles.cardRow}>
          {hand.map(card => (
            <PowerCardView
              key={card.id}
              card={card}
              playable={isPlayPhase && playableIds.has(card.id as string)}
              onPlay={() => playCardAction(card.id as PowerCardId)}
            />
          ))}
          {hand.length === 0 && (
            <div className={styles.empty}>{t('noCardsInHand')}</div>
          )}
        </div>
      </div>
      {discarded.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            {t('discardCount', discarded.length)}
          </div>
          <div className={styles.cardRow}>
            {discarded.map(card => (
              <PowerCardView key={card.id} card={card} variant="discarded" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
