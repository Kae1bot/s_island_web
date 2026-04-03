import type { GameState } from '../models/game-state';
import type { PendingEffect } from '../models/targeting';
import type { PowerCardId } from '../models/power-card';
import { getPowerCard } from '../data/powers';
import { meetsThreshold } from '../models/elements';
import { logMsg } from '../models/log-entry';
import { generateFear } from './fear';
import { applyDamageToInvaders } from './invader-phase';

// ── Registry types ────────────────────────────────────────────

export interface CardEffectHandler {
  /** Build sub-effects after target is chosen (before APPLY_CARD_EFFECT). */
  readonly buildEffects?: (state: GameState, targetLand: string) => PendingEffect[];
  /** Apply the card's main effect. */
  readonly applyEffect: (state: GameState, targetLand: string) => GameState;
}

const CARD_HANDLERS = new Map<string, CardEffectHandler>();

export function registerCardEffect(cardId: string, handler: CardEffectHandler): void {
  CARD_HANDLERS.set(cardId, handler);
}

export function buildCardSubEffects(
  state: GameState,
  cardId: string,
  targetLand: string,
): PendingEffect[] {
  const handler = CARD_HANDLERS.get(cardId);
  if (handler?.buildEffects) {
    return handler.buildEffects(state, targetLand);
  }
  // Default: just apply the card effect
  return [{ type: 'APPLY_CARD_EFFECT', cardId: cardId as PowerCardId, targetLand }];
}

export function applyCardSubEffect(
  state: GameState,
  cardId: string,
  targetLand: string,
): GameState {
  const handler = CARD_HANDLERS.get(cardId);
  if (handler) {
    return handler.applyEffect(state, targetLand);
  }
  return { ...state, log: [...state.log, logMsg('logNotImplemented', cardId)] };
}

// ── Helper ────────────────────────────────────────────────────

function removeBlight(state: GameState, landId: string): GameState {
  const land = state.lands[landId];
  if (!land || land.pieces.blight <= 0) return state;
  return {
    ...state,
    lands: {
      ...state.lands,
      [landId]: { ...land, pieces: { ...land.pieces, blight: land.pieces.blight - 1 } },
    },
    blight: { ...state.blight, remaining: state.blight.remaining + 1 },
  };
}

// ── River Surges unique cards ─────────────────────────────────

registerCardEffect('boon-of-vigor', {
  applyEffect(state, _targetLand) {
    return {
      ...state,
      spirit: { ...state.spirit, energy: state.spirit.energy + 1 },
      log: [...state.log, logMsg('logBoonOfVigor')],
    };
  },
});

registerCardEffect('flash-floods', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return { ...state, log: [...state.log, logMsg('logNoValidTarget', 'flash-floods')] };
    const damage = land.coastal ? 2 : 1;
    const result = applyDamageToInvaders(land, damage);
    let newState: GameState = {
      ...state,
      lands: { ...state.lands, [targetLand]: result.land },
      log: [...state.log, logMsg('logDamageInLand', 'flash-floods', damage, targetLand)],
    };
    if (result.fear > 0) {
      newState = generateFear(newState, result.fear);
    }
    return newState;
  },
});

registerCardEffect('rivers-bounty', {
  buildEffects(_state, targetLand) {
    return [
      { type: 'GATHER', targetLand, pieceTypes: ['dahan'], remaining: 2, optional: true },
      { type: 'APPLY_CARD_EFFECT', cardId: 'rivers-bounty' as PowerCardId, targetLand },
    ];
  },
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    const currentDahan = state.lands[targetLand].pieces.dahan;
    if (currentDahan >= 2) {
      const updatedLand = {
        ...state.lands[targetLand],
        pieces: { ...state.lands[targetLand].pieces, dahan: currentDahan + 1 },
      };
      return {
        ...state,
        spirit: { ...state.spirit, energy: state.spirit.energy + 1 },
        lands: { ...state.lands, [targetLand]: updatedLand },
        log: [...state.log, logMsg('logRiversBountySuccess', targetLand)],
      };
    }
    return { ...state, log: [...state.log, logMsg('logRiversBountyFail', targetLand)] };
  },
});

registerCardEffect('wash-away', {
  buildEffects(_state, targetLand) {
    return [{ type: 'PUSH', targetLand, pieceTypes: ['explorers', 'towns'], remaining: 3, optional: true }];
  },
  applyEffect(state) {
    return state; // All work done via PUSH
  },
});

// ── Minor powers ──────────────────────────────────────────────

