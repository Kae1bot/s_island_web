import type { GameState, PendingPresencePlacement } from '../models/game-state';
import type { SpiritState, PresenceTrack } from '../models/spirit';
import type { Land } from '../models/land';
import type { PowerCardId } from '../models/power-card';
import type { ElementMap } from '../models/elements';
import { sumElements } from '../models/elements';
import { getSpiritDefinition } from '../data/spirits';
import { getPowerCard } from '../data/powers';
import { logMsg, type LogEntry } from '../models/log-entry';

// ── Growth ──────────────────────────────────────────────────

export function selectGrowth(state: GameState, growthId: string): GameState {
  const definition = getSpiritDefinition(state.spirit.definitionId);
  const growthOption = definition.growthOptions.find(g => g.id === growthId);
  if (!growthOption) {
    throw new Error(`Invalid growth option: ${growthId}`);
  }

  let newState = { ...state };
  const log: LogEntry[] = [logMsg('logSelectedGrowth', growthId)];
  const pendingPlacements: PendingPresencePlacement[] = [];

  for (const action of growthOption.actions) {
    switch (action.type) {
      case 'reclaim_all': {
        const spirit = newState.spirit;
        newState = {
          ...newState,
          spirit: {
            ...spirit,
            hand: [...spirit.hand, ...spirit.discard],
            discard: [],
          },
        };
        log.push(logMsg('logReclaimAll'));
        break;
      }
      case 'gain_energy': {
        newState = {
          ...newState,
          spirit: {
            ...newState.spirit,
            energy: newState.spirit.energy + action.amount,
          },
        };
        log.push(logMsg('logGainEnergyGrowth', action.amount));
        break;
      }
      case 'gain_power_card': {
        newState = gainPowerCard(newState);
        log.push(logMsg('logGainPowerCard'));
        break;
      }
      case 'add_presence': {
        pendingPlacements.push({ range: action.range, terrain: action.terrain });
        log.push(logMsg('logAddPresence', action.range));
        break;
      }
      default:
        break;
    }
  }

  const hasPlacements = pendingPlacements.length > 0;

  newState = {
    ...newState,
    pendingPresencePlacements: pendingPlacements,
    phase: 'SPIRIT_PHASE',
    phaseStep: hasPlacements ? 'PLACE_PRESENCE' : 'GAIN_ENERGY',
    log: [...newState.log, ...log],
  };

  // If no placements needed, apply Reclaim One before moving to GAIN_ENERGY
  if (!hasPlacements) {
    newState = applyReclaimOne(newState);
  }

  return newState;
}

function gainPowerCard(state: GameState): GameState {
  const { powerProgression, powerProgressionIndex } = state;
  if (powerProgressionIndex >= powerProgression.length) {
    return state; // No more cards in progression
  }

  const cardId = powerProgression[powerProgressionIndex];
  return {
    ...state,
    spirit: {
      ...state.spirit,
      hand: [...state.spirit.hand, cardId],
    },
    powerProgressionIndex: powerProgressionIndex + 1,
  };
}

// ── Place Presence ──────────────────────────────────────────

export function placePresence(
  state: GameState,
  landId: string,
  track: PresenceTrack,
): GameState {
  const land = state.lands[landId];
  if (!land) {
    throw new Error(`Invalid land: ${landId}`);
  }

  const pending = state.pendingPresencePlacements;
  if (pending.length === 0) {
    throw new Error('No pending presence placements.');
  }

  const currentPlacement = pending[0];

  // Validate land is within range
  const validLands = getValidLandsForPlacement(state, currentPlacement.range);
  if (!validLands.includes(landId)) {
    throw new Error(`Land ${landId} is not within range ${currentPlacement.range}.`);
  }

  // Validate track has remaining presence
  if (!canRevealTrack(state, track)) {
    throw new Error(`No more presence to remove from ${track} track.`);
  }

  const spirit = state.spirit;
  const newSpirit: SpiritState = track === 'energy'
    ? { ...spirit, revealedEnergyIndex: spirit.revealedEnergyIndex + 1 }
    : { ...spirit, revealedCardPlayIndex: spirit.revealedCardPlayIndex + 1 };

  const newLand: Land = {
    ...land,
    pieces: { ...land.pieces, presence: land.pieces.presence + 1 },
  };

  const trackLabel = track === 'energy' ? 'energy' : 'cardPlay';
  const remainingPlacements = pending.slice(1);
  const isLastPlacement = remainingPlacements.length === 0;

  let newState: GameState = {
    ...state,
    spirit: newSpirit,
    lands: { ...state.lands, [landId]: newLand },
    pendingPresencePlacements: remainingPlacements,
    log: [...state.log, logMsg('logPlacedPresence', landId, trackLabel)],
  };

  // When all placements done, apply Reclaim One and advance to GAIN_ENERGY
  if (isLastPlacement) {
    newState = applyReclaimOne(newState);
    newState = {
      ...newState,
      phase: 'SPIRIT_PHASE',
      phaseStep: 'GAIN_ENERGY',
    };
  }

  return newState;
}

function canRevealTrack(state: GameState, track: PresenceTrack): boolean {
  const spirit = state.spirit;
  const definition = getSpiritDefinition(spirit.definitionId);
  if (track === 'energy') {
    return spirit.revealedEnergyIndex < definition.presenceTrack.energy.length - 1;
  }
  return spirit.revealedCardPlayIndex < definition.presenceTrack.cardPlay.length - 1;
}

