import type { PowerCardId } from './power-card';

export type PieceType = 'explorers' | 'towns' | 'cities' | 'dahan' | 'presence' | 'blight';

export type PendingEffect =
  | {
      readonly type: 'SELECT_TARGET';
      readonly cardId: PowerCardId;
      readonly source: 'card' | 'innate';
      readonly validLands: readonly string[];
    }
  | {
      readonly type: 'APPLY_CARD_EFFECT';
      readonly cardId: PowerCardId;
      readonly targetLand: string;
    }
  | {
      readonly type: 'APPLY_INNATE_EFFECT';
      readonly innateId: string;
      readonly level: number;
      readonly targetLand: string;
    }
  | {
      readonly type: 'PUSH';
      readonly targetLand: string;
      readonly pieceTypes: readonly PieceType[];
      readonly remaining: number;
      readonly optional: boolean;
    }
  | {
      readonly type: 'GATHER';
      readonly targetLand: string;
      readonly pieceTypes: readonly PieceType[];
      readonly remaining: number;
      readonly optional: boolean;
    };
