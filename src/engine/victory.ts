import type { GameState, GameResult } from '../models/game-state';
import type { Land } from '../models/land';
import { logMsg } from '../models/log-entry';

interface VictoryCheck {
  readonly result: GameResult;
  readonly reasonKey?: string;
}

export function checkVictoryDefeat(state: GameState): GameState {
  const check = evaluateConditions(state);

  if (check.result === 'playing') {
    return state;
  }

  const logKey = check.reasonKey ?? (check.result === 'victory' ? 'logVictory' : 'logDefeat');

  return {
    ...state,
    gameResult: check.result,
    defeatReason: check.reasonKey,
    log: [...state.log, logMsg(logKey)],
  };
}

function evaluateConditions(state: GameState): VictoryCheck {
  // ── Defeat conditions (checked first) ──

  // Blight pool exhausted
  if (state.blight.remaining <= 0 && state.blight.isCardFlipped) {
    return { result: 'defeat', reasonKey: 'logDefeatBlight' };
  }

  // No presence on the board
  const totalPresence = Object.values(state.lands)
    .reduce((sum, land) => sum + land.pieces.presence, 0);
  if (totalPresence === 0) {
    return { result: 'defeat', reasonKey: 'logDefeatPresence' };
  }

  // Invader deck exhausted (checked at end of explore)
  // This is handled during the explore step

  // ── Victory conditions ──

  const lands = Object.values(state.lands);
  const terrorLevel = state.fear.terrorLevel;

  if (terrorLevel >= 3 && noInvaders(lands)) {
    return { result: 'victory', reasonKey: 'logVictoryTerror3' };
  }

  if (terrorLevel >= 2 && noCitiesOrTowns(lands)) {
    return { result: 'victory', reasonKey: 'logVictoryTerror2' };
  }

  if (terrorLevel >= 1 && noCities(lands) && noInvaders(lands)) {
    // Terror Level 1: no invaders at all
    return { result: 'victory', reasonKey: 'logVictoryTerror1' };
  }

  // Special: fear deck empty = instant victory
  if (state.fear.fearDeck.length === 0 && state.fear.earnedCards.length === 0) {
    return { result: 'victory', reasonKey: 'logVictoryFearDeck' };
  }

  return { result: 'playing' };
}

function noInvaders(lands: readonly Land[]): boolean {
  return lands.every(l =>
    l.pieces.explorers === 0 &&
    l.pieces.towns === 0 &&
    l.pieces.cities === 0,
  );
}

function noCitiesOrTowns(lands: readonly Land[]): boolean {
  return lands.every(l =>
    l.pieces.towns === 0 &&
    l.pieces.cities === 0,
  );
}

function noCities(lands: readonly Land[]): boolean {
  return lands.every(l => l.pieces.cities === 0);
}
