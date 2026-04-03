import type { GameState } from '../models/game-state';
import type { SpiritState, SpiritId } from '../models/spirit';
import type { InvaderState } from '../models/invader';
import type { FearState } from '../models/fear';
import type { Land } from '../models/land';
import type { PowerCardId } from '../models/power-card';
import { spiritId } from '../models/spirit';
import { getSpiritDefinition } from '../data/spirits';
import { getBoardDInitialLands } from '../data/boards/board-d';
import { createInvaderDeck } from '../data/invader/invader-deck';
import { createFearDeck } from '../data/fear/fear-cards';
import { RIVER_POWER_PROGRESSION, LIGHTNING_POWER_PROGRESSION } from '../data/powers';
import { createRng } from '../utils/random';
import { logMsg } from '../models/log-entry';

const POWER_PROGRESSIONS: Record<string, readonly PowerCardId[]> = {
  'river-surges-in-sunlight': RIVER_POWER_PROGRESSION,
  'lightnings-swift-strike': LIGHTNING_POWER_PROGRESSION,
};

function setupSpirit(id: SpiritId): SpiritState {
  const definition = getSpiritDefinition(id);
  return {
    definitionId: id,
    energy: 0,
    revealedEnergyIndex: 0,
    revealedCardPlayIndex: 0,
    hand: [...definition.startingCards],
    playedThisTurn: [],
    discard: [],
    elements: {},
  };
}

function setupLands(id: SpiritId): Readonly<Record<string, Land>> {
  const definition = getSpiritDefinition(id);
  const terrain = definition.initialPresenceTerrain;
  const lands = getBoardDInitialLands();

  const targetLand = lands
    .filter(l => l.terrain === terrain)
    .sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, ''), 10);
      const numB = parseInt(b.id.replace(/\D/g, ''), 10);
      return numB - numA;
    })[0];

  const record: Record<string, Land> = {};
  for (const land of lands) {
    if (land.id === targetLand.id) {
      record[land.id] = {
        ...land,
        pieces: { ...land.pieces, presence: 1 },
      };
    } else {
      record[land.id] = land;
    }
  }
  return record;
}

function setupInvaders(rng: () => number): InvaderState {
  const deck = createInvaderDeck(rng);
  return {
    deck: deck.slice(1),
    ravage: null,
    build: null,
    explore: deck[0],
    discard: [],
  };
}

function setupFear(rng: () => number): FearState {
  return {
    generatedFear: 0,
    fearPerCard: 4,
    earnedCards: [],
    terrorLevel: 1,
    fearDeck: createFearDeck(rng),
    discardedFearCards: [],
  };
}

export function initializeGame(selectedSpirit?: SpiritId, seed?: number): GameState {
  const id = selectedSpirit ?? spiritId('river-surges-in-sunlight');
  const actualSeed = seed ?? Date.now();
  const rng = createRng(actualSeed);
  const progression = POWER_PROGRESSIONS[id as string] ?? RIVER_POWER_PROGRESSION;

  return {
    turn: 1,
    phase: 'SPIRIT_PHASE',
    phaseStep: 'GROWTH_SELECTION',
    spirit: setupSpirit(id),
    lands: setupLands(id),
    invaders: setupInvaders(rng),
    fear: setupFear(rng),
    blight: {
      remaining: 5,
      isCardFlipped: false,
    },
    powerProgression: progression,
    powerProgressionIndex: 0,
    pendingPresencePlacements: [],
    pendingEffects: [],
    resolvedPowerIds: [],
    defenses: {},
    gameResult: 'playing',
    log: [logMsg('logGameStarted')],
  };
}
