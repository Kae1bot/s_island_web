import type { GameState } from '../models/game-state';
import type { PendingEffect } from '../models/targeting';
import type { PowerCardId } from '../models/power-card';
import type { InnateAbility } from '../models/spirit';
import { getPowerCard } from '../data/powers';
import { meetsThreshold } from '../models/elements';
import { getSpiritDefinition } from '../data/spirits';
import { getValidTargetLands, getValidInnateLands } from './targeting';
import { logMsg } from '../models/log-entry';

// ── Get unresolved powers for a speed ──────────────────────

export interface ResolvablePower {
  readonly id: string;
  readonly name: string;
  readonly source: 'card' | 'innate';
  readonly speed: 'fast' | 'slow';
}

/**
 * Get all powers (cards + innates) that can be resolved at a given speed
 * and haven't been resolved yet this phase.
 */
export function getUnresolvedPowers(state: GameState, speed: 'fast' | 'slow'): ResolvablePower[] {
  const resolved = new Set(state.resolvedPowerIds);
  const powers: ResolvablePower[] = [];

  // Cards played this turn matching the speed
  for (const cardId of state.spirit.playedThisTurn) {
    const card = getPowerCard(cardId);
    if (card.speed !== speed) continue;
    if (resolved.has(cardId as string)) continue;
    powers.push({
      id: cardId as string,
      name: card.name,
      source: 'card',
      speed,
    });
  }

  // Innate abilities matching the speed (check threshold)
  const definition = getSpiritDefinition(state.spirit.definitionId);
  for (const innate of definition.innateAbilities) {
    if (innate.speed !== speed) continue;
    if (resolved.has(innate.id)) continue;

    // Check if any threshold is met
    const elements = state.spirit.elements;
    const hasMet = innate.levels.some(lvl => meetsThreshold(elements, lvl.threshold));
    if (!hasMet) continue;

    powers.push({
      id: innate.id,
      name: innate.name,
      source: 'innate',
      speed,
    });
  }

  return powers;
}

// ── Cancel resolving a power ──────────────────────────────

/**
 * Cancel a power that is currently being resolved (waiting for target selection).
 * Removes it from resolvedPowerIds and clears pendingEffects.
 */
export function cancelResolvePower(state: GameState, powerId: string): GameState {
  return {
    ...state,
    resolvedPowerIds: state.resolvedPowerIds.filter(id => id !== powerId),
    pendingEffects: [],
    log: [...state.log, logMsg('logCancelResolve')],
  };
}

/**
 * Check if a specific power is currently mid-resolution
 * (in resolvedPowerIds with a SELECT_TARGET pending for it).
 */
export function isResolvingPower(state: GameState, powerId: string): boolean {
  if (!state.resolvedPowerIds.includes(powerId)) return false;
  return state.pendingEffects.length > 0 &&
    state.pendingEffects[0].type === 'SELECT_TARGET' &&
    (state.pendingEffects[0].cardId as string) === powerId;
}

// ── Begin resolving a single power ─────────────────────────

/**
 * Start resolving a specific power (card or innate) by queueing its effects.
 * Called when the player clicks a card/innate to resolve.
 */
export function beginResolvePower(state: GameState, powerId: string): GameState {
  // Mark as resolved
  const newResolved = [...state.resolvedPowerIds, powerId];

  // Check if it's a card or innate
  const def = getSpiritDefinition(state.spirit.definitionId);
  const innate = def.innateAbilities.find(i => i.id === powerId);
  if (innate) {
    return beginResolveInnate(state, innate, newResolved);
  }

  return beginResolveCard(state, powerId as PowerCardId, newResolved);
}

function beginResolveCard(
  state: GameState,
  cardId: PowerCardId,
  resolvedPowerIds: readonly string[],
): GameState {
  const card = getPowerCard(cardId);

  if (card.targeting.targetType === 'spirit') {
    // Spirit-targeting cards resolve immediately
    const effects: PendingEffect[] = [
      { type: 'APPLY_CARD_EFFECT', cardId, targetLand: '' },
    ];
    return {
      ...state,
      resolvedPowerIds,
      pendingEffects: effects,
      log: [...state.log, logMsg('logResolvingCard', cardId as string)],
    };
  }

  const validLands = getValidTargetLands(state, card);
  if (validLands.length === 0) {
    return {
      ...state,
      resolvedPowerIds,
      log: [...state.log, logMsg('logNoValidTargets', cardId as string)],
    };
  }

  const effects: PendingEffect[] = [{
    type: 'SELECT_TARGET',
    cardId,
    source: 'card',
    validLands,
  }];

  return {
    ...state,
    resolvedPowerIds,
    pendingEffects: effects,
    log: [...state.log, logMsg('logSelectTarget', cardId as string)],
  };
}

function beginResolveInnate(
  state: GameState,
  innate: InnateAbility,
  resolvedPowerIds: readonly string[],
): GameState {
  const elements = state.spirit.elements;
  let highestLevel = -1;
  for (let i = innate.levels.length - 1; i >= 0; i--) {
    if (meetsThreshold(elements, innate.levels[i].threshold)) {
      highestLevel = i;
      break;
    }
  }

  if (highestLevel === -1) {
    return {
      ...state,
      resolvedPowerIds,
      log: [...state.log, logMsg('logThresholdNotMet', innate.id)],
    };
  }

  const validLands = getValidInnateLands(state, innate);
  if (validLands.length === 0) {
    return {
      ...state,
      resolvedPowerIds,
      log: [...state.log, logMsg('logNoValidTargets', innate.id)],
    };
  }

  const effects: PendingEffect[] = [{
    type: 'SELECT_TARGET',
    cardId: innate.id as PowerCardId,
    source: 'innate',
    validLands,
  }];

  return {
    ...state,
    resolvedPowerIds,
    pendingEffects: effects,
    log: [...state.log, logMsg('logInnateThresholdMet', innate.id, highestLevel + 1)],
  };
}

