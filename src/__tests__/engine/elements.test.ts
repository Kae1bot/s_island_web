import { describe, it, expect } from 'vitest';
import { sumElements, meetsThreshold } from '../../models/elements';

describe('sumElements', () => {
  it('sums multiple element maps', () => {
    const result = sumElements(
      { sun: 1, water: 2 },
      { water: 1, earth: 1 },
    );
    expect(result).toEqual({ sun: 1, water: 3, earth: 1 });
  });

  it('returns empty for no inputs', () => {
    expect(sumElements()).toEqual({});
  });
});

describe('meetsThreshold', () => {
  it('returns true when threshold is met', () => {
    expect(meetsThreshold({ sun: 3, water: 4 }, { sun: 2, water: 3 })).toBe(true);
  });

  it('returns false when threshold is not met', () => {
    expect(meetsThreshold({ sun: 1, water: 4 }, { sun: 2, water: 3 })).toBe(false);
  });

  it('returns true for empty threshold', () => {
    expect(meetsThreshold({ sun: 1 }, {})).toBe(true);
  });

  it('returns false when element is missing', () => {
    expect(meetsThreshold({}, { sun: 1 })).toBe(false);
  });
});
