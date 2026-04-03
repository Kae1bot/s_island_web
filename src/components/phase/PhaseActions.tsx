import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/game-store';
import type { PresenceTrack } from '../../models/spirit';
import {
  getValidLandsForPlacement,
  canRevealEnergyTrack,
  canRevealCardPlayTrack,
} from '../../engine/spirit-phase';
import { getPushablePieces, getGatherableSources } from '../../engine/effects';
import { getUnresolvedPowers } from '../../engine/power-resolution';
import { getPowerCard } from '../../data/powers';
import { getSpiritDefinition } from '../../data/spirits';
import { getAdjacentLands } from '../../engine/targeting';
import { useT } from '../../i18n';
import styles from './PhaseActions.module.css';

export function PhaseActions() {
  const store = useGameStore();
  const { phaseStep, gameResult, pendingEffects } = store.gameState;

  if (gameResult !== 'playing') return null;

  if (pendingEffects.length > 0) {
    return (
      <div className={styles.actions}>
        <EffectResolutionUI store={store} />
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <PhaseActionContent step={phaseStep} store={store} />
    </div>
  );
}

function PhaseActionContent({ step, store }: { step: string; store: ReturnType<typeof useGameStore.getState> }) {
  const { t } = useT();

  switch (step) {
    case 'GROWTH_SELECTION':
      return <GrowthButtons store={store} />;
    case 'PLACE_PRESENCE':
      return <PlacePresenceUI store={store} />;
    case 'GAIN_ENERGY':
      return <SingleAction label={t('gainEnergyAction')} onClick={store.gainEnergy} />;
    case 'PLAY_CARDS':
      return <SingleAction label={t('donePlayingCards')} onClick={store.confirmCardPlays} />;
    case 'RESOLVE_FEAR_CARDS':
      return <SingleAction label={t('resolveFearCards')} onClick={store.resolveFearCards} />;
    case 'RESOLVE_FAST':
      return <ResolveDoneButton store={store} speed="fast" />;
    case 'RAVAGE':
      return <SingleAction label={t('resolveRavage')} onClick={store.resolveRavage} variant="danger" />;
    case 'BUILD':
      return <SingleAction label={t('resolveBuild')} onClick={store.resolveBuild} variant="danger" />;
    case 'EXPLORE':
      return <SingleAction label={t('resolveExplore')} onClick={store.resolveExplore} variant="danger" />;
    case 'ADVANCE_INVADER_CARDS':
      return <SingleAction label={t('advanceInvaderCards')} onClick={store.advanceInvaderCards} />;
    case 'RESOLVE_SLOW':
      return <ResolveDoneButton store={store} speed="slow" />;
    case 'DISCARD_CARDS':
      return <SingleAction label={t('discardPlayedCards')} onClick={store.discardPlayedCards} />;
    case 'RESET_TURN':
      return <SingleAction label={t('startNextTurn')} onClick={store.resetTurn} variant="accent" />;
    default:
      return null;
  }
}

function GrowthButtons({ store }: { store: ReturnType<typeof useGameStore.getState> }) {
  const { t } = useT();
  return (
    <div className={styles.growthGroup}>
      <button className={styles.growthBtn} onClick={() => store.selectGrowth('growth-1')}>
        <span className={styles.growthLabel}>{t('growthReclaim')}</span>
        <span className={styles.growthSub}>{t('growthReclaimSub')}</span>
      </button>
      <button className={styles.growthBtn} onClick={() => store.selectGrowth('growth-2')}>
        <span className={styles.growthLabel}>{t('growthPresence')}</span>
        <span className={styles.growthSub}>{t('growthPresenceSub')}</span>
      </button>
      <button className={styles.growthBtn} onClick={() => store.selectGrowth('growth-3')}>
        <span className={styles.growthLabel}>{t('growthGainCard')}</span>
        <span className={styles.growthSub}>{t('growthGainCardSub')}</span>
      </button>
    </div>
  );
}

function PlacePresenceUI({ store }: { store: ReturnType<typeof useGameStore.getState> }) {
  const [selectedTrack, setSelectedTrack] = useState<PresenceTrack | null>(null);
  const { t } = useT();
  const gameState = store.gameState;
  const pending = gameState.pendingPresencePlacements;

  if (pending.length === 0) return null;

  const currentRange = pending[0].range;
  const validLands = getValidLandsForPlacement(gameState, currentRange);
  const canEnergy = canRevealEnergyTrack(gameState);
  const canCardPlay = canRevealCardPlayTrack(gameState);

  if (!selectedTrack) {
    return (
      <div className={styles.presenceGroup}>
        <div className={styles.presenceHint}>
          {t('placePresenceHint', pending.length, currentRange)}
        </div>
        <div className={styles.presenceHint}>{t('selectTrackHint')}</div>
        <div className={styles.trackButtons}>
          <button
            className={`${styles.actionBtn} ${styles.defaultBtn}`}
            disabled={!canEnergy}
            onClick={() => setSelectedTrack('energy')}
          >
            {t('energyTrack')}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.defaultBtn}`}
            disabled={!canCardPlay}
            onClick={() => setSelectedTrack('cardPlay')}
          >
            {t('cardPlayTrack')}
          </button>
        </div>
      </div>
    );
  }

  const trackLabel = selectedTrack === 'energy' ? t('energy') : t('cardPlays');

  return (
    <div className={styles.presenceGroup}>
      <div className={styles.presenceHint}>
        {t('fromTrackSelectLand', trackLabel, currentRange)}
      </div>
      <div className={styles.landButtons}>
        {validLands.map(id => (
          <button
            key={id}
            className={`${styles.actionBtn} ${styles.accentBtn}`}
            onClick={() => {
              store.placePresence(id, selectedTrack);
              setSelectedTrack(null);
            }}
          >
            {id}
          </button>
        ))}
      </div>
      <button
        className={`${styles.actionBtn} ${styles.dangerBtn}`}
        onClick={() => setSelectedTrack(null)}
      >
        {t('back')}
      </button>
    </div>
  );
}

function ResolveDoneButton({
  store,
  speed,
}: {
  store: ReturnType<typeof useGameStore.getState>;
  speed: 'fast' | 'slow';
}) {
  const { t } = useT();
  const unresolved = getUnresolvedPowers(store.gameState, speed);
  const speedLabel = speed === 'fast' ? t('fast') : t('slow');

  if (unresolved.length === 0) {
    return (
      <SingleAction
        label={t('doneAdvance', speedLabel)}
        onClick={() => store.advancePowerPhase()}
        variant="accent"
      />
    );
  }

  return (
    <div className={styles.presenceGroup}>
      <div className={styles.presenceHint}>
        {t('tapCardToResolve', unresolved.length)}
      </div>
      <SingleAction
        label={t('skipAllAdvance', speedLabel)}
        onClick={() => store.advancePowerPhase()}
      />
    </div>
  );
}

function EffectResolutionUI({ store }: { store: ReturnType<typeof useGameStore.getState> }) {
  const { pendingEffects } = store.gameState;
  const current = pendingEffects[0];
  const resolvedRef = useRef(false);
  const { t } = useT();

  useEffect(() => {
    if (
      !resolvedRef.current &&
      (current.type === 'APPLY_CARD_EFFECT' || current.type === 'APPLY_INNATE_EFFECT')
    ) {
      resolvedRef.current = true;
      store.resolveNextEffect();
    }
    return () => { resolvedRef.current = false; };
  }, [current, store]);

  switch (current.type) {
    case 'SELECT_TARGET':
      return <SelectTargetUI store={store} effect={current} />;
    case 'PUSH':
      return <PushUI store={store} />;
    case 'GATHER':
      return <GatherUI store={store} />;
    case 'APPLY_CARD_EFFECT':
    case 'APPLY_INNATE_EFFECT':
      return <div className={styles.presenceHint}>{t('resolvingEffect')}</div>;
    default:
      return null;
  }
}

function SelectTargetUI({
  store,
  effect,
}: {
  store: ReturnType<typeof useGameStore.getState>;
  effect: Extract<import('../../models/targeting').PendingEffect, { type: 'SELECT_TARGET' }>;
}) {
  const { t } = useT();
  const gameState = useGameStore(s => s.gameState);
  const cardName = effect.source === 'innate'
    ? (getSpiritDefinition(gameState.spirit.definitionId)
        .innateAbilities.find(i => i.id === (effect.cardId as string))?.name ?? effect.cardId as string)
    : getPowerCard(effect.cardId).name;

  return (
    <div className={styles.presenceGroup}>
      <div className={styles.presenceHint}>
        {t('selectTargetLand', cardName)}
      </div>
      <div className={styles.landButtons}>
        {effect.validLands.map(id => (
          <button
            key={id}
            className={`${styles.actionBtn} ${styles.accentBtn}`}
            onClick={() => store.selectTarget(id)}
          >
            {id}
          </button>
        ))}
      </div>
    </div>
  );
}

function PushUI({ store }: { store: ReturnType<typeof useGameStore.getState> }) {
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);
  const { t } = useT();
  const pushable = getPushablePieces(store.gameState);
  const current = store.gameState.pendingEffects[0];
  if (current.type !== 'PUSH') return null;

  const adjacentLands = getAdjacentLands(store.gameState, current.targetLand);

  if (!selectedPiece) {
    return (
      <div className={styles.presenceGroup}>
        <div className={styles.presenceHint}>
          {t('pushFrom', current.targetLand, current.remaining)}
        </div>
        <div className={styles.trackButtons}>
          {pushable.map(p => (
            <button
              key={p.pieceType}
              className={`${styles.actionBtn} ${styles.defaultBtn}`}
              onClick={() => setSelectedPiece(p.pieceType)}
            >
              {p.pieceType} ({p.count})
            </button>
          ))}
        </div>
        {current.optional && (
          <button
            className={`${styles.actionBtn} ${styles.dangerBtn}`}
            onClick={() => store.skipEffect()}
          >
            {t('skip')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.presenceGroup}>
      <div className={styles.presenceHint}>
        {t('pushTo', selectedPiece)}
      </div>
      <div className={styles.landButtons}>
        {adjacentLands.map(id => (
          <button
            key={id}
            className={`${styles.actionBtn} ${styles.accentBtn}`}
            onClick={() => {
              store.pushChoice(selectedPiece as any, id);
              setSelectedPiece(null);
            }}
          >
            {id}
          </button>
        ))}
      </div>
      <button
        className={`${styles.actionBtn} ${styles.dangerBtn}`}
        onClick={() => setSelectedPiece(null)}
      >
        {t('back')}
      </button>
    </div>
  );
}

function GatherUI({ store }: { store: ReturnType<typeof useGameStore.getState> }) {
  const { t } = useT();
  const sources = getGatherableSources(store.gameState);
  const current = store.gameState.pendingEffects[0];
  if (current.type !== 'GATHER') return null;

  return (
    <div className={styles.presenceGroup}>
      <div className={styles.presenceHint}>
        {t('gatherTo', current.targetLand, current.remaining)}
      </div>
      <div className={styles.landButtons}>
        {sources.map(s => (
          <button
            key={`${s.landId}-${s.pieceType}`}
            className={`${styles.actionBtn} ${styles.defaultBtn}`}
            onClick={() => store.gatherChoice(s.landId, s.pieceType)}
          >
            {s.pieceType} from {s.landId} ({s.count})
          </button>
        ))}
      </div>
      {current.optional && (
        <button
          className={`${styles.actionBtn} ${styles.dangerBtn}`}
          onClick={() => store.skipEffect()}
        >
          {t('skip')}
        </button>
      )}
    </div>
  );
}

function SingleAction({
  label,
  onClick,
  variant = 'default',
}: {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'accent';
}) {
  const cls = variant === 'danger'
    ? styles.dangerBtn
    : variant === 'accent'
      ? styles.accentBtn
      : styles.defaultBtn;
  return (
    <button className={`${styles.actionBtn} ${cls}`} onClick={onClick}>
      {label}
    </button>
  );
}
