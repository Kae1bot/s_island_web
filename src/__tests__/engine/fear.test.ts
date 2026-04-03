import { describe, it, expect } from 'vitest';
import { initializeGame } from '../../engine/init';
import { generateFear, resolveFearCards } from '../../engine/fear';

describe('fear', () => {
  describe('generateFear', () => {
    it('adds fear to the pool', () => {
      const state = initializeGame(undefined, 42);
      const result = generateFear(state, 2);
      expect(result.fear.generatedFear).toBe(2);
    });

    it('earns a fear card when pool fills up', () => {
      const state = initializeGame(undefined, 42);
      // fearPerCard is 4, so generating 4 fear earns 1 card
      const result = generateFear(state, 4);
      expect(result.fear.earnedCards).toHaveLength(1);
      expect(result.fear.generatedFear).toBe(0); // reset after earning
    });

    it('earns multiple fear cards at once', () => {
      const state = initializeGame(undefined, 42);
      const result = generateFear(state, 8);
      expect(result.fear.earnedCards).toHaveLength(2);
    });

    it('advances terror level after earning enough cards', () => {
      let state = initializeGame(undefined, 42);
      // Earn 3 cards to reach terror level 2 (3 cards per level)
      state = generateFear(state, 12); // 3 cards
      expect(state.fear.terrorLevel).toBe(2);
    });

    it('does not exceed terror level 3', () => {
      let state = initializeGame(undefined, 42);
      // Earn many cards
      state = generateFear(state, 40);
      expect(state.fear.terrorLevel).toBeLessThanOrEqual(3);
    });
  });

  describe('resolveFearCards', () => {
    it('does nothing when no earned cards', () => {
      const state = initializeGame(undefined, 42);
      const result = resolveFearCards(state);
      expect(result.fear.discardedFearCards).toHaveLength(0);
    });

    it('resolves earned cards and moves to discard', () => {
      let state = initializeGame(undefined, 42);
      state = generateFear(state, 4); // earn 1 card
      expect(state.fear.earnedCards).toHaveLength(1);

      const result = resolveFearCards(state);
      expect(result.fear.earnedCards).toHaveLength(0);
      expect(result.fear.discardedFearCards).toHaveLength(1);
    });
  });
});
