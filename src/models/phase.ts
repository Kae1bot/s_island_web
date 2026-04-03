export type TurnPhase =
  | 'SPIRIT_PHASE'
  | 'FAST_POWERS'
  | 'INVADER_PHASE'
  | 'SLOW_POWERS'
  | 'CLEANUP';

export type PhaseStep =
  // Spirit Phase
  | 'GROWTH_SELECTION'
  | 'PLACE_PRESENCE'
  | 'GAIN_ENERGY'
  | 'PLAY_CARDS'
  // Fast Powers
  | 'RESOLVE_FEAR_CARDS'
  | 'RESOLVE_FAST'
  // Invader Phase
  | 'RAVAGE'
  | 'BUILD'
  | 'EXPLORE'
  | 'ADVANCE_INVADER_CARDS'
  // Slow Powers
  | 'RESOLVE_SLOW'
  // Cleanup
  | 'DISCARD_CARDS'
  | 'RESET_TURN';

export interface PhaseInfo {
  readonly phase: TurnPhase;
  readonly step: PhaseStep;
  readonly label: string;
  readonly description: string;
}

export const PHASE_ORDER: readonly { phase: TurnPhase; step: PhaseStep }[] = [
  { phase: 'SPIRIT_PHASE', step: 'GROWTH_SELECTION' },
  { phase: 'SPIRIT_PHASE', step: 'PLACE_PRESENCE' },
  { phase: 'SPIRIT_PHASE', step: 'GAIN_ENERGY' },
  { phase: 'SPIRIT_PHASE', step: 'PLAY_CARDS' },
  { phase: 'FAST_POWERS', step: 'RESOLVE_FEAR_CARDS' },
  { phase: 'FAST_POWERS', step: 'RESOLVE_FAST' },
  { phase: 'INVADER_PHASE', step: 'RAVAGE' },
  { phase: 'INVADER_PHASE', step: 'BUILD' },
  { phase: 'INVADER_PHASE', step: 'EXPLORE' },
  { phase: 'INVADER_PHASE', step: 'ADVANCE_INVADER_CARDS' },
  { phase: 'SLOW_POWERS', step: 'RESOLVE_SLOW' },
  { phase: 'CLEANUP', step: 'DISCARD_CARDS' },
  { phase: 'CLEANUP', step: 'RESET_TURN' },
];
