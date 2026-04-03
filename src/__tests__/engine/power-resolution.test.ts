import { describe, it, expect } from 'vitest';
import { initializeGame } from '../../engine/init';
import {
  getUnresolvedPowers,
  beginResolvePower,
} from '../../engine/power-resolution';
import { applyCardEffect } from '../../engine/effects';
import { powerCardId } from '../../models/power-card';

describe('power-resolution', () => {
  describe('getUnresolvedPowers', () => {
    it('returns empty when no cards played', () => {
      const state = initializeGame(undefined, 42);
      expect(getUnresolvedPowers(state, 'fast')).toHaveLength(0);
      expect(getUnresolvedPowers(state, 'slow')).toHaveLength(0);
    });

    it('returns played fast cards', () => {
      let state = initializeGame(undefined, 42);
      // Directly set playedThisTurn to bypass card play limit
      state = {
        ...state,
        spirit: {
          ...state.spirit,
          energy: 10,
          playedThisTurn: [powerCardId('boon-of-vigor'), powerCardId('flash-floods')],
          hand: [],
        },
      };

      const fast = getUnresolvedPowers(state, 'fast');
      expect(fast).toHaveLength(2);
      expect(fast.map(p => p.id)).toContain('boon-of-vigor');
      expect(fast.map(p => p.id)).toContain('flash-floods');
      expect(fast.every(p => p.source === 'card')).toBe(true);
    });

    it('excludes already-resolved powers', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        spirit: {
          ...state.spirit,
          energy: 10,
          playedThisTurn: [powerCardId('boon-of-vigor'), powerCardId('flash-floods')],
          hand: [],
        },
        resolvedPowerIds: ['boon-of-vigor'],
      };

      const fast = getUnresolvedPowers(state, 'fast');
      expect(fast).toHaveLength(1);
      expect(fast[0].id).toBe('flash-floods');
    });

    it('includes innate when threshold met', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        spirit: { ...state.spirit, elements: { sun: 1, water: 2 } },
      };
      const slow = getUnresolvedPowers(state, 'slow');
      expect(slow.some(p => p.id === 'massive-flooding' && p.source === 'innate')).toBe(true);
    });

    it('excludes innate when threshold not met', () => {
      const state = initializeGame(undefined, 42);
      const slow = getUnresolvedPowers(state, 'slow');
      expect(slow.some(p => p.id === 'massive-flooding')).toBe(false);
    });
  });

  describe('beginResolvePower', () => {
    function withPlayed(state: ReturnType<typeof initializeGame>, cardId: string) {
      return {
        ...state,
        spirit: {
          ...state.spirit,
          playedThisTurn: [...state.spirit.playedThisTurn, powerCardId(cardId)],
          hand: state.spirit.hand.filter(id => (id as string) !== cardId),
        },
      };
    }

    it('queues APPLY_CARD_EFFECT for spirit-target card', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 5 } };
      state = withPlayed(state, 'boon-of-vigor');

      const result = beginResolvePower(state, 'boon-of-vigor');
      expect(result.pendingEffects).toHaveLength(1);
      expect(result.pendingEffects[0].type).toBe('APPLY_CARD_EFFECT');
      expect(result.resolvedPowerIds).toContain('boon-of-vigor');
    });

    it('applying Boon of Vigor grants +1 energy', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 5 } };
      state = withPlayed(state, 'boon-of-vigor');
      state = beginResolvePower(state, 'boon-of-vigor');

      const resolved = applyCardEffect(state);
      expect(resolved.spirit.energy).toBe(6);
      expect(resolved.pendingEffects).toHaveLength(0);
    });

    it('queues SELECT_TARGET for land-target card', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 10 } };
      state = {
        ...state,
        lands: {
          ...state.lands,
          D3: { ...state.lands['D3'], pieces: { ...state.lands['D3'].pieces, presence: 1 } },
        },
      };
      state = withPlayed(state, 'flash-floods');

      const result = beginResolvePower(state, 'flash-floods');
      expect(result.pendingEffects).toHaveLength(1);
      expect(result.pendingEffects[0].type).toBe('SELECT_TARGET');
      expect(result.resolvedPowerIds).toContain('flash-floods');
    });

    it('queues SELECT_TARGET for innate when threshold met', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        spirit: { ...state.spirit, elements: { sun: 1, water: 2 } },
        lands: {
          ...state.lands,
          D3: { ...state.lands['D3'], pieces: { ...state.lands['D3'].pieces, presence: 1 } },
        },
      };

      const result = beginResolvePower(state, 'massive-flooding');
      expect(result.pendingEffects).toHaveLength(1);
      expect(result.pendingEffects[0].type).toBe('SELECT_TARGET');
      expect(result.resolvedPowerIds).toContain('massive-flooding');
      expect(result.log.some(l => l.key === 'logInnateThresholdMet' && l.params?.[1] === 1)).toBe(true);
    });

    it('reports highest matching innate level', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        spirit: { ...state.spirit, elements: { sun: 3, water: 4, earth: 1 } },
        lands: {
          ...state.lands,
          D3: { ...state.lands['D3'], pieces: { ...state.lands['D3'].pieces, presence: 1 } },
        },
      };

      const result = beginResolvePower(state, 'massive-flooding');
      expect(result.log.some(l => l.key === 'logInnateThresholdMet' && l.params?.[1] === 3)).toBe(true);
    });
  });
});
