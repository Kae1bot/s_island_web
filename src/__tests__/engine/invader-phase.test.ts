import { describe, it, expect } from 'vitest';
import { initializeGame } from '../../engine/init';
import {
  resolveRavage,
  resolveBuild,
  resolveExplore,
  advanceInvaderCards,
  applyDamageToInvaders,
} from '../../engine/invader-phase';
import type { Land } from '../../models/land';
import { landId, boardId, EMPTY_PIECES } from '../../models/land';

function makeLand(overrides: Partial<Omit<Land, 'id'>> & { id: string }): Land {
  return {
    id: landId(overrides.id),
    terrain: overrides.terrain ?? 'jungle',
    board: boardId('D'),
    coastal: overrides.coastal ?? false,
    adjacentLands: overrides.adjacentLands ?? [],
    pieces: overrides.pieces ?? EMPTY_PIECES,
  };
}

describe('invader-phase', () => {
  describe('resolveRavage', () => {
    it('skips when no ravage card', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, invaders: { ...state.invaders, ravage: null } };
      const result = resolveRavage(state);
      expect(result.log.some(l => l.key.includes('No'))).toBe(true);
    });

    it('invaders deal damage and add blight', () => {
      let state = initializeGame(undefined, 42);
      // Set ravage to jungle
      state = {
        ...state,
        invaders: {
          ...state.invaders,
          ravage: { id: 'test-ravage', terrain: 'jungle', stage: 1 },
        },
      };
      // Add 2 explorers to D2 (jungle)
      state = {
        ...state,
        lands: {
          ...state.lands,
          D2: {
            ...state.lands['D2'],
            pieces: { ...state.lands['D2'].pieces, explorers: 2, towns: 0, cities: 0, dahan: 0 },
          },
        },
      };

      const result = resolveRavage(state);
      // 2 explorers = 2 damage, >= 2 so blight added
      expect(result.lands['D2'].pieces.blight).toBeGreaterThan(state.lands['D2'].pieces.blight);
    });

    it('dahan fight back after being damaged', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        invaders: {
          ...state.invaders,
          ravage: { id: 'test', terrain: 'sand', stage: 1 },
        },
      };
      // D4 is sand, put 1 explorer + 2 dahan
      state = {
        ...state,
        lands: {
          ...state.lands,
          D4: {
            ...state.lands['D4'],
            pieces: { ...EMPTY_PIECES, explorers: 1, dahan: 2 },
          },
        },
      };

      const result = resolveRavage(state);
      // 1 explorer = 1 damage, not enough to kill Dahan (2 HP)
      // Dahan fight back: 2 Dahan * 2 = 4 damage, kills the explorer
      expect(result.lands['D4'].pieces.explorers).toBe(0);
      expect(result.lands['D4'].pieces.dahan).toBe(2);
    });
  });

  describe('resolveBuild', () => {
    it('skips when no build card', () => {
      let state = initializeGame(undefined, 42);
      state = { ...state, invaders: { ...state.invaders, build: null } };
      const result = resolveBuild(state);
      expect(result.log.some(l => l.key.includes('No'))).toBe(true);
    });

    it('builds town when only explorers present', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        invaders: {
          ...state.invaders,
          build: { id: 'test', terrain: 'jungle', stage: 1 },
        },
      };
      // D2 is jungle, add explorers only
      state = {
        ...state,
        lands: {
          ...state.lands,
          D2: {
            ...state.lands['D2'],
            pieces: { ...EMPTY_PIECES, explorers: 2 },
          },
        },
      };

      const result = resolveBuild(state);
      expect(result.lands['D2'].pieces.towns).toBe(1);
    });

    it('builds city when town already present', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        invaders: {
          ...state.invaders,
          build: { id: 'test', terrain: 'jungle', stage: 1 },
        },
      };
      state = {
        ...state,
        lands: {
          ...state.lands,
          D2: {
            ...state.lands['D2'],
            pieces: { ...EMPTY_PIECES, explorers: 1, towns: 1 },
          },
        },
      };

      const result = resolveBuild(state);
      expect(result.lands['D2'].pieces.cities).toBe(1);
    });

    it('does not build in empty lands', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        invaders: {
          ...state.invaders,
          build: { id: 'test', terrain: 'jungle', stage: 1 },
        },
      };
      // D6 is jungle with no invaders
      state = {
        ...state,
        lands: {
          ...state.lands,
          D6: {
            ...state.lands['D6'],
            pieces: EMPTY_PIECES,
          },
        },
      };

      const result = resolveBuild(state);
      expect(result.lands['D6'].pieces.towns).toBe(0);
      expect(result.lands['D6'].pieces.cities).toBe(0);
    });
  });

  describe('resolveExplore', () => {
    it('adds explorer to coastal lands matching terrain', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        invaders: {
          ...state.invaders,
          explore: { id: 'test', terrain: 'wetland', stage: 1 },
        },
      };
      // D1 is coastal wetland, D3 is coastal wetland
      const result = resolveExplore(state);
      expect(result.lands['D1'].pieces.explorers).toBeGreaterThan(state.lands['D1'].pieces.explorers);
    });

    it('adds explorer to inland lands adjacent to towns/cities', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        invaders: {
          ...state.invaders,
          explore: { id: 'test', terrain: 'mountain', stage: 1 },
        },
      };
      // D5 is mountain, adjacent to D2 which has a city
      const result = resolveExplore(state);
      expect(result.lands['D5'].pieces.explorers).toBeGreaterThan(state.lands['D5'].pieces.explorers);
    });

    it('does not explore inland land without adjacent invader source', () => {
      let state = initializeGame(undefined, 42);
      state = {
        ...state,
        invaders: {
          ...state.invaders,
          explore: { id: 'test', terrain: 'mountain', stage: 1 },
        },
      };
      // Clear all invaders from lands adjacent to D8
      const cleanLands = { ...state.lands };
      for (const adjId of state.lands['D8'].adjacentLands) {
        const adj = cleanLands[adjId as string];
        if (adj) {
          cleanLands[adjId as string] = {
            ...adj,
            pieces: { ...adj.pieces, towns: 0, cities: 0 },
          };
        }
      }
      state = { ...state, lands: cleanLands };

      const result = resolveExplore(state);
      expect(result.lands['D8'].pieces.explorers).toBe(0);
    });
  });

  describe('advanceInvaderCards', () => {
    it('shifts cards: build→ravage, explore→build, deck→explore', () => {
      const state = initializeGame(undefined, 42);
      const oldExplore = state.invaders.explore;
      const oldBuild = state.invaders.build;

      const result = advanceInvaderCards(state);
      expect(result.invaders.ravage).toEqual(oldBuild);
      expect(result.invaders.build).toEqual(oldExplore);
      expect(result.invaders.explore).not.toBeNull();
    });

    it('draws from deck for new explore', () => {
      const state = initializeGame(undefined, 42);
      const deckSizeBefore = state.invaders.deck.length;

      const result = advanceInvaderCards(state);
      expect(result.invaders.deck.length).toBe(deckSizeBefore - 1);
    });
  });

  describe('applyDamageToInvaders', () => {
    it('kills explorers first (1 HP)', () => {
      const land = makeLand({
        id: 'test',
        pieces: { ...EMPTY_PIECES, explorers: 3 },
      });
      const result = applyDamageToInvaders(land, 2);
      expect(result.land.pieces.explorers).toBe(1);
      expect(result.fear).toBe(0);
    });

    it('destroys towns and generates 1 fear each', () => {
      const land = makeLand({
        id: 'test',
        pieces: { ...EMPTY_PIECES, towns: 2 },
      });
      const result = applyDamageToInvaders(land, 4);
      expect(result.land.pieces.towns).toBe(0);
      expect(result.fear).toBe(2);
    });

    it('destroys cities and generates 2 fear each', () => {
      const land = makeLand({
        id: 'test',
        pieces: { ...EMPTY_PIECES, cities: 1 },
      });
      const result = applyDamageToInvaders(land, 3);
      expect(result.land.pieces.cities).toBe(0);
      expect(result.fear).toBe(2);
    });

    it('prioritizes explorers → towns → cities', () => {
      const land = makeLand({
        id: 'test',
        pieces: { ...EMPTY_PIECES, explorers: 1, towns: 1, cities: 1 },
      });
      // 6 damage: 1 explorer (1) + 1 town (2) + 1 city (3) = 6
      const result = applyDamageToInvaders(land, 6);
      expect(result.land.pieces.explorers).toBe(0);
      expect(result.land.pieces.towns).toBe(0);
      expect(result.land.pieces.cities).toBe(0);
      expect(result.fear).toBe(3); // 1 (town) + 2 (city)
    });
  });
});
