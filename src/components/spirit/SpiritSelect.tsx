import { useState } from 'react';
import { useGameStore } from '../../store/game-store';
import { getAllSpiritIds, getSpiritDefinition } from '../../data/spirits';
import { getSpiritName } from '../../i18n/cards';
import { useT } from '../../i18n';
import type { SpiritId } from '../../models/spirit';
import styles from './SpiritSelect.module.css';

export function SpiritSelect() {
  const { t, locale } = useT();
  const newGame = useGameStore(s => s.newGame);
  const spiritIds = getAllSpiritIds();
  const [selected, setSelected] = useState<SpiritId>(spiritIds[0]);

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <div className={styles.title}>{t('selectSpirit')}</div>
        </div>

        <div className={styles.body}>
          {spiritIds.map(id => {
            const def = getSpiritDefinition(id);
            const name = getSpiritName(id as string, locale) ?? def.name;
            const isSelected = id === selected;
            return (
              <div
                key={id as string}
                className={`${styles.card} ${isSelected ? styles.selected : ''}`}
                onClick={() => setSelected(id)}
              >
                <div className={styles.cardName}>{name}</div>
                <div className={styles.cardSetup}>{def.setupDescription}</div>
                {def.specialRules[0] && (
                  <div className={styles.cardSpecial}>{def.specialRules[0].name}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <button className={styles.startBtn} onClick={() => newGame(selected)}>
            {t('startGame')}
          </button>
        </div>
      </div>
    </div>
  );
}
