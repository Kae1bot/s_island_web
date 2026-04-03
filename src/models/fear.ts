export type TerrorLevel = 1 | 2 | 3;

export interface FearCard {
  readonly id: string;
  readonly name: string;
  readonly terrorLevel1Effect: string;
  readonly terrorLevel2Effect: string;
  readonly terrorLevel3Effect: string;
}

export interface FearState {
  readonly generatedFear: number;
  readonly fearPerCard: number;
  readonly earnedCards: readonly FearCard[];
  readonly terrorLevel: TerrorLevel;
  readonly fearDeck: readonly FearCard[];
  readonly discardedFearCards: readonly FearCard[];
}
