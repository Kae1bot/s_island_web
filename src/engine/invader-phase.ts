import type { GameState } from '../models/game-state';
import type { Land, Terrain } from '../models/land';
import type { InvaderCard, InvaderState } from '../models/invader';
import { generateFear } from './fear';
import { logMsg, type LogEntry } from '../models/log-entry';

// ── Ravage ──────────────────────────────────────────────────

export function resolveRavage(state: GameState): GameState {
  const { ravage } = state.invaders;
  if (!ravage) {
    return { ...state, log: [...state.log, logMsg('logNoRavage')] };
  }

  const targetTerrains = getTargetTerrains(ravage);
  const log: LogEntry[] = [logMsg('logRavage', ravage.terrain)];
  let newState = { ...state };

  for (const [landId, land] of Object.entries(state.lands)) {
    if (!matchesTerrain(land, targetTerrains)) continue;

    const rawDamage = land.pieces.explorers + land.pieces.towns * 2 + land.pieces.cities * 3;
    if (rawDamage === 0) continue;

    // Apply Defend
    const defense = newState.defenses[landId] ?? 0;
    const invaderDamage = Math.max(0, rawDamage - defense);

    let updatedLand = { ...land };
    const landLog: LogEntry[] = [];

    if (defense > 0) {
      landLog.push(logMsg('logDefend', landId, defense, rawDamage, invaderDamage));
    }

    // Invaders damage land and Dahan
    landLog.push(logMsg('logInvaderDamage', landId, invaderDamage));

    // Damage Dahan first
    let dahanKilled = 0;
    let remainingDamage = invaderDamage;
    const dahanHealth = 2;
    while (remainingDamage >= dahanHealth && updatedLand.pieces.dahan > 0) {
      dahanKilled++;
      remainingDamage -= dahanHealth;
      updatedLand = {
        ...updatedLand,
        pieces: { ...updatedLand.pieces, dahan: updatedLand.pieces.dahan - 1 },
      };
    }
    if (dahanKilled > 0) {
      landLog.push(logMsg('logDahanDestroyed', dahanKilled));
    }

    // If total damage >= 2, add blight
    if (invaderDamage >= 2) {
      updatedLand = {
        ...updatedLand,
        pieces: { ...updatedLand.pieces, blight: updatedLand.pieces.blight + 1 },
      };
      newState = {
        ...newState,
        blight: {
          ...newState.blight,
          remaining: newState.blight.remaining - 1,
        },
      };
      landLog.push(logMsg('logBlightAdded', landId));

      // Check if blight card needs to flip
      if (newState.blight.remaining <= 0 && !newState.blight.isCardFlipped) {
        newState = {
          ...newState,
          blight: { ...newState.blight, isCardFlipped: true, remaining: 5 },
        };
        landLog.push(logMsg('logBlightFlipped'));
      }
    }

    // Dahan fight back: each surviving Dahan deals 2 damage to invaders
    const dahanDamage = updatedLand.pieces.dahan * 2;
    if (dahanDamage > 0 && hasInvaders(updatedLand)) {
      const result = applyDamageToInvaders(updatedLand, dahanDamage);
      updatedLand = result.land;
      if (result.fear > 0) {
        newState = generateFear(newState, result.fear);
      }
      landLog.push(logMsg('logDahanFightBack', dahanDamage));
    }

    newState = {
      ...newState,
      lands: { ...newState.lands, [landId]: updatedLand },
    };
    log.push(...landLog);
  }

  return {
    ...newState,
    log: [...newState.log, ...log],
  };
}

// ── Build ───────────────────────────────────────────────────

export function resolveBuild(state: GameState): GameState {
  const { build } = state.invaders;
  if (!build) {
    return { ...state, log: [...state.log, logMsg('logNoBuild')] };
  }

  const targetTerrains = getTargetTerrains(build);
  const log: LogEntry[] = [logMsg('logBuild', build.terrain)];
  let newLands = { ...state.lands };

  for (const [landId, land] of Object.entries(state.lands)) {
    if (!matchesTerrain(land, targetTerrains)) continue;
    if (!hasInvaders(land)) continue;

    // Build: if town(s) or city present, add city. Otherwise add town.
    const hasTownOrCity = land.pieces.towns > 0 || land.pieces.cities > 0;
    if (hasTownOrCity) {
      newLands = {
        ...newLands,
        [landId]: {
          ...land,
          pieces: { ...land.pieces, cities: land.pieces.cities + 1 },
        },
      };
      log.push(logMsg('logBuiltCity', landId));
    } else {
      newLands = {
        ...newLands,
        [landId]: {
          ...land,
          pieces: { ...land.pieces, towns: land.pieces.towns + 1 },
        },
      };
      log.push(logMsg('logBuiltTown', landId));
    }
  }

  return {
    ...state,
    lands: newLands,
    log: [...state.log, ...log],
  };
}

