import type { PowerCard } from '../../models/power-card';
import { powerCardId } from '../../models/power-card';

export const BOON_OF_VIGOR: PowerCard = {
  id: powerCardId('boon-of-vigor'),
  name: 'Boon of Vigor',
  cost: 0,
  speed: 'fast',
  elements: ['sun', 'water', 'plant'],
  targeting: { range: 0, targetType: 'spirit' },
  description: 'If you target yourself, gain 1 Energy. If you target another Spirit, they gain 1 Energy per Power Card they played this turn.',
  type: 'unique',
};

export const FLASH_FLOODS: PowerCard = {
  id: powerCardId('flash-floods'),
  name: 'Flash Floods',
  cost: 2,
  speed: 'fast',
  elements: ['sun', 'water'],
  targeting: { range: 1, targetType: 'land' },
  description: '1 Damage. If target land is Coastal, +1 Damage.',
  type: 'unique',
};

export const RIVERS_BOUNTY: PowerCard = {
  id: powerCardId('rivers-bounty'),
  name: "River's Bounty",
  cost: 0,
  speed: 'slow',
  elements: ['sun', 'water', 'animal'],
  targeting: { range: 0, targetType: 'land' },
  description: 'Gather up to 2 Dahan. If there are now 2 or more Dahan, add 1 Dahan and gain 1 Energy.',
  type: 'unique',
};

export const WASH_AWAY: PowerCard = {
  id: powerCardId('wash-away'),
  name: 'Wash Away',
  cost: 1,
  speed: 'slow',
  elements: ['water', 'earth'],
  targeting: { range: 1, targetType: 'land' },
  description: 'Push up to 3 Explorers / Towns.',
  type: 'unique',
};

export const UNIQUE_POWERS: readonly PowerCard[] = [
  BOON_OF_VIGOR,
  FLASH_FLOODS,
  RIVERS_BOUNTY,
  WASH_AWAY,
];
