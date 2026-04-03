import type { FearCard } from '../../models/fear';

/** Base game fear cards (simplified set for Phase 1) */
const BASE_FEAR_CARDS: readonly FearCard[] = [
  {
    id: 'fear-overseas-trade',
    name: 'Overseas Trade Seems Risky',
    terrorLevel1Effect: 'Each player removes 1 Explorer from a Coastal land.',
    terrorLevel2Effect: 'Each player removes 1 Explorer and 1 Town from Coastal lands.',
    terrorLevel3Effect: 'Each player removes 1 City and 1 Town from Coastal lands.',
  },
  {
    id: 'fear-dahan-attack',
    name: 'Dahan Attack',
    terrorLevel1Effect: 'Dahan in a single land deal Damage to Invaders.',
    terrorLevel2Effect: 'Dahan in up to 2 lands deal Damage to Invaders.',
    terrorLevel3Effect: 'Dahan in every land deal Damage to Invaders.',
  },
  {
    id: 'fear-retreat',
    name: 'Retreat!',
    terrorLevel1Effect: 'Each player pushes 1 Explorer from any inland land to an adjacent Coastal land.',
    terrorLevel2Effect: 'Each player pushes up to 3 Explorers from inland lands to adjacent Coastal lands.',
    terrorLevel3Effect: 'Each player pushes all Explorers from 1 inland land. Destroy 1 Town.',
  },
  {
    id: 'fear-avoid-jungle',
    name: 'Avoid the Jungle',
    terrorLevel1Effect: 'Defend 3 in all Jungle lands.',
    terrorLevel2Effect: 'Defend 6 in all Jungle lands.',
    terrorLevel3Effect: 'Remove 1 Explorer from each Jungle land.',
  },
  {
    id: 'fear-seek-safety',
    name: 'Seek Safety',
    terrorLevel1Effect: 'Each player pushes 1 Explorer into a land with a Town or City.',
    terrorLevel2Effect: 'Each player pushes up to 3 Explorers into lands with Towns or Cities.',
    terrorLevel3Effect: 'Each player removes 2 Explorers from lands without Towns or Cities.',
  },
  {
    id: 'fear-emigration',
    name: 'Emigration Accelerates',
    terrorLevel1Effect: 'Each player removes 1 Explorer from the board.',
    terrorLevel2Effect: 'Each player removes 1 Town from the board.',
    terrorLevel3Effect: 'Each player removes 1 City from the board.',
  },
  {
    id: 'fear-tall-tales',
    name: 'Tall Tales of Savagery',
    terrorLevel1Effect: 'Each player may Push 1 Explorer into a land with a Town or City.',
    terrorLevel2Effect: 'Each player removes 1 Explorer from a land with a Town or City.',
    terrorLevel3Effect: 'Each player removes 1 Town from a land without a City.',
  },
  {
    id: 'fear-belief-wanes',
    name: 'Belief Takes Root',
    terrorLevel1Effect: 'Defend 2 in all lands with Dahan.',
    terrorLevel2Effect: 'Defend 3 in all lands with Dahan.',
    terrorLevel3Effect: 'Defend 4 in all lands with Dahan. Remove 1 Explorer from a land with Dahan.',
  },
  {
    id: 'fear-isolation',
    name: 'Isolation',
    terrorLevel1Effect: 'Defend 2 in each land where you have Presence.',
    terrorLevel2Effect: 'Defend 4 in each land where you have Presence.',
    terrorLevel3Effect: 'Destroy 1 Explorer in each land where you have Presence.',
  },
];

export function createFearDeck(rng: () => number): readonly FearCard[] {
  const result = [...BASE_FEAR_CARDS];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