registerCardEffect('uncanny-melting', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    let newState = state;
    const hasInvaders = land.pieces.explorers > 0 || land.pieces.towns > 0 || land.pieces.cities > 0;
    if (hasInvaders) {
      newState = generateFear(newState, 1);
      newState = { ...newState, log: [...newState.log, logMsg('logUncannyFear', targetLand)] };
    }
    if ((land.terrain === 'sand' || land.terrain === 'wetland') && land.pieces.blight > 0) {
      newState = removeBlight(newState, targetLand);
      newState = { ...newState, log: [...newState.log, logMsg('logRemovedBlight', 'uncanny-melting', targetLand)] };
    }
    return newState;
  },
});

registerCardEffect('natures-resilience', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    const elements = state.spirit.elements;
    const hasThreshold = meetsThreshold(elements, { water: 2 });
    if (hasThreshold && land.pieces.blight > 0) {
      let newState = removeBlight(state, targetLand);
      return { ...newState, log: [...newState.log, logMsg('logRemovedBlight', 'natures-resilience', targetLand)] };
    }
    const currentDefense = state.defenses[targetLand] ?? 0;
    return {
      ...state,
      defenses: { ...state.defenses, [targetLand]: currentDefense + 6 },
      log: [...state.log, logMsg('logDefendInLand', 'natures-resilience', 6, targetLand)],
    };
  },
});

registerCardEffect('pull-beneath-the-hungry-earth', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    let newState = state;
    if (land.pieces.presence > 0) {
      newState = generateFear(newState, 1);
      const baseDamage = (land.terrain === 'sand' || land.terrain === 'wetland') ? 2 : 1;
      const result = applyDamageToInvaders(newState.lands[targetLand], baseDamage);
      newState = {
        ...newState,
        lands: { ...newState.lands, [targetLand]: result.land },
        log: [...newState.log, logMsg('logFearAndDamage', 'pull-beneath-the-hungry-earth', 1, baseDamage, targetLand)],
      };
      if (result.fear > 0) {
        newState = generateFear(newState, result.fear);
      }
    } else {
      newState = { ...newState, log: [...newState.log, logMsg('logNoPresence', 'pull-beneath-the-hungry-earth', targetLand)] };
    }
    return newState;
  },
});

registerCardEffect('song-of-sanctity', {
  buildEffects(state, targetLand) {
    const land = state.lands[targetLand];
    if (land && land.pieces.explorers > 0) {
      return [{ type: 'PUSH', targetLand, pieceTypes: ['explorers'], remaining: land.pieces.explorers, optional: false }];
    }
    return [{ type: 'APPLY_CARD_EFFECT', cardId: 'song-of-sanctity' as PowerCardId, targetLand }];
  },
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    if (land.pieces.blight > 0) {
      let newState = removeBlight(state, targetLand);
      return { ...newState, log: [...newState.log, logMsg('logRemovedBlight', 'song-of-sanctity', targetLand)] };
    }
    return { ...state, log: [...state.log, logMsg('logNoBlight', 'song-of-sanctity', targetLand)] };
  },
});

registerCardEffect('encompassing-ward', {
  applyEffect(state, _targetLand) {
    const presenceLands = Object.keys(state.lands).filter(
      id => state.lands[id].pieces.presence > 0,
    );
    const newDefenses = { ...state.defenses };
    for (const lid of presenceLands) {
      newDefenses[lid] = (newDefenses[lid] ?? 0) + 2;
    }
    return {
      ...state,
      defenses: newDefenses,
      log: [...state.log, logMsg('logDefendInLand', 'encompassing-ward', 2, presenceLands.length)],
    };
  },
});

// ── Major powers ──────────────────────────────────────────────

registerCardEffect('accelerated-rot', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    const elements = state.spirit.elements;
    const card = getPowerCard('accelerated-rot' as PowerCardId);
    const hasThreshold = card.threshold && meetsThreshold(elements, card.threshold.condition);
    const damage = hasThreshold ? 5 : 4;
    let newState = generateFear(state, 2);
    const result = applyDamageToInvaders(newState.lands[targetLand], damage);
    newState = {
      ...newState,
      lands: { ...newState.lands, [targetLand]: result.land },
      log: [...newState.log, logMsg('logFearAndDamage', 'accelerated-rot', 2, damage, targetLand)],
    };
    if (result.fear > 0) {
      newState = generateFear(newState, result.fear);
    }
    if (hasThreshold && newState.lands[targetLand].pieces.blight > 0) {
      newState = removeBlight(newState, targetLand);
      newState = { ...newState, log: [...newState.log, logMsg('logRemovedBlight', 'accelerated-rot', targetLand)] };
    }
    return newState;
  },
});

