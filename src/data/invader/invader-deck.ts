import type { InvaderCard } from '../../models/invader';
import type { Terrain } from '../../models/land';

function invaderCard(stage: 1 | 2 | 3, terrain: Terrain | 'coastal'): InvaderCard {
  return { id: `invader-s${stage}-${terrain}`, terrain, stage };
}

/** Stage I: one card per terrain */
const STAGE_1: readonly InvaderCard[] = [
  invaderCard(1, 'jungle'),
  invaderCard(1, 'wetland'),
  invaderCard(1, 'sand'),
  invaderCard(1, 'mountain'),
];

/** Stage II: one card per terrain */
const STAGE_2: readonly InvaderCard[] = [
  invaderCard(2, 'jungle'),
  invaderCard(2, 'wetland'),
  invaderCard(2, 'sand'),
  invaderCard(2, 'mountain'),
];

/** Stage III: one card per terrain + coastal */
const STAGE_3: readonly InvaderCard[] = [
  invaderCard(3, 'jungle'),
  invaderCard(3, 'wetland'),
  invaderCard(3, 'sand'),
  invaderCard(3, 'mountain'),
  invaderCard(3, 'coastal'),
];

export function createInvaderDeck(rng: () => number): readonly InvaderCard[] {
  const shuffle = <T>(arr: readonly T[]): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  return [
    ...shuffle(STAGE_1).slice(0, 3),
    ...shuffle(STAGE_2).slice(0, 4),
    ...shuffle(STAGE_3).slice(0, 5),
  ];
}
