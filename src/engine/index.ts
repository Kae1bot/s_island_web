export { initializeGame } from './init';
export { advancePhase, canAdvance, getNextStep, getPhaseLabel } from './state-machine';
export {
  selectGrowth,
  placePresence,
  gainEnergy,
  playCard,
  canPlayCard,
  getCardPlayLimit,
  confirmCardPlays,
  unplayCard,
} from './spirit-phase';
export {
  resolveRavage,
  resolveBuild,
  resolveExplore,
  advanceInvaderCards,
  applyDamageToInvaders,
} from './invader-phase';
export { generateFear, resolveFearCards } from './fear';
export { checkVictoryDefeat } from './victory';
export {
  getUnresolvedPowers,
  beginResolvePower,
  cancelResolvePower,
  isResolvingPower,
} from './power-resolution';
export type { ResolvablePower } from './power-resolution';
export {
  applyTargetChoice,
  applyCardEffect,
  applyInnateEffect,
  applyPushChoice,
  applyGatherChoice,
  skipCurrentEffect,
  getPushablePieces,
  getGatherableSources,
} from './effects';
export {
  getValidTargetLands,
  getValidInnateLands,
  getAdjacentLandsWithPiece,
  getAdjacentLands,
  isSacredSite,
} from './targeting';
export { discardPlayedCards, resetTurn } from './cleanup';
