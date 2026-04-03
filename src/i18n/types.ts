/** All translation keys used in the app. Add new keys here — TypeScript
 *  will flag any language file that's missing them. */
export interface Translations {
  // ── General ──────────────────────────────────
  turn: string;
  energy: string;
  energyShort: string;
  cards: string;
  perTurn: string;
  cardPlays: string;
  undo: string;
  newGame: string;
  selectSpirit: string;
  startGame: string;
  victory: string;
  defeat: string;
  settings: string;
  language: string;

  // ── Tabs ──────────────────────────────────────
  tabCards: string;
  tabSpirit: string;
  tabInvader: string;
  tabLog: string;

  // ── Phase labels ──────────────────────────────
  phaseSelectGrowth: string;
  phasePresence: string;
  phaseGainEnergy: string;
  phasePlayCards: string;
  phaseResolveFear: string;
  phaseResolveFast: string;
  phaseRavage: string;
  phaseBuild: string;
  phaseExplore: string;
  phaseAdvanceCards: string;
  phaseResolveSlow: string;
  phaseDiscard: string;
  phaseReset: string;

  // ── Phase timeline group labels ───────────────
  groupSpirit: string;
  groupFast: string;
  groupInvader: string;
  groupSlow: string;
  groupClean: string;

  // ── Phase timeline step short labels ──────────
  stepGrowth: string;
  stepPresence: string;
  stepEnergy: string;
  stepCards: string;
  stepFear: string;
  stepPowers: string;
  stepRavage: string;
  stepBuild: string;
  stepExplore: string;
  stepAdvance: string;
  stepDiscard: string;
  stepReset: string;

  // ── Hand area ─────────────────────────────────
  playedThisTurn: string;
  hintTapCancel: string;
  hintTapResolve: string;
  hintTapAgainCancel: string;
  handCount: string;          // "Hand ({0} cards)"
  noCardsInHand: string;
  discardCount: string;       // "Discard ({0})"

  // ── Phase actions ─────────────────────────────
  growthReclaim: string;
  growthReclaimSub: string;
  growthPresence: string;
  growthPresenceSub: string;
  growthGainCard: string;
  growthGainCardSub: string;
  placePresenceHint: string;  // "Place Presence ({0} remaining, Range {1})"
  selectTrackHint: string;
  energyTrack: string;
  cardPlayTrack: string;
  fromTrackSelectLand: string; // "From {0} track — select land (Range {1}):"
  back: string;
  gainEnergyAction: string;
  donePlayingCards: string;
  resolveFearCards: string;
  tapCardToResolve: string;   // "Tap a card above to resolve ({0} remaining)"
  skipAllAdvance: string;     // "Skip All — Advance Past {0} Powers"
  doneAdvance: string;        // "Done — Advance Past {0} Powers"
  resolveRavage: string;
  resolveBuild: string;
  resolveExplore: string;
  advanceInvaderCards: string;
  discardPlayedCards: string;
  startNextTurn: string;
  resolvingEffect: string;
  selectTargetLand: string;   // "{0} — Select target land:"
  pushFrom: string;           // "Push from {0} ({1} remaining)"
  pushTo: string;             // "Push {0} to:"
  gatherTo: string;           // "Gather to {0} ({1} remaining)"
  skip: string;
  fast: string;
  slow: string;

  // ── Spirit panel ──────────────────────────────
  elements: string;
  riversDomain: string;
  riversDomainText: string;
  massiveFlooding: string;

  // ── Settings ───────────────────────────────────
  settingsAudio: string;
  music: string;
  sfx: string;
  settingsGameplay: string;
  autoConfirm: string;
  autoConfirmDesc: string;
  showDamageNumbers: string;
  settingsDisplay: string;
  animationSpeed: string;
  animOff: string;
  animFast: string;
  animNormal: string;
  resetSettings: string;

  // ── Invader track ─────────────────────────────
  ravage: string;
  build: string;
  explore: string;
  deck: string;
  explorers: string;
  towns: string;
  cities: string;
  blight: string;
  stage: string;              // "Stage {0}"

  // ── Game log ──────────────────────────────────

  logGameStarted: string;

