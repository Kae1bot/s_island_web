import type { Land } from '../../models/land';
import { landId, boardId } from '../../models/land';

export const BOARD_D_ID = boardId('D');

export const BOARD_D_LANDS: readonly Land[] = [
  {
    id: landId('D1'),
    terrain: 'wetland',
    board: BOARD_D_ID,
    coastal: true,
    adjacentLands: [landId('D2'), landId('D5'), landId('D7'), landId('D8')],
    pieces: { explorers: 0, towns: 0, cities: 0, dahan: 2, blight: 0, presence: 0 },
  },
  {
    id: landId('D2'),
    terrain: 'jungle',
    board: BOARD_D_ID,
    coastal: true,
    adjacentLands: [landId('D1'), landId('D3'), landId('D4'), landId('D5')],
    pieces: { explorers: 0, towns: 0, cities: 1, dahan: 1, blight: 0, presence: 0 },
  },
  {
    id: landId('D3'),
    terrain: 'wetland',
    board: BOARD_D_ID,
    coastal: true,
    adjacentLands: [landId('D2'), landId('D4')],
    pieces: { explorers: 0, towns: 0, cities: 0, dahan: 0, blight: 0, presence: 0 },
  },
  {
    id: landId('D4'),
    terrain: 'sand',
    board: BOARD_D_ID,
    coastal: false,
    adjacentLands: [landId('D2'), landId('D3'), landId('D5'), landId('D6')],
    pieces: { explorers: 0, towns: 0, cities: 0, dahan: 0, blight: 0, presence: 0 },
  },
  {
    id: landId('D5'),
    terrain: 'mountain',
    board: BOARD_D_ID,
    coastal: false,
    adjacentLands: [landId('D1'), landId('D2'), landId('D4'), landId('D6'), landId('D7')],
    pieces: { explorers: 0, towns: 0, cities: 0, dahan: 1, blight: 1, presence: 0 },
  },
  {
    id: landId('D6'),
    terrain: 'jungle',
    board: BOARD_D_ID,
    coastal: false,
    adjacentLands: [landId('D4'), landId('D5'), landId('D7')],
    pieces: { explorers: 0, towns: 0, cities: 0, dahan: 0, blight: 0, presence: 0 },
  },
  {
    id: landId('D7'),
    terrain: 'sand',
    board: BOARD_D_ID,
    coastal: false,
    adjacentLands: [landId('D1'), landId('D5'), landId('D6'), landId('D8')],
    pieces: { explorers: 0, towns: 0, cities: 0, dahan: 2, blight: 0, presence: 0 },
  },
  {
    id: landId('D8'),
    terrain: 'mountain',
    board: BOARD_D_ID,
    coastal: false,
    adjacentLands: [landId('D1'), landId('D7')],
    pieces: { explorers: 0, towns: 0, cities: 0, dahan: 0, blight: 0, presence: 0 },
  },
];

/** Initial setup adds 1 Town to land 7 separately from the pieces above */
export function getBoardDInitialLands(): readonly Land[] {
  return BOARD_D_LANDS.map(land => {
    if (land.id === landId('D7')) {
      return { ...land, pieces: { ...land.pieces, towns: 1 } };
    }
    return land;
  });
}
