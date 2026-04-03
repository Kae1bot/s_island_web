import type { SpiritDefinition } from '../../models/spirit';
import { spiritId } from '../../models/spirit';
import { powerCardId } from '../../models/power-card';

export const LIGHTNING_SWIFT_STRIKE: SpiritDefinition = {
  id: spiritId('lightnings-swift-strike'),
  name: "Lightning's Swift Strike",
  setupDescription: 'Put 1 Presence on your starting board in the highest-numbered Mountain.',
  initialPresenceTerrain: 'mountain',

  specialRules: [
    {
      name: 'Swiftness of Lightning',
      description: 'You may use Slow Powers as if they were Fast Powers.',
    },
  ],

  growthOptions: [
    {
      id: 'growth-1',
      label: 'Reclaim Cards + Gain 1 Energy',
      actions: [
        { type: 'reclaim_all' },
        { type: 'gain_energy', amount: 1 },
      ],
    },
    {
      id: 'growth-2',
      label: 'Add Presence (Range 1) + Add Presence (Range 1)',
      actions: [
        { type: 'add_presence', range: 1 },
        { type: 'add_presence', range: 1 },
      ],
    },
    {
      id: 'growth-3',
      label: 'Gain Power Card + Add Presence (Range 2)',
      actions: [
        { type: 'gain_power_card' },
        { type: 'add_presence', range: 2 },
      ],
    },
  ],

  presenceTrack: {
    energy: [
      { index: 0, value: 1 },
      { index: 1, value: 2 },
      { index: 2, value: 3 },
      { index: 3, value: 3 },
      { index: 4, value: 4 },
      { index: 5, value: 4 },
      { index: 6, value: 5 },
    ],
    cardPlay: [
      { index: 0, value: 2 },
      { index: 1, value: 3 },
      { index: 2, value: 3 },
      { index: 3, value: 4, special: 'reclaim_one' },
      { index: 4, value: 4 },
      { index: 5, value: 5 },
      { index: 6, value: 6 },
    ],
  },

  innateAbilities: [
    {
      id: 'thundering-destruction',
      name: 'Thundering Destruction',
      speed: 'fast',
      targeting: {
        range: 1,
        sourceRequirement: 'sacred-site',
      },
      levels: [
        {
          threshold: { fire: 1, air: 1 },
          description: '2 Damage.',
        },
        {
          threshold: { fire: 3, air: 3 },
          description: '+1 Damage.',
        },
        {
          threshold: { fire: 4, air: 3, water: 1 },
          description: '+2 Damage.',
        },
      ],
    },
  ],

  startingCards: [
    powerCardId('lightnings-bolt'),
    powerCardId('harbingers-of-the-lightning'),
    powerCardId('shatter-homesteads'),
    powerCardId('raging-storm'),
  ],
};
