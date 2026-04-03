import { describe, it, expect } from 'vitest';
import { initializeGame } from '../../engine/init';
import {
  selectGrowth,
  gainEnergy,
  playCard,
  canPlayCard,
  getCardPlayLimit,
  confirmCardPlays,
  placePresence,
  getValidLandsForPlacement,
} from '../../engine/spirit-phase';
import { powerCardId } from '../../models/power-card';
import type { GameState, PendingPresencePlacement } from '../../models/game-state';

describe('spirit-phase', () => {
  describe('selectGrowth', () => {
    it('growth-1: reclaim cards + gain power card + gain 1 energy (no placement)', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        spirit: {
          ...state.spirit,
          hand: state.spirit.hand.slice(0, 2),
          discard: state.spirit.hand.slice(2),
        },
      };
      const before = state.spirit.hand.length;
      const energyBefore = state.spirit.energy;
      state = selectGrowth(state, 'growth-1');

      expect(state.spirit.discard).toHaveLength(0);
      expect(state.spirit.hand.length).toBeGreaterThan(before);
      expect(state.spirit.energy).toBe(energyBefore + 1);
      // No add_presence actions → skip PLACE_PRESENCE, go to GAIN_ENERGY
      expect(state.phaseStep).toBe('GAIN_ENERGY');
      expect(state.pendingPresencePlacements).toHaveLength(0);
    });

    it('growth-2: creates 2 pending presence placements (range 1)', () => {
      let state = initializeGame(undefined, 42);
      state = selectGrowth(state, 'growth-2');

      expect(state.phaseStep).toBe('PLACE_PRESENCE');
      expect(state.pendingPresencePlacements).toHaveLength(2);
      expect(state.pendingPresencePlacements[0].range).toBe(1);
      expect(state.pendingPresencePlacements[1].range).toBe(1);
    });

    it('growth-3: gain power card + 1 pending presence placement (range 2)', () => {
      let state = initializeGame(undefined, 42);
      const handBefore = state.spirit.hand.length;
      state = selectGrowth(state, 'growth-3');

      expect(state.spirit.hand.length).toBe(handBefore + 1);
      expect(state.powerProgressionIndex).toBe(1);
      expect(state.phaseStep).toBe('PLACE_PRESENCE');
      expect(state.pendingPresencePlacements).toHaveLength(1);
      expect(state.pendingPresencePlacements[0].range).toBe(2);
    });

    it('throws on invalid growth option', () => {
      const state = initializeGame(undefined, 42);
      expect(() => selectGrowth(state, 'invalid')).toThrow();
    });
  });

  describe('placePresence', () => {
    function stateWithPending(range: number, count = 1): GameState {
      const state = initializeGame(undefined, 42);
      const placements: PendingPresencePlacement[] = Array.from({ length: count }, () => ({ range }));
      return {
        ...state,
        phaseStep: 'PLACE_PRESENCE' as const,
        pendingPresencePlacements: placements,
      };
    }

    it('adds presence to target land from energy track', () => {
      const state = stateWithPending(1);
      // D3 has presence, D2 is adjacent (range 1)
      const result = placePresence(state, 'D2', 'energy');
      expect(result.lands['D2'].pieces.presence).toBe(1);
      expect(result.spirit.revealedEnergyIndex).toBe(1);
      expect(result.spirit.revealedCardPlayIndex).toBe(0);
    });

    it('adds presence to target land from cardPlay track', () => {
      const state = stateWithPending(1);
      const result = placePresence(state, 'D2', 'cardPlay');
      expect(result.lands['D2'].pieces.presence).toBe(1);
      expect(result.spirit.revealedCardPlayIndex).toBe(1);
      expect(result.spirit.revealedEnergyIndex).toBe(0);
    });

    it('advances to GAIN_ENERGY when last placement is done', () => {
      const state = stateWithPending(1, 1);
      const result = placePresence(state, 'D2', 'energy');
      expect(result.phaseStep).toBe('GAIN_ENERGY');
      expect(result.pendingPresencePlacements).toHaveLength(0);
    });

    it('stays in PLACE_PRESENCE when more placements remain', () => {
      const state = stateWithPending(1, 2);
      const result = placePresence(state, 'D2', 'energy');
      expect(result.phaseStep).toBe('PLACE_PRESENCE');
      expect(result.pendingPresencePlacements).toHaveLength(1);
    });

    it('second placement can chain from first placement', () => {
      let state = stateWithPending(1, 2);
      // D3 has presence. Place first in D2 (adjacent to D3)
      state = placePresence(state, 'D2', 'energy');
      // Now D2 has presence. D4 is adjacent to D2 (range 1 from D2)
      state = placePresence(state, 'D4', 'cardPlay');
      expect(state.lands['D4'].pieces.presence).toBe(1);
      expect(state.phaseStep).toBe('GAIN_ENERGY');
    });

    it('throws on land out of range', () => {
      const state = stateWithPending(1);
      // D8 is not adjacent to D3 (the only land with presence)
      expect(() => placePresence(state, 'D8', 'energy')).toThrow('not within range');
    });

    it('throws on invalid land', () => {
      const state = stateWithPending(1);
      expect(() => placePresence(state, 'invalid', 'energy')).toThrow();
    });

    it('throws when no pending placements', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, pendingPresencePlacements: [] };
      expect(() => placePresence(state, 'D1', 'energy')).toThrow('No pending');
    });
  });

  describe('getValidLandsForPlacement', () => {
    it('range 0 returns only lands with presence', () => {
      const state = initializeGame(undefined, 42);
      const valid = getValidLandsForPlacement(state, 0);
      // Only D3 has presence at start
      expect(valid).toEqual(['D3']);
    });

    it('range 1 returns presence lands + adjacent', () => {
      const state = initializeGame(undefined, 42);
      const valid = getValidLandsForPlacement(state, 1);
      // D3 has presence; adjacent: D2, D4
      expect(valid).toContain('D3');
      expect(valid).toContain('D2');
      expect(valid).toContain('D4');
      expect(valid).not.toContain('D8');
    });

    it('range 2 reaches two hops from presence', () => {
      const state = initializeGame(undefined, 42);
      const valid = getValidLandsForPlacement(state, 2);
      // D3→D2→D1, D3→D2→D5, D3→D4→D5, D3→D4→D6, etc.
      expect(valid).toContain('D1');
      expect(valid).toContain('D5');
      expect(valid).toContain('D6');
    });
  });

  describe('reclaim one', () => {
    it('auto-reclaims a card when Reclaim One slot is revealed', () => {
      let state = initializeGame(undefined, 42);
      // Reveal card play track to index 5 (past the Reclaim One at index 4)
      // Put a card in discard
      state = {
        ...state,
        spirit: {
          ...state.spirit,
          revealedCardPlayIndex: 5,
          discard: [powerCardId('flash-floods')],
          hand: state.spirit.hand.filter(id => id !== powerCardId('flash-floods')),
        },
        pendingPresencePlacements: [{ range: 1 }],
        phaseStep: 'PLACE_PRESENCE' as const,
      };

      // Place presence (this will be the last pending placement)
      state = placePresence(state, 'D2', 'energy');

      // Reclaim One should have triggered
      expect(state.spirit.hand).toContain(powerCardId('flash-floods'));
      expect(state.spirit.discard).not.toContain(powerCardId('flash-floods'));
    });

    it('does not reclaim when Reclaim One slot is not revealed', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        spirit: {
          ...state.spirit,
          revealedCardPlayIndex: 0,
          discard: [powerCardId('flash-floods')],
          hand: state.spirit.hand.filter(id => id !== powerCardId('flash-floods')),
        },
        pendingPresencePlacements: [{ range: 1 }],
        phaseStep: 'PLACE_PRESENCE' as const,
      };

      state = placePresence(state, 'D2', 'energy');

      expect(state.spirit.discard).toContain(powerCardId('flash-floods'));
    });

    it('reclaim one triggers on growth-1 if Reclaim One revealed', () => {
      let state = initializeGame(undefined, 42);
      // Put only 1 card in discard, Reclaim All will reclaim it.
      // Then Reclaim One has nothing to do — so set up 2 cards:
      // one in discard (for Reclaim All to get), and check no error occurs.
      state = {
        ...state,
        spirit: {
          ...state.spirit,
          revealedCardPlayIndex: 5,
          discard: [powerCardId('wash-away')],
          hand: state.spirit.hand.filter(id => id !== powerCardId('wash-away')),
        },
      };

      state = selectGrowth(state, 'growth-1');

      // Reclaim All already returned wash-away, so Reclaim One is a no-op (discard empty)
      expect(state.spirit.discard).toHaveLength(0);
      expect(state.spirit.hand).toContain(powerCardId('wash-away'));
    });
  });

  describe('gainEnergy', () => {
    it('gains energy based on presence track', () => {
      let state = initializeGame(undefined, 42);
      state = gainEnergy(state);
      // At index 0, energy track value is 1
      expect(state.spirit.energy).toBe(1);
      expect(state.phaseStep).toBe('PLAY_CARDS');
    });

    it('gains more energy with revealed track', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, revealedEnergyIndex: 3 } };
      state = gainEnergy(state);
      // At index 3, energy track value is 3
      expect(state.spirit.energy).toBe(3);
    });
  });

  describe('playCard', () => {
    it('plays a card, deducting energy and moving to played pile', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 5 }, phaseStep: 'PLAY_CARDS' };

      const cardId = powerCardId('flash-floods'); // cost 2
      state = playCard(state, cardId);

      expect(state.spirit.energy).toBe(3);
      expect(state.spirit.playedThisTurn).toContain(cardId);
      expect(state.spirit.hand).not.toContain(cardId);
    });

    it('updates elements when playing a card', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 5 }, phaseStep: 'PLAY_CARDS' };

      // Flash Floods has sun + water
      state = playCard(state, powerCardId('flash-floods'));
      expect(state.spirit.elements.sun).toBe(1);
      expect(state.spirit.elements.water).toBe(1);
    });

    it('throws when insufficient energy', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 0 }, phaseStep: 'PLAY_CARDS' };
      expect(() => playCard(state, powerCardId('flash-floods'))).toThrow();
    });
  });

  describe('canPlayCard', () => {
    it('returns false if card not in hand', () => {
      const state = initializeGame(undefined, 42);
      expect(canPlayCard(state, powerCardId('uncanny-melting'))).toBe(false);
    });

    it('returns false if insufficient energy', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 0 } };
      expect(canPlayCard(state, powerCardId('flash-floods'))).toBe(false);
    });

    it('returns true for free card with 0 energy', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 0 } };
      // Boon of Vigor costs 0
      expect(canPlayCard(state, powerCardId('boon-of-vigor'))).toBe(true);
    });
  });

  describe('getCardPlayLimit', () => {
    it('returns 1 at starting position', () => {
      const state = initializeGame(undefined, 42);
      expect(getCardPlayLimit(state)).toBe(1);
    });

    it('increases with revealed card play track', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, revealedCardPlayIndex: 3 } };
      expect(getCardPlayLimit(state)).toBe(3);
    });

    it('returns 3 at Reclaim One slot (index 4)', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, revealedCardPlayIndex: 4 } };
      expect(getCardPlayLimit(state)).toBe(3);
    });
  });

  describe('confirmCardPlays', () => {
    it('transitions to FAST_POWERS phase', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, phaseStep: 'PLAY_CARDS' };
      state = confirmCardPlays(state);
      expect(state.phase).toBe('FAST_POWERS');
      expect(state.phaseStep).toBe('RESOLVE_FEAR_CARDS');
    });
  });
});
