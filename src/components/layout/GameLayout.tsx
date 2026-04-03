import { TopBar } from './TopBar';
import { PhaseTimeline } from './PhaseTimeline';
import { BottomPanel } from './BottomPanel';
import { IslandMap } from '../map/IslandMap';
import { PhaseActions } from '../phase/PhaseActions';
import { SpiritSelect } from '../spirit/SpiritSelect';
import { useGameStore } from '../../store/game-store';
import styles from './GameLayout.module.css';

export function GameLayout() {
  const showSpiritSelect = useGameStore(s => s.showSpiritSelect);

  return (
    <div className={styles.layout}>
      <TopBar />
      <PhaseTimeline />
      <IslandMap />
      <BottomPanel />
      <PhaseActions />
      {showSpiritSelect && <SpiritSelect />}
    </div>
  );
}
