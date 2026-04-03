export type Element =
  | 'sun'
  | 'moon'
  | 'fire'
  | 'water'
  | 'earth'
  | 'plant'
  | 'animal'
  | 'air';

export type ElementMap = Readonly<Partial<Record<Element, number>>>;

export function sumElements(...maps: ElementMap[]): ElementMap {
  const result: Partial<Record<Element, number>> = {};
  for (const map of maps) {
    for (const [el, count] of Object.entries(map)) {
      const key = el as Element;
      result[key] = (result[key] ?? 0) + (count ?? 0);
    }
  }
  return result;
}

export function meetsThreshold(
  current: ElementMap,
  threshold: ElementMap,
): boolean {
  for (const [el, required] of Object.entries(threshold)) {
    if ((current[el as Element] ?? 0) < (required ?? 0)) {
      return false;
    }
  }
  return true;
}
