import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/game-store';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n/types';
import type { LogEntry } from '../../models/log-entry';
import styles from './GameLog.module.css';

export function GameLog() {
  const log = useGameStore(s => s.gameState.log);
  const { t } = useT();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  // Show last 50 entries
  const visible = log.slice(-50);

  return (
    <div className={styles.container}>
      {visible.map((entry, i) => (
        <div key={log.length - 50 + i} className={styles.entry}>
          {renderLogEntry(entry, t)}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function renderLogEntry(
  entry: LogEntry,
  t: (key: TranslationKey, ...args: (string | number)[]) => string,
): string {
  const params = entry.params ?? [];
  return t(entry.key as TranslationKey, ...params);
}
