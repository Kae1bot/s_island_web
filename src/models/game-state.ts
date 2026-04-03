import type { FearState } from './fear';
import type { InvaderState } from './invader';
import type { Land } from './land';
import type { Terrain } from './land';
import type { TurnPhase, PhaseStep } from './phase';
import type { PowerCardId } from './power-card';
import type { SpiritState } from './spirit';
import type { PendingEffect } from './targeting';
import type { LogEntry } from './log-entry';

export type GameResult = 'playing' | 'victory' | 'defeat';

export interface BlightPool {
  readonly remaining: number;
  readonly isCardFlipped: boolean;
}

export interface PendingPresencePlacement {
  readonly range: number;
  readonly terrain?: Terrain;
}

export interface GameState {
  readonly turn: number;
  readonly phase: TurnPhase;
  readonly phaseStep: PhaseStep;
  readonly spirit: SpiritState;
  readonly lands: Readonly<Record<string, Land>>;
  readonly invaders: InvaderState;
  readonly fear: FearState;
  readonly blight: BlightPool;
  readonly powerProgression: readonly PowerCardId[];
  readonly powerProgressionIndex: number;
  readonly pendingPresencePlacements: readonly PendingPresencePlacement[];
  readonly pendingEffects: readonly PendingEffect[];
  readonly resolvedPowerIds: readonly string[];
  readonly defenses: Readonly<Record<string, number>>;
  readonly gameResult: GameResult;
  readonly defeatReason?: string;
  readonly log: readonly LogEntry[];
}
