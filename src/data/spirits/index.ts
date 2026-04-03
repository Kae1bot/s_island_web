import type { SpiritDefinition } from '../../models/spirit';
import type { SpiritId } from '../../models/spirit';
import { RIVER_SURGES } from './river-surges';
import { LIGHTNING_SWIFT_STRIKE } from './lightning-swift-strike';

const SPIRIT_MAP = new Map<string, SpiritDefinition>([
  [RIVER_SURGES.id as string, RIVER_SURGES],
  [LIGHTNING_SWIFT_STRIKE.id as string, LIGHTNING_SWIFT_STRIKE],
]);

export function getSpiritDefinition(id: SpiritId): SpiritDefinition {
  const def = SPIRIT_MAP.get(id as string);
  if (!def) {
    throw new Error(`Spirit not found: ${id}`);
  }
  return def;
}

export function getAllSpiritIds(): readonly SpiritId[] {
  return Array.from(SPIRIT_MAP.keys()) as SpiritId[];
}
