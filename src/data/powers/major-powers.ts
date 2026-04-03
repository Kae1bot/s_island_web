import type { PowerCard } from '../../models/power-card';
import { powerCardId } from '../../models/power-card';

export const ACCELERATED_ROT: PowerCard = {
  id: powerCardId('accelerated-rot'),
  name: 'Accelerated Rot',
  cost: 4,
  speed: 'slow',
  elements: ['sun', 'water', 'plant'],
  targeting: { range: 2, terrainFilter: ['jungle', 'wetland'], targetType: 'land' },
  description: '2 Fear. 4 Damage.',
  threshold: {
    condition: { sun: 3, water: 2, plant: 3 },
    description: 'Instead, 2 Fear. 5 Damage. Remove 1 Blight.',
  },
  type: 'major',
};

export const TSUNAMI: PowerCard = {
  id: powerCardId('tsunami'),
  name: 'Tsunami',
  cost: 6,
  speed: 'slow',
  elements: ['water', 'earth'],
  targeting: { range: 2, sourceRequirement: 'sacred-site', coastalOnly: true, targetType: 'land' },
  description: '2 Fear. 8 Damage. Destroy 2 Dahan.',
  threshold: {
    condition: { water: 3, earth: 2 },
    description: 'In each other Coastal land on the same board: 1 Fear, 4 Damage, and Destroy 1 Dahan.',
  },
  type: 'major',
};

export const MAJOR_POWERS: readonly PowerCard[] = [
  ACCELERATED_ROT,
  TSUNAMI,
];
