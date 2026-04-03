import { describe, it, expect } from 'vitest';
import { initializeGame } from '../../engine/init';
import { advancePhase, getNextStep, canAdvance, getPhaseLabel } from '../../engine/state-machine';

describe('state-machine', () => {
  it('starts at SPIRIT_PHASE / GROWTH_SELECTION', () => {
    const state = initializeGame(undefined, 42);
    expect(state.phase).toBe('SPIRIT_PHASE');
    expect(state.phaseStep).toBe('GROWTH_SELECTION');
  });

  it('getNextStep returns next phase step', () => {
    const state = initializeGame(undefined, 42);
    const next = getNextStep(state);
    expect(next).toEqual({ phase: 'SPIRIT_PHASE', step: 'PLACE_PRESENCE' });
  });

  it('advancePhase moves to next step', () => {
    let state = initializeGame(undefined, 42);
    state = { ...state, phaseStep: 'GAIN_ENERGY' };
    state = advancePhase(state);
    expect(state.phaseStep).toBe('PLAY_CARDS');
  });

  it('canAdvance returns false for GROWTH_SELECTION (needs player input)', () => {
    const state = initializeGame(undefined, 42);
    expect(canAdvance(state)).toBe(false);
  });

  it('canAdvance returns true for PLAY_CARDS', () => {
    let state = initializeGame(undefined, 42);
    state = { ...state, phaseStep: 'PLAY_CARDS' };
    expect(canAdvance(state)).toBe(true);
  });

  it('canAdvance returns false when game is over', () => {
    let state = initializeGame(undefined, 42);
    state = { ...state, gameResult: 'victory', phaseStep: 'PLAY_CARDS' };
    expect(canAdvance(state)).toBe(false);
  });

  it('getPhaseLabel returns readable label', () => {
    expect(getPhaseLabel('SPIRIT_PHASE', 'GROWTH_SELECTION')).toBe('Select Growth Option');
    expect(getPhaseLabel('INVADER_PHASE', 'RAVAGE')).toBe('Invader Ravage');
  });

  it('wraps to next turn after RESET_TURN', () => {
    let state = initializeGame(undefined, 42);
    state = { ...state, phase: 'CLEANUP', phaseStep: 'RESET_TURN' };
    state = advancePhase(state);
    expect(state.turn).toBe(2);
    expect(state.phase).toBe('SPIRIT_PHASE');
    expect(state.phaseStep).toBe('GROWTH_SELECTION');
  });
});