// ── Explore ─────────────────────────────────────────────────

export function resolveExplore(state: GameState): GameState {
  const { explore } = state.invaders;
  if (!explore) {
    return { ...state, log: [...state.log, logMsg('logNoExplore')] };
  }

  const targetTerrains = getTargetTerrains(explore);
  const log: LogEntry[] = [logMsg('logExplore', explore.terrain)];
  let newLands = { ...state.lands };

  for (const [landId, land] of Object.entries(state.lands)) {
    if (!matchesTerrain(land, targetTerrains)) continue;

    // Explore: add explorer if land is coastal OR adjacent to a land with a town/city
    const canExplore = land.coastal || hasAdjacentInvaderSource(land, state.lands);
    if (!canExplore) continue;

    newLands = {
      ...newLands,
      [landId]: {
        ...land,
        pieces: { ...land.pieces, explorers: land.pieces.explorers + 1 },
      },
    };
    log.push(logMsg('logExplorerAdded', landId));
  }

  return {
    ...state,
    lands: newLands,
    log: [...state.log, ...log],
  };
}

// ── Advance Invader Cards ───────────────────────────────────

export function advanceInvaderCards(state: GameState): GameState {
  const inv = state.invaders;

  // Discard the ravage card
  const newDiscard = inv.ravage
    ? [...inv.discard, inv.ravage]
    : [...inv.discard];

  // Shift: build → ravage, explore → build
  // Draw new explore from deck
  const newDeck = [...inv.deck];
  const newExplore = newDeck.length > 0 ? newDeck.shift()! : null;

  const newInvaders: InvaderState = {
    deck: newDeck,
    ravage: inv.build,
    build: inv.explore,
    explore: newExplore,
    discard: newDiscard,
  };

  const log: LogEntry[] = [logMsg('logCardsAdvanced')];
  if (newExplore) {
    log.push(logMsg('logNewExplore', newExplore.terrain, newExplore.stage));
  }

  let newState: GameState = {
    ...state,
    invaders: newInvaders,
    log: [...state.log, ...log],
  };

  // Defeat: invader deck exhausted
  if (newDeck.length === 0 && !newExplore) {
    newState = {
      ...newState,
      gameResult: 'defeat',
      defeatReason: 'logDefeatDeckExhausted',
      log: [...newState.log, logMsg('logDeckExhausted')],
    };
  }

  return newState;
}

// ── Helpers ─────────────────────────────────────────────────

function getTargetTerrains(card: InvaderCard): readonly (Terrain | 'coastal')[] {
  return [card.terrain];
}

function matchesTerrain(land: Land, targets: readonly (Terrain | 'coastal')[]): boolean {
  for (const target of targets) {
    if (target === 'coastal') {
      if (land.coastal) return true;
    } else if (land.terrain === target) {
      return true;
    }
  }
  return false;
}

function hasInvaders(land: Land): boolean {
  return land.pieces.explorers > 0 || land.pieces.towns > 0 || land.pieces.cities > 0;
}

function hasAdjacentInvaderSource(
  land: Land,
  allLands: Readonly<Record<string, Land>>,
): boolean {
  for (const adjId of land.adjacentLands) {
    const adj = allLands[adjId as string];
    if (adj && (adj.pieces.towns > 0 || adj.pieces.cities > 0)) {
      return true;
    }
  }
  return false;
}

/**
 * Apply damage to invaders in a land. Destroys explorers first (1 HP),
 * then towns (2 HP, generate 1 fear), then cities (3 HP, generate 2 fear).
 */
export function applyDamageToInvaders(
  land: Land,
  damage: number,
): { land: Land; fear: number } {
  let remaining = damage;
  let { explorers, towns, cities } = land.pieces;
  let fear = 0;

  // Destroy explorers (1 HP each)
  while (remaining >= 1 && explorers > 0) {
    explorers--;
    remaining -= 1;
  }

  // Destroy towns (2 HP each, 1 fear)
  while (remaining >= 2 && towns > 0) {
    towns--;
    remaining -= 2;
    fear += 1;
  }

  // Destroy cities (3 HP each, 2 fear)
  while (remaining >= 3 && cities > 0) {
    cities--;
    remaining -= 3;
    fear += 2;
  }

  return {
    land: {
      ...land,
      pieces: { ...land.pieces, explorers, towns, cities },
    },
    fear,
  };
}
