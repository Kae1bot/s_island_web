import { describe, it, expect } from 'vitest';
import { initializeGame } from '../../engine/init';

describe('initializeGame', () => {
  it('creates a valid initial game state', () => {
    const state = initializeGame(undefined, 42);

    expect(state.turn).toBe(1);
    expect(state.phase).toBe('SPIRIT_PHASE');
    expect(state.phaseStep).toBe('GROWTH_SELECTION');
    expect(state.gameResult).toBe('playing');
  });

  it('sets up River Surges spirit with 4 starting cards', () => {
    const state = initializeGame(undefined, 42);

    expect(state.spirit.hand).toHaveLength(4);
    expect(state.spirit.energy).toBe(0);
    expect(state.spirit.playedThisTurn).toHaveLength(0);
    expect(state.spirit.discard).toHaveLength(0);
  });

  it('places presence on highest-numbered wetland (D3)', () => {
    const state = initializeGame(undefined, 42);

    // D3 is the highest-numbered wetland on Board D
    expect(state.lands['D3'].pieces.presence).toBe(1);

    // Other lands should not have presence
    expect(state.lands['D1'].pieces.presence).toBe(0);
    expect(state.lands['D4'].pieces.presence).toBe(0);
  });

  it('sets up Board D with 8 lands and correct terrain', () => {
    const state = initializeGame(undefined, 42);

    const lands = Object.values(state.lands);
    expect(lands).toHaveLength(8);

    // Board D has 2 of each terrain
    const terrainCounts = { jungle: 0, wetland: 0, sand: 0, mountain: 0 };
    for (const land of lands) {
      terrainCounts[land.terrain]++;
    }
    expect(terrainCounts).toEqual({ jungle: 2, wetland: 2, sand: 2, mountain: 2 });
  });

  it('sets up initial pieces on the board', () => {
    const state = initializeGame(undefined, 42);

    // D1: 2 Dahan
    expect(state.lands['D1'].pieces.dahan).toBe(2);
    // D2: 1 City, 1 Dahan
    expect(state.lands['D2'].pieces.cities).toBe(1);
    expect(state.lands['D2'].pieces.dahan).toBe(1);
    // D7: 1 Town, 2 Dahan
    expect(state.lands['D7'].pieces.towns).toBe(1);
    expect(state.lands['D7'].pieces.dahan).toBe(2);
    // D5: 1 Blight
    expect(state.lands['D5'].pieces.blight).toBe(1);
  });

  it('creates invader deck with first card in explore slot', () => {
    const state = initializeGame(undefined, 42);

    expect(state.invaders.explore).not.toBeNull();
    expect(state.invaders.build).toBeNull();
    expect(state.invaders.ravage).toBeNull();
    expect(state.invaders.deck.length).toBeGreaterThan(0);
  });

  it('initializes fear system', () => {
    const state = initializeGame(undefined, 42);

    expect(state.fear.generatedFear).toBe(0);
    expect(state.fear.fearPerCard).toBe(4);
    expect(state.fear.terrorLevel).toBe(1);
    expect(state.fear.fearDeck.length).toBeGreaterThan(0);
  });

  it('initializes blight pool', () => {
    const state = initializeGame(undefined, 42);

    expect(state.blight.remaining).toBe(5);
    expect(state.blight.isCardFlipped).toBe(false);
  });

  it('sets up power progression', () => {
    const state = initializeGame(undefined, 42);

    expect(state.powerProgression).toHaveLength(7);
    expect(state.powerProgressionIndex).toBe(0);
  });

  it('produces deterministic state with same seed', () => {
    const state1 = initializeGame(undefined, 42);
    const state2 = initializeGame(undefined, 42);

    expect(state1.invaders.explore?.id).toBe(state2.invaders.explore?.id);
    expect(state1.invaders.deck).toEqual(state2.invaders.deck);
  });

  it('produces different state with different seeds', () => {
    const state1 = initializeGame(undefined, 42);
    const state2 = initializeGame(undefined, 99);

    // Invader deck order should differ (with very high probability)
    const deck1Ids = state1.invaders.deck.map(c => c.id).join(',');
    const deck2Ids = state2.invaders.deck.map(c => c.id).join(',');
    expect(deck1Ids).not.toBe(deck2Ids);
  });
});
