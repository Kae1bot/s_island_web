import type { Element, ElementMap } from './elements';
import type { Terrain } from './land';

export type PowerCardId = string & { readonly __brand: 'PowerCardId' };

export function powerCardId(id: string): PowerCardId {
  return id as PowerCardId;
}

export type Speed = 'fast' | 'slow';
export type PowerType = 'unique' | 'minor' | 'major';

export interface TargetingRule {
  readonly range: number;
  readonly sourceRequirement?: 'sacred-site';
  readonly terrainFilter?: readonly Terrain[];
  readonly coastalOnly?: boolean;
  readonly targetType: 'land' | 'spirit';
}

export interface PowerCardThreshold {
  readonly condition: ElementMap;
  readonly description: string;
}

export interface PowerCard {
  readonly id: PowerCardId;
  readonly name: string;
  readonly cost: number;
  readonly speed: Speed;
  readonly elements: readonly Element[];
  readonly targeting: TargetingRule;
  readonly description: string;
  readonly threshold?: PowerCardThreshold;
  readonly type: PowerType;
}
