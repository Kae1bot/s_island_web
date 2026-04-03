import { describe, it, expect } from 'vitest';
import { initializeGame } from '../../engine/init';
import { checkVictoryDefeat } from '../../engine/victory';

describe('victory', () => {
  it('returns playing when game is ongoing', () => {
    const state = initializeGame(undefined, 42);
    const result = checkVictoryDefeat(state);
    expect(result.gameResult).toBe('playing');
  });

  it('detects defeat when blight is exhausted and card flipped', () => {
    let state = initializeGame(undefined, 42);
    state = {
      ...state,
      blight: { remaining: 0, isCardFlipped: true },
    };
    const result = checkVictoryDefeat(state);
    expect(result.gameResult).toBe('defeat');
    expect(result.defeatReason).toBe('logDefeatBlight');
  });

  it('does not defeat when blight exhausted but card not flipped', () => {
    let state = initializeGame(undefined, 42);
    state = {
      ...state,
      blight: { remaining: 0, isCardFlipped: false },
    };
    const result = checkVictoryDefeat(state);
    expect(result.gameResult).toBe('playing');
  });

  it('detects defeat when no presence on board', () => {
    let state = initializeGame(undefined, 42);
    // Remove all presence
    const cleanLands = { ...state.lands };
    for (const [id, land] of Object.entries(cleanLands)) {
      cleanLands[id] = { ...land, pieces: { ...land.pieces, presence: 0 } };
    }
    state = { ...state, lands: cleanLands };
    const result = checkVictoryDefeat(state);
    expect(result.gameResult).toBe('defeat');
    expect(result.defeatReason).toBe('logDefeatPresence');
  });

  it('detects victory at terror level 2 with no towns or cities', () => {
    let state = initializeGame(undefined, 42);
    // Set terror level 2
    state = {
      ...state,
      fear: { ...state.fear, terrorLevel: 2 },
    };
    // Remove all towns and cities
    const cleanLands = { ...state.lands };
    for (const [id, land] of Object.entries(cleanLands)) {
      cleanLands[id] = {
        ...land,
        pieces: { ...land.pieces, towns: 0, cities: 0 },
      };
    }
    state = { ...state, lands: cleanLands };

    const result = checkVictoryDefeat(state);
    expect(result.gameResult).toBe('victory');
  });

  it('detects victory at terror level 3 with no invaders', () => {
    let state = initializeGame(undefined, 42);
    state = {
      ...state,
      fear: { ...state.fear, terrorLevel: 3 },
    };
    // Remove all invaders
    const cleanLands = { ...state.lands };
    for (const [id, land] of Object.entries(cleanLands)) {
      cleanLands[id] = {
        ...land,
        pieces: { ...land.pieces, explorers: 0, towns: 0, cities: 0 },
      };
    }
    state = { ...state, lands: cleanLands };

    const result = checkVictoryDefeat(state);
    expect(result.gameResult).toBe('victory');
  });

  it('detects victory when fear deck is empty', () => {
    let state = initializeGame(undefined, 42);
    state = {
      ...state,
      fear: { ...state.fear, fearDeck: [], earnedCards: [] },
    };
    const result = checkVictoryDefeat(state);
    expect(result.gameResult).toBe('victory');
    expect(result.defeatReason).toBe('logVictoryFearDeck');
  });
});
