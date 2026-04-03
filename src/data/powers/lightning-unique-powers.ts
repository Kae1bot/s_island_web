import type { PowerCard } from '../../models/power-card';
import { powerCardId } from '../../models/power-card';

export const LIGHTNINGS_BOLT: PowerCard = {
  id: powerCardId('lightnings-bolt'),
  name: "Lightning's Bolt",
  cost: 1,
  speed: 'fast',
  elements: ['fire', 'air'],
  targeting: { range: 1, sourceRequirement: 'sacred-site', targetType: 'land' },
  description: '1 Damage.',
  type: 'unique',
};

export const HARBINGERS_OF_THE_LIGHTNING: PowerCard = {
  id: powerCardId('harbingers-of-the-lightning'),
  name: 'Harbingers of the Lightning',
  cost: 0,
  speed: 'fast',
  elements: ['fire', 'air'],
  targeting: { range: 1, targetType: 'land' },
  description: 'Push up to 2 Dahan.',
  type: 'unique',
};

export const SHATTER_HOMESTEADS: PowerCard = {
  id: powerCardId('shatter-homesteads'),
  name: 'Shatter Homesteads',
  cost: 2,
  speed: 'slow',
  elements: ['fire', 'air'],
  targeting: { range: 1, targetType: 'land' },
  description: '1 Fear. Destroy 1 Town.',
  type: 'unique',
};

export const RAGING_STORM: PowerCard = {
  id: powerCardId('raging-storm'),
  name: 'Raging Storm',
  cost: 3,
  speed: 'slow',
  elements: ['fire', 'water', 'air'],
  targeting: { range: 1, sourceRequirement: 'sacred-site', targetType: 'land' },
  description: '1 Damage to each Invader.',
  type: 'unique',
};

export const LIGHTNING_UNIQUE_POWERS: readonly PowerCard[] = [
  LIGHTNINGS_BOLT,
  HARBINGERS_OF_THE_LIGHTNING,
  SHATTER_HOMESTEADS,
  RAGING_STORM,
];
