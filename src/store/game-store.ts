import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameState } from '../models/game-state';
import type { PowerCardId } from '../models/power-card';
import type { PieceType } from '../models/targeting';
import type { PresenceTrack, SpiritId } from '../models/spirit';
import {
  initializeGame,
  selectGrowth,
  placePresence,
  gainEnergy,
  playCard,
  unplayCard,
  confirmCardPlays,
  resolveFearCards,
  resolveRavage,
  resolveBuild,
  resolveExplore,
  advanceInvaderCards,
  discardPlayedCards,
  resetTurn,
  checkVictoryDefeat,
  advancePhase,
  applyTargetChoice,
  applyCardEffect,
  applyInnateEffect,
  applyPushChoice,
  applyGatherChoice,
  skipCurrentEffect,
  beginResolvePower,
  cancelResolvePower,
} from '../engine';

interface GameActions {
  newGame: (spiritId?: SpiritId, seed?: number) => void;
  openSpiritSelect: () => void;

  // Spirit phase
  selectGrowth: (growthId: string) => void;
  placePresence: (landId: string, track: PresenceTrack) => void;
  gainEnergy: () => void;
  playCard: (cardId: PowerCardId) => void;
  unplayCard: (cardId: PowerCardId) => void;
  confirmCardPlays: () => void;

  // Fast / Slow powers
  resolveFearCards: () => void;
  beginResolvePower: (powerId: string) => void;
  cancelResolvePower: (powerId: string) => void;
  advancePowerPhase: () => void;

  // Invader phase
  resolveRavage: () => void;
  resolveBuild: () => void;
  resolveExplore: () => void;
  advanceInvaderCards: () => void;

  // Targeting / effect resolution
  selectTarget: (landId: string) => void;
  pushChoice: (pieceType: PieceType, destinationLandId: string) => void;
  gatherChoice: (sourceLandId: string, pieceType: PieceType) => void;
  skipEffect: () => void;
  resolveNextEffect: () => void;

  // Cleanup
  discardPlayedCards: () => void;
  resetTurn: () => void;

  // Meta
  undo: () => void;

  // Internal
  _undoStack: GameState[];
  _pushUndo: () => void;
}

export type GameStore = { gameState: GameState; showSpiritSelect: boolean } & GameActions;

const MAX_UNDO = 20;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      function update(fn: (s: GameState) => GameState, pushUndo = true) {
        if (pushUndo) get()._pushUndo();
        set(prev => {
          const next = fn(prev.gameState);
          return { gameState: checkVictoryDefeat(next) };
        });
      }

      /** Apply effect fn. During power resolution phases, don't auto-advance
       *  (player picks next power manually). Otherwise advance when queue empties. */
      function updateEffect(fn: (s: GameState) => GameState) {
        update(s => {
          const result = fn(s);
          if (result.pendingEffects.length > 0) return result;
          // During power resolution phases, return to selection screen
          if (result.phaseStep === 'RESOLVE_FAST' || result.phaseStep === 'RESOLVE_SLOW') {
            return result;
          }
          return advancePhase(result);
        });
      }

      return {
        gameState: initializeGame(),
        showSpiritSelect: true,
        _undoStack: [],

        _pushUndo: () => {
          set(prev => ({
            _undoStack: [...prev._undoStack.slice(-(MAX_UNDO - 1)), prev.gameState],
          }));
        },

        newGame: (selectedSpirit, seed) => set({
          gameState: initializeGame(selectedSpirit, seed),
          showSpiritSelect: false,
          _undoStack: [],
        }),

        openSpiritSelect: () => set({ showSpiritSelect: true }),

        selectGrowth: (growthId) => update(s => selectGrowth(s, growthId)),
        placePresence: (landId, track) => update(s => placePresence(s, landId, track)),
        gainEnergy: () => update(s => gainEnergy(s)),
        playCard: (cardId) => update(s => playCard(s, cardId)),
        unplayCard: (cardId) => update(s => unplayCard(s, cardId)),
        confirmCardPlays: () => update(s => confirmCardPlays(s)),

        resolveFearCards: () => update(s => advancePhase(resolveFearCards(s))),
        beginResolvePower: (powerId) => updateEffect(s => beginResolvePower(s, powerId)),
        cancelResolvePower: (powerId) => update(s => cancelResolvePower(s, powerId)),
        advancePowerPhase: () => update(s => {
          return advancePhase({ ...s, resolvedPowerIds: [] });
        }),

        resolveRavage: () => update(s => advancePhase(resolveRavage(s))),
        resolveBuild: () => update(s => advancePhase(resolveBuild(s))),
        resolveExplore: () => update(s => advancePhase(resolveExplore(s))),
        advanceInvaderCards: () => update(s => advancePhase(advanceInvaderCards(s))),

        // Targeting / effect resolution
        selectTarget: (landId) => updateEffect(s => applyTargetChoice(s, landId)),
        pushChoice: (pieceType, destinationLandId) => updateEffect(s => applyPushChoice(s, pieceType, destinationLandId)),
        gatherChoice: (sourceLandId, pieceType) => updateEffect(s => applyGatherChoice(s, sourceLandId, pieceType)),
        skipEffect: () => updateEffect(s => skipCurrentEffect(s)),
        resolveNextEffect: () => updateEffect(s => {
          let state = s;
          while (state.pendingEffects.length > 0) {
            const current = state.pendingEffects[0];
            if (current.type === 'APPLY_CARD_EFFECT') {
              state = applyCardEffect(state);
            } else if (current.type === 'APPLY_INNATE_EFFECT') {
              state = applyInnateEffect(state);
            } else {
              break; // needs user input
            }
          }
          return state;
        }),

        discardPlayedCards: () => update(s => advancePhase(discardPlayedCards(s))),
        resetTurn: () => update(s => resetTurn(s)),

        undo: () => {
          const stack = get()._undoStack;
          if (stack.length === 0) return;
          const prev = stack[stack.length - 1];
          set({
            gameState: prev,
            _undoStack: stack.slice(0, -1),
          });
        },
      };
    },
    {
      name: 'spirit-island-save-v1',
      partialize: (state) => ({ gameState: state.gameState }),
    },
  ),
);
