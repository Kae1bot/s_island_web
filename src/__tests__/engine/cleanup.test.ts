import { describe, it, expect } from 'vitest';
import { initializeGame } from '../../engine/init';
import { playCard } from '../../engine/spirit-phase';
import { discardPlayedCards, resetTurn } from '../../engine/cleanup';
import { powerCardId } from '../../models/power-card';

describe('cleanup', () => {
  describe('discardPlayedCards', () => {
    it('moves played cards to discard and clears elements', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, spirit: { ...state.spirit, energy: 5 } };
      state = playCard(state, powerCardId('boon-of-vigor'));

      expect(state.spirit.playedThisTurn).toHaveLength(1);
      expect(Object.keys(state.spirit.elements).length).toBeGreaterThan(0);

      state = discardPlayedCards(state);
      expect(state.spirit.playedThisTurn).toHaveLength(0);
      expect(state.spirit.discard).toHaveLength(1);
      expect(state.spirit.elements).toEqual({});
    });
  });

  describe('resetTurn', () => {
    it('increments turn and resets to spirit phase', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, phase: 'CLEANUP', phaseStep: 'RESET_TURN' };
      state = resetTurn(state);
      expect(state.turn).toBe(2);
      expect(state.phase).toBe('SPIRIT_PHASE');
      expect(state.phaseStep).toBe('GROWTH_SELECTION');
    });
  });
});
