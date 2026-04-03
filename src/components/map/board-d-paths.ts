/**
 * Board D SVG path data.
 * Simplified geometric representation of 8 irregular lands.
 * Coordinates designed for a 400x400 viewBox.
 */

export interface LandSvgData {
  readonly id: string;
  readonly path: string;
  readonly centroid: { x: number; y: number };
}

export const BOARD_D_SVG: readonly LandSvgData[] = [
  {
    id: 'D1',
    path: 'M 30 50 L 120 30 L 160 80 L 140 150 L 80 160 L 20 120 Z',
    centroid: { x: 90, y: 95 },
  },
  {
    id: 'D2',
    path: 'M 120 30 L 240 20 L 260 70 L 230 140 L 160 130 L 160 80 Z',
    centroid: { x: 195, y: 78 },
  },
  {
    id: 'D3',
    path: 'M 240 20 L 360 30 L 370 100 L 310 140 L 260 70 Z',
    centroid: { x: 308, y: 72 },
  },
  {
    id: 'D4',
    path: 'M 260 70 L 310 140 L 300 210 L 230 230 L 190 180 L 230 140 Z',
    centroid: { x: 253, y: 165 },
  },
  {
    id: 'D5',
    path: 'M 160 80 L 160 130 L 230 140 L 190 180 L 140 220 L 80 200 L 80 160 L 140 150 Z',
    centroid: { x: 150, y: 170 },
  },
  {
    id: 'D6',
    path: 'M 190 180 L 230 230 L 220 310 L 160 310 L 130 260 L 140 220 Z',
    centroid: { x: 178, y: 260 },
  },
  {
    id: 'D7',
    path: 'M 80 160 L 80 200 L 140 220 L 130 260 L 70 300 L 20 270 L 20 200 Z',
    centroid: { x: 77, y: 235 },
  },
  {
    id: 'D8',
    path: 'M 20 120 L 80 160 L 20 200 Z',
    centroid: { x: 40, y: 160 },
  },
];

export const OCEAN_PATH = 'M 0 0 L 400 0 L 400 20 L 360 30 L 240 20 L 120 30 L 30 50 L 20 120 L 0 100 Z';
export const BOARD_VIEWBOX = '0 0 400 340';
