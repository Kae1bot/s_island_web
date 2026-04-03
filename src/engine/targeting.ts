import type { GameState } from '../models/game-state';
import type { PowerCard } from '../models/power-card';
import type { InnateAbility } from '../models/spirit';
import { getSpiritDefinition } from '../data/spirits';

/**
 * Check if a land qualifies as a Sacred Site for the current spirit.
 * Base rule: 2+ presence = Sacred Site.
 * Special rules (e.g. River's Domain) can make 1 presence in a specific terrain count.
 */
export function isSacredSite(state: GameState, landId: string): boolean {
  const land = state.lands[landId];
  if (!land || land.pieces.presence === 0) return false;

  // Check special rules from spirit definition
  const definition = getSpiritDefinition(state.spirit.definitionId);
  for (const rule of definition.specialRules) {
    if (rule.effect?.type === 'presence_is_sacred_site') {
      if (land.terrain === rule.effect.terrain && land.pieces.presence >= 1) {
        return true;
      }
    }
  }

  // Base rule: 2+ presence
  return land.pieces.presence >= 2;
}

/**
 * Get all lands within a given range from a source land via BFS.
 */
function getLandsInRange(state: GameState, sourceLandId: string, range: number): string[] {
  const reachable: string[] = [];
  const visited = new Set<string>([sourceLandId]);
  let frontier = [sourceLandId];

  for (let d = 0; d <= range; d++) {
    for (const id of frontier) {
      reachable.push(id);
    }
    if (d < range) {
      const nextFrontier: string[] = [];
      for (const id of frontier) {
        const land = state.lands[id];
        if (!land) continue;
        for (const adj of land.adjacentLands) {
          const adjStr = adj as string;
          if (!visited.has(adjStr) && state.lands[adjStr]) {
            visited.add(adjStr);
            nextFrontier.push(adjStr);
          }
        }
      }
      frontier = nextFrontier;
    }
  }

  return reachable;
}

/**
 * Get valid source lands for targeting (presence lands or sacred sites).
 */
function getSourceLands(state: GameState, requireSacredSite: boolean): string[] {
  return Object.keys(state.lands).filter(id => {
    const land = state.lands[id];
    if (land.pieces.presence === 0) return false;
    if (requireSacredSite) return isSacredSite(state, id);
    return true;
  });
}

/**
 * Compute all valid target lands for a power card.
 */
export function getValidTargetLands(state: GameState, card: PowerCard): string[] {
  if (card.targeting.targetType === 'spirit') {
    // Spirit-targeting cards don't target lands
    return [];
  }

  const requireSacredSite = card.targeting.sourceRequirement === 'sacred-site';
  const sources = getSourceLands(state, requireSacredSite);

  const reachable = new Set<string>();
  for (const sourceId of sources) {
    for (const landId of getLandsInRange(state, sourceId, card.targeting.range)) {
      reachable.add(landId);
    }
  }

  // Apply filters
  return Array.from(reachable).filter(id => {
    const land = state.lands[id];
    if (!land) return false;
    if (card.targeting.terrainFilter && !card.targeting.terrainFilter.includes(land.terrain)) {
      return false;
    }
    if (card.targeting.coastalOnly && !land.coastal) {
      return false;
    }
    return true;
  });
}

/**
 * Get valid target lands for any innate ability, based on its targeting definition.
 */
export function getValidInnateLands(state: GameState, innate: InnateAbility): string[] {
  const requireSacredSite = innate.targeting.sourceRequirement === 'sacred-site';
  const sources = getSourceLands(state, requireSacredSite);
  const reachable = new Set<string>();
  for (const sourceId of sources) {
    for (const landId of getLandsInRange(state, sourceId, innate.targeting.range)) {
      reachable.add(landId);
    }
  }
  return Array.from(reachable);
}

/**
 * Get adjacent lands that have a specific piece type (for push destinations or gather sources).
 */
export function getAdjacentLandsWithPiece(
  state: GameState,
  landId: string,
  pieceTypes: readonly string[],
): string[] {
  const land = state.lands[landId];
  if (!land) return [];
  return land.adjacentLands
    .map(id => id as string)
    .filter(adjId => {
      const adj = state.lands[adjId];
      if (!adj) return false;
      return pieceTypes.some(pt => adj.pieces[pt as keyof typeof adj.pieces] > 0);
    });
}

/**
 * Get adjacent land IDs (for push destinations).
 */
export function getAdjacentLands(state: GameState, landId: string): string[] {
  const land = state.lands[landId];
  if (!land) return [];
  return land.adjacentLands.map(id => id as string);
}
