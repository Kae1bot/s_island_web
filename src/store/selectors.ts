import type { GameState } from '../models/game-state';
import type { Land } from '../models/land';
import type { PowerCard } from '../models/power-card';
import { getPowerCard } from '../data/powers';
import { getSpiritDefinition } from '../data/spirits';
import { getCardPlayLimit, canPlayCard } from '../engine/spirit-phase';

export function selectLand(state: GameState, landId: string): Land | undefined {
  return state.lands[landId];
}

export function selectAllLands(state: GameState): Land[] {
  return Object.values(state.lands);
}

export function selectHandCards(state: GameState): PowerCard[] {
  return state.spirit.hand.map(getPowerCard);
}

export function selectPlayedCards(state: GameState): PowerCard[] {
  return state.spirit.playedThisTurn.map(getPowerCard);
}

export function selectEnergyPerTurn(state: GameState): number {
  const definition = getSpiritDefinition(state.spirit.definitionId);
  const track = definition.presenceTrack.energy;
  const idx = Math.min(state.spirit.revealedEnergyIndex, track.length - 1);
  return track[idx].value;
}

export function selectCardPlayLimit(state: GameState): number {
  return getCardPlayLimit(state);
}

export function selectPlayableCards(state: GameState): PowerCard[] {
  return state.spirit.hand
    .filter(id => canPlayCard(state, id))
    .map(getPowerCard);
}

export function selectTotalPresence(state: GameState): number {
  return Object.values(state.lands)
    .reduce((sum, l) => sum + l.pieces.presence, 0);
}

export function selectTotalInvaders(state: GameState): {
  explorers: number;
  towns: number;
  cities: number;
} {
  const lands = Object.values(state.lands);
  return {
    explorers: lands.reduce((s, l) => s + l.pieces.explorers, 0),
    towns: lands.reduce((s, l) => s + l.pieces.towns, 0),
    cities: lands.reduce((s, l) => s + l.pieces.cities, 0),
  };
}
