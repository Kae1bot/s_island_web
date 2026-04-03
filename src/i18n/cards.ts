import type { Locale } from './types';

interface CardText {
  readonly name: string;
  readonly description: string;
  readonly threshold?: string;
}

/** Card translations keyed by card ID then locale.
 *  To add a new language, add entries under the new locale key.
 *  English falls back to the card data itself, so only non-en locales need entries. */
const CARD_TEXTS: Record<string, Partial<Record<Locale, CardText>>> = {
  // ── Unique Powers (River Surges) ──────────────
  'boon-of-vigor': {
    zh: {
      name: '活力祝福',
      description: '若以自身为目标，获得1能量。若以其他精灵为目标，该精灵每打出1张能力卡便获得1能量。',
    },
  },
  'flash-floods': {
    zh: {
      name: '山洪暴发',
      description: '造成1点伤害。若目标地域为沿海地域，额外+1伤害。',
    },
  },
  'rivers-bounty': {
    zh: {
      name: '河流的恩赐',
      description: '聚集至多2个达罕。若现在有2个或更多达罕，增加1个达罕并获得1能量。',
    },
  },
  'wash-away': {
    zh: {
      name: '冲刷殆尽',
      description: '推出至多3个探索者/城镇。',
    },
  },

  // ── Unique Powers (Lightning's Swift Strike) ──
  'lightnings-bolt': {
    zh: {
      name: '闪电之矢',
      description: '造成1点伤害。',
    },
  },
  'harbingers-of-the-lightning': {
    zh: {
      name: '闪电的先兆',
      description: '推出至多2个达罕。',
    },
  },
  'shatter-homesteads': {
    zh: {
      name: '粉碎家园',
      description: '产生1恐惧。摧毁1个城镇。',
    },
  },
  'raging-storm': {
    zh: {
      name: '狂暴风暴',
      description: '对每个侵略者造成1点伤害。',
    },
  },

  // ── Minor Powers ──────────────────────────────
  'uncanny-melting': {
    zh: {
      name: '诡异融化',
      description: '若有侵略者存在，产生1恐惧。若目标地域为沙地或湿地，移除1荒芜。',
    },
  },
  'natures-resilience': {
    zh: {
      name: '自然的韧性',
      description: '防御6。若你拥有2水元素：可以改为移除1荒芜。',
      threshold: '可以改为移除1荒芜。',
    },
  },
  'pull-beneath-the-hungry-earth': {
    zh: {
      name: '饥饿大地之下',
      description: '若你的圣地在目标地域中，产生1恐惧并造成1伤害。若目标地域为沙地或湿地，额外+1伤害。',
    },
  },
  'song-of-sanctity': {
    zh: {
      name: '圣洁之歌',
      description: '若有探索者存在，推出全部探索者。否则，移除1荒芜。',
    },
  },
  'encompassing-ward': {
    zh: {
      name: '全面守护',
      description: '目标精灵在其每个地域提供防御2。',
    },
  },

  // ── Major Powers ──────────────────────────────
  'accelerated-rot': {
    zh: {
      name: '加速腐朽',
      description: '产生2恐惧。造成4伤害。',
      threshold: '改为：产生2恐惧。造成5伤害。移除1荒芜。',
    },
  },
  'tsunami': {
    zh: {
      name: '海啸',
      description: '产生2恐惧。造成8伤害。摧毁2个达罕。',
      threshold: '在同一版图的每个其他沿海地域：产生1恐惧，造成4伤害，摧毁1个达罕。',
    },
  },
};

/** Innate ability translations */
const INNATE_TEXTS: Record<string, Partial<Record<Locale, {
  readonly name: string;
  readonly levels: readonly string[];
}>>> = {
  'massive-flooding': {
    zh: {
      name: '大洪水',
      levels: [
        '推出1个探索者/城镇。',
        '改为造成2伤害。推出至多3个探索者/城镇。',
        '对每个侵略者造成2伤害。',
      ],
    },
  },
  'thundering-destruction': {
    zh: {
      name: '雷霆破坏',
      levels: [
        '造成2点伤害。',
        '+1伤害。',
        '+2伤害。',
      ],
    },
  },
};

/** Get localized card text. Returns undefined if no translation exists (fallback to English data). */
export function getCardText(cardId: string, locale: Locale): CardText | undefined {
  return CARD_TEXTS[cardId]?.[locale];
}

/** Get localized innate text. */
export function getInnateText(innateId: string, locale: Locale) {
  return INNATE_TEXTS[innateId]?.[locale];
}

/** Speed label */
export function getSpeedLabel(speed: 'fast' | 'slow', locale: Locale): string {
  if (locale === 'zh') return speed === 'fast' ? '快速' : '慢速';
  return speed === 'fast' ? 'FAST' : 'SLOW';
}

/** Threshold label */
export function getThresholdLabel(locale: Locale): string {
  if (locale === 'zh') return '阈值：';
  return 'Threshold:';
}

/** Innate badge label */
export function getInnateBadgeLabel(locale: Locale): string {
  if (locale === 'zh') return '固有';
  return 'Innate';
}

/** Spirit name translations */
const SPIRIT_NAMES: Record<string, Partial<Record<Locale, string>>> = {
  'river-surges-in-sunlight': { zh: '阳光下的奔腾之河' },
  'lightnings-swift-strike': { zh: '疾速闪电' },
};

export function getSpiritName(spiritId: string, locale: Locale): string | undefined {
  return SPIRIT_NAMES[spiritId]?.[locale];
}