registerCardEffect('tsunami', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    const elements = state.spirit.elements;
    const card = getPowerCard('tsunami' as PowerCardId);
    const hasThreshold = card.threshold && meetsThreshold(elements, card.threshold.condition);

    let newState = generateFear(state, 2);
    const result = applyDamageToInvaders(newState.lands[targetLand], 8);
    newState = {
      ...newState,
      lands: { ...newState.lands, [targetLand]: result.land },
    };
    if (result.fear > 0) {
      newState = generateFear(newState, result.fear);
    }
    const dahanToDestroy = Math.min(2, newState.lands[targetLand].pieces.dahan);
    if (dahanToDestroy > 0) {
      const updatedLand = {
        ...newState.lands[targetLand],
        pieces: { ...newState.lands[targetLand].pieces, dahan: newState.lands[targetLand].pieces.dahan - dahanToDestroy },
      };
      newState = { ...newState, lands: { ...newState.lands, [targetLand]: updatedLand } };
    }
    newState = { ...newState, log: [...newState.log, logMsg('logTsunami', targetLand, dahanToDestroy)] };

    if (hasThreshold) {
      const board = land.board;
      const otherCoastal = Object.values(newState.lands).filter(
        l => l.id !== land.id && l.coastal && l.board === board,
      );
      for (const cl of otherCoastal) {
        const cid = cl.id as string;
        newState = generateFear(newState, 1);
        const cResult = applyDamageToInvaders(newState.lands[cid], 4);
        newState = {
          ...newState,
          lands: { ...newState.lands, [cid]: cResult.land },
        };
        if (cResult.fear > 0) {
          newState = generateFear(newState, cResult.fear);
        }
        const cDahan = Math.min(1, newState.lands[cid].pieces.dahan);
        if (cDahan > 0) {
          const cLand = {
            ...newState.lands[cid],
            pieces: { ...newState.lands[cid].pieces, dahan: newState.lands[cid].pieces.dahan - 1 },
          };
          newState = { ...newState, lands: { ...newState.lands, [cid]: cLand } };
        }
        newState = { ...newState, log: [...newState.log, logMsg('logTsunamiThreshold', cid)] };
      }
    }
    return newState;
  },
});

// ── Lightning's Swift Strike unique cards ─────────────────────

registerCardEffect('lightnings-bolt', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    const result = applyDamageToInvaders(land, 1);
    let newState: GameState = {
      ...state,
      lands: { ...state.lands, [targetLand]: result.land },
      log: [...state.log, logMsg('logDamageInLand', 'lightnings-bolt', 1, targetLand)],
    };
    if (result.fear > 0) {
      newState = generateFear(newState, result.fear);
    }
    return newState;
  },
});

registerCardEffect('harbingers-of-the-lightning', {
  buildEffects(_state, targetLand) {
    return [{ type: 'PUSH', targetLand, pieceTypes: ['dahan'], remaining: 2, optional: true }];
  },
  applyEffect(state) {
    return state; // All work done via PUSH
  },
});

registerCardEffect('shatter-homesteads', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    let newState = generateFear(state, 1);
    if (land.pieces.towns > 0) {
      const updatedLand = {
        ...newState.lands[targetLand],
        pieces: { ...newState.lands[targetLand].pieces, towns: newState.lands[targetLand].pieces.towns - 1 },
      };
      newState = {
        ...newState,
        lands: { ...newState.lands, [targetLand]: updatedLand },
        log: [...newState.log, logMsg('logShatterHomesteads', targetLand)],
      };
      // Destroying a town generates 1 additional fear
      newState = generateFear(newState, 1);
    } else {
      newState = { ...newState, log: [...newState.log, logMsg('logShatterNoTown', targetLand)] };
    }
    return newState;
  },
});

registerCardEffect('raging-storm', {
  applyEffect(state, targetLand) {
    const land = state.lands[targetLand];
    if (!land) return state;
    const pieces = land.pieces;
    const totalInvaders = pieces.explorers + pieces.towns + pieces.cities;
    if (totalInvaders === 0) {
      return { ...state, log: [...state.log, logMsg('logNoValidTarget', 'raging-storm')] };
    }
    // 1 damage to each invader
    let newPieces = { ...pieces };
    let fear = 0;
    // Explorers: 1HP, 1 damage → destroyed
    const destroyedExplorers = newPieces.explorers;
    newPieces = { ...newPieces, explorers: 0 };
    // Towns: 2HP, 1 damage → survives (health tracking not modeled, so no destruction)
    // Cities: 3HP, 1 damage → survives
    let newState: GameState = {
      ...state,
      lands: { ...state.lands, [targetLand]: { ...land, pieces: newPieces } },
      log: [...state.log, logMsg('logRagingStorm', targetLand, destroyedExplorers)],
    };
    if (fear > 0) {
      newState = generateFear(newState, fear);
    }
    return newState;
  },
});
