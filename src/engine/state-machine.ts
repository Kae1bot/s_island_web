import type { GameState } from '../models/game-state';
import type { TurnPhase, PhaseStep } from '../models/phase';
import { PHASE_ORDER } from '../models/phase';

export interface PhaseTransition {
  readonly phase: TurnPhase;
  readonly step: PhaseStep;
}

export function getNextStep(state: GameState): PhaseTransition | null {
  const currentIndex = PHASE_ORDER.findIndex(
    p => p.phase === state.phase && p.step === state.phaseStep,
  );

  if (currentIndex === -1 || currentIndex === PHASE_ORDER.length - 1) {
    return null;
  }

  return PHASE_ORDER[currentIndex + 1];
}

export function advancePhase(state: GameState): GameState {
  const next = getNextStep(state);
  if (!next) {
    // Wrap to next turn
    return {
      ...state,
      turn: state.turn + 1,
      phase: 'SPIRIT_PHASE',
      phaseStep: 'GROWTH_SELECTION',
    };
  }

  return {
    ...state,
    phase: next.phase,
    phaseStep: next.step,
  };
}

export function canAdvance(state: GameState): boolean {
  if (state.gameResult !== 'playing') return false;

  switch (state.phaseStep) {
    case 'GROWTH_SELECTION':
      // Must select a growth option before advancing
      return false;
    case 'PLACE_PRESENCE':
      // Must place all pending presence before advancing
      return false;
    case 'PLAY_CARDS':
      // Player can always choose to stop playing cards
      return true;
    default:
      return true;
  }
}

export function getPhaseLabel(_phase: TurnPhase, step: PhaseStep): string {
  const labels: Record<PhaseStep, string> = {
    GROWTH_SELECTION: 'Select Growth Option',
    PLACE_PRESENCE: 'Place Presence',
    GAIN_ENERGY: 'Gain Energy',
    PLAY_CARDS: 'Play Power Cards',
    RESOLVE_FEAR_CARDS: 'Resolve Fear Cards',
    RESOLVE_FAST: 'Resolve Fast Powers',
    RAVAGE: 'Invader Ravage',
    BUILD: 'Invader Build',
    EXPLORE: 'Invader Explore',
    ADVANCE_INVADER_CARDS: 'Advance Invader Cards',
    RESOLVE_SLOW: 'Resolve Slow Powers',
    DISCARD_CARDS: 'Discard Cards',
    RESET_TURN: 'Reset Turn',
  };
  return labels[step] ?? step;
}