export function getValidLandsForPlacement(state: GameState, range: number): string[] {
  const allLands = state.lands;
  const presenceLandIds = Object.keys(allLands).filter(id => allLands[id].pieces.presence > 0);

  const reachable = new Set<string>();

  for (const startId of presenceLandIds) {
    const visited = new Set<string>([startId]);
    let frontier = [startId];

    for (let d = 0; d <= range; d++) {
      for (const id of frontier) {
        reachable.add(id);
      }
      if (d < range) {
        const nextFrontier: string[] = [];
        for (const id of frontier) {
          for (const adj of allLands[id].adjacentLands) {
            const adjStr = adj as string;
            if (!visited.has(adjStr) && allLands[adjStr]) {
              visited.add(adjStr);
              nextFrontier.push(adjStr);
            }
          }
        }
        frontier = nextFrontier;
      }
    }
  }

  return Array.from(reachable);
}

export function canRevealEnergyTrack(state: GameState): boolean {
  return canRevealTrack(state, 'energy');
}

export function canRevealCardPlayTrack(state: GameState): boolean {
  return canRevealTrack(state, 'cardPlay');
}

// ── Reclaim One ─────────────────────────────────────────────

function hasReclaimOneRevealed(state: GameState): boolean {
  const definition = getSpiritDefinition(state.spirit.definitionId);
  const track = definition.presenceTrack.cardPlay;
  const revealed = state.spirit.revealedCardPlayIndex;
  return track.some(
    (slot, i) => i > 0 && i <= revealed && slot.special === 'reclaim_one',
  );
}

function applyReclaimOne(state: GameState): GameState {
  if (!hasReclaimOneRevealed(state)) return state;
  if (state.spirit.discard.length === 0) return state;

  // Auto-reclaim the last discarded card
  const discard = state.spirit.discard;
  const cardToReclaim = discard[discard.length - 1];

  return {
    ...state,
    spirit: {
      ...state.spirit,
      hand: [...state.spirit.hand, cardToReclaim],
      discard: discard.slice(0, -1),
    },
    log: [...state.log, logMsg('logReclaimOne', cardToReclaim as string)],
  };
}

// ── Gain Energy ─────────────────────────────────────────────

export function gainEnergy(state: GameState): GameState {
  const definition = getSpiritDefinition(state.spirit.definitionId);
  const track = definition.presenceTrack.energy;
  const revealedIndex = state.spirit.revealedEnergyIndex;

  // Energy per turn = value at the revealed index on the energy track
  const energyGain = track[Math.min(revealedIndex, track.length - 1)].value;

  return {
    ...state,
    spirit: {
      ...state.spirit,
      energy: state.spirit.energy + energyGain,
    },
    phase: 'SPIRIT_PHASE',
    phaseStep: 'PLAY_CARDS',
    log: [...state.log, logMsg('logGainedEnergy', energyGain, state.spirit.energy + energyGain)],
  };
}

// ── Play Cards ──────────────────────────────────────────────

export function getCardPlayLimit(state: GameState): number {
  const definition = getSpiritDefinition(state.spirit.definitionId);
  const track = definition.presenceTrack.cardPlay;
  const revealedIndex = state.spirit.revealedCardPlayIndex;
  return track[Math.min(revealedIndex, track.length - 1)].value;
}

export function canPlayCard(state: GameState, cardId: PowerCardId): boolean {
  const spirit = state.spirit;
  if (!spirit.hand.includes(cardId)) return false;

  const card = getPowerCard(cardId);
  if (spirit.energy < card.cost) return false;

  const limit = getCardPlayLimit(state);
  if (spirit.playedThisTurn.length >= limit) return false;

  return true;
}

export function playCard(state: GameState, cardId: PowerCardId): GameState {
  if (!canPlayCard(state, cardId)) {
    throw new Error(`Cannot play card: ${cardId}`);
  }

  const card = getPowerCard(cardId);
  const spirit = state.spirit;

  const newHand = spirit.hand.filter(id => id !== cardId);
  const newPlayed = [...spirit.playedThisTurn, cardId];

  const newElements = computeElements(newPlayed);

  return {
    ...state,
    spirit: {
      ...spirit,
      energy: spirit.energy - card.cost,
      hand: newHand,
      playedThisTurn: newPlayed,
      elements: newElements,
    },
    log: [...state.log, logMsg('logPlayedCard', cardId as string, card.cost)],
  };
}

export function unplayCard(state: GameState, cardId: PowerCardId): GameState {
  const spirit = state.spirit;
  if (!spirit.playedThisTurn.includes(cardId)) {
    throw new Error(`Card not in played pile: ${cardId}`);
  }

  const card = getPowerCard(cardId);
  const newPlayed = spirit.playedThisTurn.filter(id => id !== cardId);
  const newElements = computeElements(newPlayed);

  return {
    ...state,
    spirit: {
      ...spirit,
      energy: spirit.energy + card.cost,
      hand: [...spirit.hand, cardId],
      playedThisTurn: newPlayed,
      elements: newElements,
    },
    log: [...state.log, logMsg('logReturnedCard', cardId as string, card.cost)],
  };
}

function computeElements(playedCards: readonly PowerCardId[]): ElementMap {
  const maps: ElementMap[] = playedCards.map(id => {
    const card = getPowerCard(id);
    const map: Partial<Record<string, number>> = {};
    for (const el of card.elements) {
      map[el] = (map[el] ?? 0) + 1;
    }
    return map as ElementMap;
  });
  return sumElements(...maps);
}

export function confirmCardPlays(state: GameState): GameState {
  return {
    ...state,
    phase: 'FAST_POWERS',
    phaseStep: 'RESOLVE_FEAR_CARDS',
    log: [...state.log, logMsg('logCardPlayComplete', state.spirit.playedThisTurn.length)],
  };
}
