import type { GameState } from '../models/game-state';
import type { PendingEffect } from '../models/targeting';
import { logMsg } from '../models/log-entry';
import { generateFear } from './fear';
import { applyDamageToInvaders } from './invader-phase';

// ── Registry ──────────────────────────────────────────────────

export type InnateEffectHandler = (
  state: GameState,
  targetLand: string,
  level: number,
) => GameState;

const INNATE_HANDLERS = new Map<string, InnateEffectHandler>();

export function registerInnateEffect(innateId: string, handler: InnateEffectHandler): void {
  INNATE_HANDLERS.set(innateId, handler);
}

export function resolveInnateEffect(
  state: GameState,
  innateId: string,
  level: number,
  targetLand: string,
): GameState {
  const handler = INNATE_HANDLERS.get(innateId);
  if (!handler) {
    return {
      ...state,
      log: [...state.log, logMsg('logNotImplemented', innateId)],
    };
  }
  return handler(state, targetLand, level);
}

// ── Massive Flooding (River Surges in Sunlight) ───────────────

function massiveFlooding(state: GameState, targetLand: string, level: number): GameState {
  const land = state.lands[targetLand];
  if (!land) return state;

  if (level >= 2) {
    // Lv3: 2 damage to EACH invader
    const pieces = state.lands[targetLand].pieces;
    const destroyedExplorers = pieces.explorers;
    const townsDestroyed = pieces.towns;
    let fear = townsDestroyed;
    // Explorer: 1HP, 2 damage → destroyed
    // Town: 2HP, 2 damage → destroyed → 1 fear each
    // City: 3HP, 2 damage → survives at 1HP
    const newPieces = {
      ...pieces,
      explorers: 0,
      towns: 0,
    };
    let newState: GameState = {
      ...state,
      lands: { ...state.lands, [targetLand]: { ...state.lands[targetLand], pieces: newPieces } },
      log: [...state.log, logMsg('logFloodingLv3', targetLand, destroyedExplorers, townsDestroyed)],
    };
    if (fear > 0) {
      newState = generateFear(newState, fear);
    }
    return newState;
  }

  if (level >= 1) {
    // Lv2: 2 Damage + Push up to 3 Explorers/Towns
    const result = applyDamageToInvaders(state.lands[targetLand], 2);
    let newState: GameState = {
      ...state,
      lands: { ...state.lands, [targetLand]: result.land },
      log: [...state.log, logMsg('logFloodingLv2', targetLand)],
    };
    if (result.fear > 0) {
      newState = generateFear(newState, result.fear);
    }
    return {
      ...newState,
      pendingEffects: [
        { type: 'PUSH', targetLand, pieceTypes: ['explorers', 'towns'], remaining: 3, optional: true } as PendingEffect,
        ...newState.pendingEffects,
      ],
    };
  }

  // Lv1: Push 1 Explorer/Town
  return {
    ...state,
    log: [...state.log, logMsg('logFloodingLv1', targetLand)],
    pendingEffects: [
      { type: 'PUSH', targetLand, pieceTypes: ['explorers', 'towns'], remaining: 1, optional: true } as PendingEffect,
      ...state.pendingEffects,
    ],
  };
}

registerInnateEffect('massive-flooding', massiveFlooding);

// ── Thundering Destruction (Lightning's Swift Strike) ─────────

function thunderingDestruction(state: GameState, targetLand: string, level: number): GameState {
  const land = state.lands[targetLand];
  if (!land) return state;

  // Cumulative damage: Lv1 = 2, Lv2 = +1 (total 3), Lv3 = +2 (total 5)
  let damage = 2;
  if (level >= 1) damage += 1;
  if (level >= 2) damage += 2;

  const result = applyDamageToInvaders(state.lands[targetLand], damage);
  let newState: GameState = {
    ...state,
    lands: { ...state.lands, [targetLand]: result.land },
    log: [...state.log, logMsg('logThunderingDestruction', targetLand, damage)],
  };
  if (result.fear > 0) {
    newState = generateFear(newState, result.fear);
  }
  return newState;
}

registerInnateEffect('thundering-destruction', thunderingDestruction);