  // Spirit phase
  logSelectedGrowth: string;
  logReclaimAll: string;
  logGainEnergyGrowth: string;
  logGainPowerCard: string;
  logAddPresence: string;
  logPlacedPresence: string;
  logReclaimOne: string;
  logGainedEnergy: string;
  logPlayedCard: string;
  logReturnedCard: string;
  logCardPlayComplete: string;

  // Fear
  logGeneratedFear: string;    // "Generated {0} fear"
  logEarnedFearCard: string;   // "Earned fear card: {0}"
  logTerrorLevelUp: string;    // "Terror level advanced to {0}"
  logNoFearCards: string;
  logFearCardResolved: string; // "Fear card resolved: {0} (Terror {1})"

  // Invader phase
  logNoRavage: string;
  logRavage: string;           // "Ravage in {0}"
  logDefend: string;           // "Land {0}: Defend {1}, raw {2} → {3}"
  logInvaderDamage: string;    // "Land {0}: Invaders deal {1} damage"
  logDahanDestroyed: string;   // "{0} Dahan destroyed"
  logBlightAdded: string;      // "Blight added to {0}"
  logBlightFlipped: string;
  logDahanFightBack: string;   // "Dahan fight back: {0} damage"
  logNoBuild: string;
  logBuild: string;            // "Build in {0}"
  logBuiltCity: string;        // "City built in {0}"
  logBuiltTown: string;        // "Town built in {0}"
  logNoExplore: string;
  logExplore: string;          // "Explore in {0}"
  logExplorerAdded: string;    // "Explorer added to {0}"
  logCardsAdvanced: string;
  logNewExplore: string;       // "New explore card: {0} (Stage {1})"
  logDeckExhausted: string;
  logDefeatDeckExhausted: string;

  // Power resolution
  logCancelResolve: string;
  logResolvingCard: string;    // "Resolving {0}"
  logNoValidTargets: string;   // "No valid targets for {0}"
  logSelectTarget: string;     // "Select target for {0}"
  logThresholdNotMet: string;  // "Threshold not met for {0}"
  logInnateThresholdMet: string; // "Innate {0}: threshold met (level {1})"

  // Card effects
  logBoonOfVigor: string;
  logNoValidTarget: string;    // "No valid target for {0}"
  logDamageInLand: string;     // "{0}: {1} damage in {2}"
  logRiversBountySuccess: string;
  logRiversBountyFail: string;
  logUncannyFear: string;      // "Uncanny Melting: 1 fear in {0}"
  logRemovedBlight: string;    // "{0}: removed blight from {1}"
  logDefendInLand: string;     // "{0}: Defend {1} in {2}"
  logFearAndDamage: string;    // "{0}: {1} fear, {2} damage in {3}"
  logNoPresence: string;       // "{0}: no presence in {1}"
  logNoBlight: string;         // "{0}: no blight in {1}"
  logTsunami: string;          // "Tsunami in {0}: destroyed {1} Dahan"
  logTsunamiThreshold: string; // "Tsunami threshold: {0}"
  logShatterHomesteads: string; // "Shatter Homesteads in {0}: destroyed 1 town"
  logShatterNoTown: string;     // "Shatter Homesteads in {0}: no town to destroy"
  logRagingStorm: string;       // "Raging Storm in {0}: destroyed {1} explorers"
  logThunderingDestruction: string; // "Thundering Destruction in {0}: {1} damage"
  logNotImplemented: string;   // "Effect not implemented: {0}"
  logFloodingLv3: string;      // "Flooding Lv3 in {0}: {1} explorers, {2} towns"
  logFloodingLv2: string;      // "Flooding Lv2: 2 damage in {0}"
  logFloodingLv1: string;      // "Flooding Lv1 in {0}"
  logPushed: string;           // "Pushed {0} from {1} to {2}"
  logGathered: string;         // "Gathered {0} from {1} to {2}"
  logSkippedEffect: string;    // "Skipped {0}"

  // Cleanup
  logDiscarded: string;
  logNewTurn: string;          // "New turn: {0}"

  // Victory / Defeat
  logVictory: string;
  logDefeat: string;
  logDefeatBlight: string;
  logDefeatPresence: string;
  logVictoryTerror3: string;
  logVictoryTerror2: string;
  logVictoryTerror1: string;
  logVictoryFearDeck: string;
}

export type TranslationKey = keyof Translations;
export type Locale = 'en' | 'zh';
