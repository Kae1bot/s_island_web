import type { GameState } from '../models/game-state';
import { logMsg } from '../models/log-entry';

export function discardPlayedCards(state: GameState): GameState {
  const spirit = state.spirit;
  return {
    ...state,
    spirit: {
      ...spirit,
      discard: [...spirit.discard, ...spirit.playedThisTurn],
      playedThisTurn: [],
      elements: {},
    },
    log: [...state.log, logMsg('logDiscarded')],
  };
}

export function resetTurn(state: GameState): GameState {
  return {
    ...state,
    turn: state.turn + 1,
    phase: 'SPIRIT_PHASE',
    phaseStep: 'GROWTH_SELECTION',
    defenses: {},
    pendingEffects: [],
    resolvedPowerIds: [],
    log: [...state.log, logMsg('logNewTurn', state.turn + 1)],
  };
}
