import { useState } from 'react';
import { HandArea } from '../cards/HandArea';
import { SpiritPanel } from '../spirit/SpiritPanel';
import { InvaderTrack } from '../invader/InvaderTrack';
import { GameLog } from '../shared/GameLog';
import { useT } from '../../i18n';
import type { TranslationKey } from '../../i18n';
import styles from './BottomPanel.module.css';

type Tab = 'cards' | 'spirit' | 'invader' | 'log';

const TABS: { key: Tab; labelKey: TranslationKey }[] = [
  { key: 'cards', labelKey: 'tabCards' },
  { key: 'spirit', labelKey: 'tabSpirit' },
  { key: 'invader', labelKey: 'tabInvader' },
  { key: 'log', labelKey: 'tabLog' },
];

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('cards');
  const { t } = useT();

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {activeTab === 'cards' && <HandArea />}
        {activeTab === 'spirit' && <SpiritPanel />}
        {activeTab === 'invader' && <InvaderTrack />}
        {activeTab === 'log' && <GameLog />}
      </div>
    </div>
  );
}
