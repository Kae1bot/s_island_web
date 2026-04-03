import type { GameState } from '../models/game-state';
import type { PendingEffect, PieceType } from '../models/targeting';
import type { Land } from '../models/land';
import { meetsThreshold } from '../models/elements';
import { logMsg } from '../models/log-entry';
import { getSpiritDefinition } from '../data/spirits';
import { resolveInnateEffect } from './innate-effects';
import { buildCardSubEffects, applyCardSubEffect } from './card-effects';

// ── Apply target choice (SELECT_TARGET → expand into sub-effects) ──

export function applyTargetChoice(state: GameState, landId: string): GameState {
  const pending = state.pendingEffects;
  if (pending.length === 0) throw new Error('No pending effects.');

  const current = pending[0];
  if (current.type !== 'SELECT_TARGET') {
    throw new Error(`Expected SELECT_TARGET, got ${current.type}`);
  }

  if (!current.validLands.includes(landId)) {
    throw new Error(`Land ${landId} is not a valid target.`);
  }

  const rest = pending.slice(1);

  if (current.source === 'innate') {
    // Build innate sub-effects
    const subEffects = buildInnateEffects(state, current.cardId as string, landId);
    return {
      ...state,
      pendingEffects: [...subEffects, ...rest],
    };
  }

  // Build card sub-effects
  const subEffects = buildCardEffects(state, current.cardId, landId);
  return {
    ...state,
    pendingEffects: [...subEffects, ...rest],
  };
}

// ── Build card-specific sub-effects after target is chosen ──

function buildCardEffects(
  state: GameState,
  cardId: string,
  targetLand: string,
): PendingEffect[] {
  return buildCardSubEffects(state, cardId, targetLand);
}

// ── Build innate sub-effects (Massive Flooding) ──

function buildInnateEffects(state: GameState, innateId: string, targetLand: string): PendingEffect[] {
  const definition = getSpiritDefinition(state.spirit.definitionId);
  const innate = definition.innateAbilities.find(i => i.id === innateId);
  if (!innate) return [];

  const elements = state.spirit.elements;
  let highestLevel = -1;
  for (let i = innate.levels.length - 1; i >= 0; i--) {
    if (meetsThreshold(elements, innate.levels[i].threshold)) {
      highestLevel = i;
      break;
    }
  }

  if (highestLevel === -1) return [];

  return [{ type: 'APPLY_INNATE_EFFECT', innateId: innateId, level: highestLevel, targetLand }];
}

// ── Apply card effect (after target is chosen) ──

export function applyCardEffect(state: GameState): GameState {
  const pending = state.pendingEffects;
  if (pending.length === 0) throw new Error('No pending effects.');

  const current = pending[0];
  if (current.type !== 'APPLY_CARD_EFFECT') {
    throw new Error(`Expected APPLY_CARD_EFFECT, got ${current.type}`);
  }

  const rest = pending.slice(1);
  const stateWithoutCurrent: GameState = { ...state, pendingEffects: rest };

  return applyCardSubEffect(stateWithoutCurrent, current.cardId as string, current.targetLand);
}

// ── Apply innate effect ──

export function applyInnateEffect(state: GameState): GameState {
  const pending = state.pendingEffects;
  if (pending.length === 0) throw new Error('No pending effects.');

  const current = pending[0];
  if (current.type !== 'APPLY_INNATE_EFFECT') {
    throw new Error(`Expected APPLY_INNATE_EFFECT, got ${current.type}`);
  }

  const rest = pending.slice(1);
  const stateWithoutCurrent: GameState = { ...state, pendingEffects: rest };

  return resolveInnateEffect(stateWithoutCurrent, current.innateId, current.level, current.targetLand);
}

// ── Push a piece to an adjacent land ──

