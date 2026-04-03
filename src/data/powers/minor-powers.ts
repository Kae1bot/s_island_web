import type { PowerCard } from '../../models/power-card';
import { powerCardId } from '../../models/power-card';

export const UNCANNY_MELTING: PowerCard = {
  id: powerCardId('uncanny-melting'),
  name: 'Uncanny Melting',
  cost: 1,
  speed: 'slow',
  elements: ['sun', 'moon', 'water'],
  targeting: { range: 1, sourceRequirement: 'sacred-site', targetType: 'land' },
  description: 'If Invaders are present, 1 Fear. If target land is Sand or Wetland, Remove 1 Blight.',
  type: 'minor',
};

export const NATURES_RESILIENCE: PowerCard = {
  id: powerCardId('natures-resilience'),
  name: "Nature's Resilience",
  cost: 1,
  speed: 'fast',
  elements: ['earth', 'plant', 'animal'],
  targeting: { range: 1, sourceRequirement: 'sacred-site', targetType: 'land' },
  description: 'Defend 6. If you have 2 Water: You may instead Remove 1 Blight.',
  threshold: {
    condition: { water: 2 },
    description: 'You may instead Remove 1 Blight.',
  },
  type: 'minor',
};

export const PULL_BENEATH_THE_HUNGRY_EARTH: PowerCard = {
  id: powerCardId('pull-beneath-the-hungry-earth'),
  name: 'Pull Beneath the Hungry Earth',
  cost: 1,
  speed: 'slow',
  elements: ['moon', 'water', 'earth'],
  targeting: { range: 1, targetType: 'land' },
  description: 'If your Presence is in target land, 1 Fear and 1 Damage. If target land is Sand or Wetland, +1 Damage.',
  type: 'minor',
};

export const SONG_OF_SANCTITY: PowerCard = {
  id: powerCardId('song-of-sanctity'),
  name: 'Song of Sanctity',
  cost: 1,
  speed: 'slow',
  elements: ['sun', 'water', 'plant'],
  targeting: { range: 1, terrainFilter: ['mountain', 'jungle'], targetType: 'land' },
  description: 'If Explorer(s) are present, Push all Explorers. Otherwise, Remove 1 Blight.',
  type: 'minor',
};

export const ENCOMPASSING_WARD: PowerCard = {
  id: powerCardId('encompassing-ward'),
  name: 'Encompassing Ward',
  cost: 1,
  speed: 'fast',
  elements: ['sun', 'water', 'earth'],
  targeting: { range: 0, targetType: 'spirit' },
  description: 'Target Spirit provides Defend 2 in each of their lands.',
  type: 'minor',
};

export const MINOR_POWERS: readonly PowerCard[] = [
  UNCANNY_MELTING,
  NATURES_RESILIENCE,
  PULL_BENEATH_THE_HUNGRY_EARTH,
  SONG_OF_SANCTITY,
  ENCOMPASSING_WARD,
];
