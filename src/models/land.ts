export type Terrain = 'jungle' | 'wetland' | 'sand' | 'mountain';

export type LandId = string & { readonly __brand: 'LandId' };
export type BoardId = string & { readonly __brand: 'BoardId' };

export function landId(id: string): LandId {
  return id as LandId;
}

export function boardId(id: string): BoardId {
  return id as BoardId;
}

export interface Pieces {
  readonly explorers: number;
  readonly towns: number;
  readonly cities: number;
  readonly dahan: number;
  readonly blight: number;
  readonly presence: number;
}

export const EMPTY_PIECES: Pieces = {
  explorers: 0,
  towns: 0,
  cities: 0,
  dahan: 0,
  blight: 0,
  presence: 0,
};

export interface Land {
  readonly id: LandId;
  readonly terrain: Terrain;
  readonly board: BoardId;
  readonly coastal: boolean;
  readonly adjacentLands: readonly LandId[];
  readonly pieces: Pieces;
}
