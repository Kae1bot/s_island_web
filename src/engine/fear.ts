import type { GameState } from '../models/game-state';
import type { FearState } from '../models/fear';
import { logMsg, type LogEntry } from '../models/log-entry';

const FEAR_CARDS_PER_TERROR_LEVEL = 3;

export function generateFear(state: GameState, amount: number): GameState {
  const fear = state.fear;
  let totalFear = fear.generatedFear + amount;
  let earnedCards = [...fear.earnedCards];
  let fearDeck = [...fear.fearDeck];
  let terrorLevel = fear.terrorLevel;
  const log: LogEntry[] = [logMsg('logGeneratedFear', amount)];

  // Each time we fill the fear pool (fearPerCard), earn a fear card
  while (totalFear >= fear.fearPerCard && fearDeck.length > 0) {
    totalFear -= fear.fearPerCard;
    const card = fearDeck[0];
    fearDeck = fearDeck.slice(1);
    earnedCards = [...earnedCards, card];
    log.push(logMsg('logEarnedFearCard', card.name));

    // Check terror level advancement
    const totalEarned = fear.discardedFearCards.length + earnedCards.length;
    if (totalEarned >= FEAR_CARDS_PER_TERROR_LEVEL * 2 && terrorLevel < 3) {
      terrorLevel = 3;
      log.push(logMsg('logTerrorLevelUp', 3));
    } else if (totalEarned >= FEAR_CARDS_PER_TERROR_LEVEL && terrorLevel < 2) {
      terrorLevel = 2;
      log.push(logMsg('logTerrorLevelUp', 2));
    }
  }

  const newFear: FearState = {
    ...fear,
    generatedFear: totalFear,
    earnedCards,
    fearDeck,
    terrorLevel,
  };

  return {
    ...state,
    fear: newFear,
    log: [...state.log, ...log],
  };
}

export function resolveFearCards(state: GameState): GameState {
  if (state.fear.earnedCards.length === 0) {
    return {
      ...state,
      log: [...state.log, logMsg('logNoFearCards')],
    };
  }

  const log: LogEntry[] = [];
  const resolvedCards = [...state.fear.earnedCards];

  for (const card of resolvedCards) {
    log.push(logMsg('logFearCardResolved', card.name, state.fear.terrorLevel));
  }

  return {
    ...state,
    fear: {
      ...state.fear,
      earnedCards: [],
      discardedFearCards: [...state.fear.discardedFearCards, ...resolvedCards],
    },
    log: [...state.log, ...log],
  };
}

// getFearCardEffect is unused now — fear card resolution is logged via logMsg
