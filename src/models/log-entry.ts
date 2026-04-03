/** Structured log entry: key + substitution params.
 *  Rendered at display time via the i18n system. */
export interface LogEntry {
  readonly key: string;
  readonly params?: readonly (string | number)[];
}

/** Helper to create a LogEntry concisely in engine code. */
export function logMsg(key: string, ...params: (string | number)[]): LogEntry {
  return params.length > 0 ? { key, params } : { key };
}
