import type { Terrain } from './land';

export interface InvaderCard {
  readonly id: string;
  readonly terrain: Terrain | 'coastal';
  readonly stage: 1 | 2 | 3;
}

export interface InvaderState {
  readonly deck: readonly InvaderCard[];
  readonly ravage: InvaderCard | null;
  readonly build: InvaderCard | null;
  readonly explore: InvaderCard | null;
  readonly discard: readonly InvaderCard[];
}