export function applyPushChoice(
  state: GameState,
  pieceType: PieceType,
  destinationLandId: string,
): GameState {
  const pending = state.pendingEffects;
  if (pending.length === 0) throw new Error('No pending effects.');

  const current = pending[0];
  if (current.type !== 'PUSH') {
    throw new Error(`Expected PUSH, got ${current.type}`);
  }

  const sourceLand = state.lands[current.targetLand];
  const destLand = state.lands[destinationLandId];
  if (!sourceLand || !destLand) throw new Error('Invalid lands.');

  // Validate adjacency
  if (!sourceLand.adjacentLands.includes(destinationLandId as any)) {
    throw new Error(`${destinationLandId} is not adjacent to ${current.targetLand}.`);
  }

  // Validate piece exists
  if (sourceLand.pieces[pieceType] <= 0) {
    throw new Error(`No ${pieceType} in ${current.targetLand} to push.`);
  }

  // Move piece
  const newSource: Land = {
    ...sourceLand,
    pieces: { ...sourceLand.pieces, [pieceType]: sourceLand.pieces[pieceType] - 1 },
  };
  const newDest: Land = {
    ...destLand,
    pieces: { ...destLand.pieces, [pieceType]: destLand.pieces[pieceType] + 1 },
  };

  const remaining = current.remaining - 1;
  const rest = pending.slice(1);

  // Check if more pushes needed and pieces still available
  const hasMoreToPush = remaining > 0 && current.pieceTypes.some(
    pt => (pt === pieceType ? newSource.pieces[pt] : sourceLand.pieces[pt]) > 0,
  );

  const newPending = hasMoreToPush
    ? [{ ...current, remaining }, ...rest]
    : rest;

  return {
    ...state,
    lands: { ...state.lands, [current.targetLand]: newSource, [destinationLandId]: newDest },
    pendingEffects: newPending,
    log: [...state.log, logMsg('logPushed', pieceType, current.targetLand, destinationLandId)],
  };
}

// ── Gather a piece from an adjacent land ──

export function applyGatherChoice(
  state: GameState,
  sourceLandId: string,
  pieceType: PieceType,
): GameState {
  const pending = state.pendingEffects;
  if (pending.length === 0) throw new Error('No pending effects.');

  const current = pending[0];
  if (current.type !== 'GATHER') {
    throw new Error(`Expected GATHER, got ${current.type}`);
  }

  const targetLand = state.lands[current.targetLand];
  const sourceLand = state.lands[sourceLandId];
  if (!targetLand || !sourceLand) throw new Error('Invalid lands.');

  if (!targetLand.adjacentLands.includes(sourceLandId as any)) {
    throw new Error(`${sourceLandId} is not adjacent to ${current.targetLand}.`);
  }

  if (sourceLand.pieces[pieceType] <= 0) {
    throw new Error(`No ${pieceType} in ${sourceLandId} to gather.`);
  }

  const newSource: Land = {
    ...sourceLand,
    pieces: { ...sourceLand.pieces, [pieceType]: sourceLand.pieces[pieceType] - 1 },
  };
  const newTarget: Land = {
    ...targetLand,
    pieces: { ...targetLand.pieces, [pieceType]: targetLand.pieces[pieceType] + 1 },
  };

  const remaining = current.remaining - 1;
  const rest = pending.slice(1);

  const newPending = remaining > 0
    ? [{ ...current, remaining }, ...rest]
    : rest;

  return {
    ...state,
    lands: { ...state.lands, [sourceLandId]: newSource, [current.targetLand]: newTarget },
    pendingEffects: newPending,
    log: [...state.log, logMsg('logGathered', pieceType, sourceLandId, current.targetLand)],
  };
}

// ── Skip current optional effect ──

export function skipCurrentEffect(state: GameState): GameState {
  const pending = state.pendingEffects;
  if (pending.length === 0) return state;

  const current = pending[0];
  if (current.type === 'PUSH' || current.type === 'GATHER') {
    if (!current.optional) {
      throw new Error('Cannot skip mandatory effect.');
    }
  }

  return {
    ...state,
    pendingEffects: pending.slice(1),
    log: [...state.log, logMsg('logSkippedEffect', current.type)],
  };
}

/**
 * Get pushable pieces in target land for the current PUSH effect.
 */
export function getPushablePieces(state: GameState): { pieceType: PieceType; count: number }[] {
  const pending = state.pendingEffects;
  if (pending.length === 0 || pending[0].type !== 'PUSH') return [];

  const current = pending[0];
  const land = state.lands[current.targetLand];
  if (!land) return [];

  return current.pieceTypes
    .map(pt => ({ pieceType: pt, count: land.pieces[pt] }))
    .filter(p => p.count > 0);
}

/**
 * Get gatherable pieces from adjacent lands for the current GATHER effect.
 */
export function getGatherableSources(state: GameState): { landId: string; pieceType: PieceType; count: number }[] {
  const pending = state.pendingEffects;
  if (pending.length === 0 || pending[0].type !== 'GATHER') return [];

  const current = pending[0];
  const targetLand = state.lands[current.targetLand];
  if (!targetLand) return [];

  const sources: { landId: string; pieceType: PieceType; count: number }[] = [];
  for (const adjId of targetLand.adjacentLands) {
    const adj = state.lands[adjId as string];
    if (!adj) continue;
    for (const pt of current.pieceTypes) {
      if (adj.pieces[pt] > 0) {
        sources.push({ landId: adjId as string, pieceType: pt, count: adj.pieces[pt] });
      }
    }
  }
  return sources;
}
