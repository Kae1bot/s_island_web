import type { ElementMap } from './elements';
import type { PowerCardId } from './power-card';
import type { Terrain } from './land';

export type SpiritId = string & { readonly __brand: 'SpiritId' };

export function spiritId(id: string): SpiritId {
  return id as SpiritId;
}

export type PresenceTrack = 'energy' | 'cardPlay';

export interface PresenceTrackSlot {
  readonly index: number;
  readonly value: number;
  readonly special?: 'reclaim_one';
}

export type GrowthAction =
  | { readonly type: 'reclaim_all' }
  | { readonly type: 'reclaim_one' }
  | { readonly type: 'gain_power_card' }
  | { readonly type: 'add_presence'; readonly range: number; readonly terrain?: Terrain }
  | { readonly type: 'gain_energy'; readonly amount: number };

export interface GrowthOption {
  readonly id: string;
  readonly label: string;
  readonly actions: readonly GrowthAction[];
}

export interface InnateLevel {
  readonly threshold: ElementMap;
  readonly description: string;
}

export interface InnateAbility {
  readonly id: string;
  readonly name: string;
  readonly speed: 'fast' | 'slow';
  readonly targeting: {
    readonly range: number;
    readonly sourceRequirement?: 'sacred-site';
  };
  readonly levels: readonly InnateLevel[];
}

/** Machine-readable special rule effects. Extend this union for new rule types. */
export type SpecialRuleEffect =
  | { readonly type: 'presence_is_sacred_site'; readonly terrain: Terrain };

export interface SpecialRule {
  readonly name: string;
  readonly description: string;
  readonly effect?: SpecialRuleEffect;
}

export interface SpiritDefinition {
  readonly id: SpiritId;
  readonly name: string;
  readonly specialRules: readonly SpecialRule[];
  readonly growthOptions: readonly GrowthOption[];
  readonly presenceTrack: {
    readonly energy: readonly PresenceTrackSlot[];
    readonly cardPlay: readonly PresenceTrackSlot[];
  };
  readonly innateAbilities: readonly InnateAbility[];
  readonly startingCards: readonly PowerCardId[];
  readonly setupDescription: string;
  /** Terrain type for initial presence placement (highest-numbered land of this terrain). */
  readonly initialPresenceTerrain: Terrain;
}

export interface SpiritState {
  readonly definitionId: SpiritId;
  readonly energy: number;
  readonly revealedEnergyIndex: number;
  readonly revealedCardPlayIndex: number;
  readonly hand: readonly PowerCardId[];
  readonly playedThisTurn: readonly PowerCardId[];
  readonly discard: readonly PowerCardId[];
  readonly elements: ElementMap;
}
