import type { PowerCard } from '../../models/power-card';
import type { PowerCardId } from '../../models/power-card';
import { UNIQUE_POWERS } from './unique-powers';
import { LIGHTNING_UNIQUE_POWERS } from './lightning-unique-powers';
import { MINOR_POWERS } from './minor-powers';
import { MAJOR_POWERS } from './major-powers';

export { UNIQUE_POWERS } from './unique-powers';
export { LIGHTNING_UNIQUE_POWERS } from './lightning-unique-powers';
export { MINOR_POWERS } from './minor-powers';
export { MAJOR_POWERS } from './major-powers';
export * from './unique-powers';
export * from './lightning-unique-powers';
export * from './minor-powers';
export * from './major-powers';

const ALL_POWERS: readonly PowerCard[] = [
  ...UNIQUE_POWERS,
  ...LIGHTNING_UNIQUE_POWERS,
  ...MINOR_POWERS,
  ...MAJOR_POWERS,
];

const POWER_MAP = new Map<string, PowerCard>(
  ALL_POWERS.map(p => [p.id as string, p]),
);

export function getPowerCard(id: PowerCardId): PowerCard {
  const card = POWER_MAP.get(id as string);
  if (!card) {
    throw new Error(`Power card not found: ${id}`);
  }
  return card;
}

export const RIVER_POWER_PROGRESSION: readonly PowerCardId[] = [
  MINOR_POWERS[0].id, // Uncanny Melting
  MINOR_POWERS[1].id, // Nature's Resilience
  MINOR_POWERS[2].id, // Pull Beneath the Hungry Earth
  MAJOR_POWERS[0].id, // Accelerated Rot (Major)
  MINOR_POWERS[3].id, // Song of Sanctity
  MAJOR_POWERS[1].id, // Tsunami (Major)
  MINOR_POWERS[4].id, // Encompassing Ward
];

export const LIGHTNING_POWER_PROGRESSION: readonly PowerCardId[] = [
  MINOR_POWERS[2].id, // Pull Beneath the Hungry Earth
  MINOR_POWERS[0].id, // Uncanny Melting
  MAJOR_POWERS[0].id, // Accelerated Rot (Major)
  MINOR_POWERS[4].id, // Encompassing Ward
  MINOR_POWERS[1].id, // Nature's Resilience
  MAJOR_POWERS[1].id, // Tsunami (Major)
  MINOR_POWERS[3].id, // Song of Sanctity
];
