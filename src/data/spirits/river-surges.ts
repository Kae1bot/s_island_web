import type { SpiritDefinition } from '../../models/spirit';
import { spiritId } from '../../models/spirit';
import { powerCardId } from '../../models/power-card';

export const RIVER_SURGES: SpiritDefinition = {
  id: spiritId('river-surges-in-sunlight'),
  name: 'River Surges in Sunlight',
  setupDescription: 'Put 1 Presence on your starting board in the highest-numbered Wetland.',
  initialPresenceTerrain: 'wetland',

  specialRules: [
    {
      name: "River's Domain",
      description: 'Your Presence in Wetlands counts as a Sacred Site.',
      effect: { type: 'presence_is_sacred_site', terrain: 'wetland' },
    },
  ],

  growthOptions: [
    {
      id: 'growth-1',
      label: 'Reclaim Cards + Gain Power Card + Gain 1 Energy',
      actions: [
        { type: 'reclaim_all' },
        { type: 'gain_power_card' },
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
      { index: 2, value: 2 },
      { index: 3, value: 3 },
      { index: 4, value: 4 },
      { index: 5, value: 4 },
      { index: 6, value: 5 },
    ],
    cardPlay: [
      { index: 0, value: 1 },
      { index: 1, value: 2 },
      { index: 2, value: 2 },
      { index: 3, value: 3 },
      { index: 4, value: 3, special: 'reclaim_one' },
      { index: 5, value: 4 },
      { index: 6, value: 5 },
    ],
  },

  innateAbilities: [
    {
      id: 'massive-flooding',
      name: 'Massive Flooding',
      speed: 'slow',
      targeting: {
        range: 1,
        sourceRequirement: 'sacred-site',
      },
      levels: [
        {
          threshold: { sun: 1, water: 2 },
          description: 'Push 1 Explorer / Town.',
        },
        {
          threshold: { sun: 2, water: 3 },
          description: '2 Damage instead. Push up to 3 Explorers / Towns.',
        },
        {
          threshold: { sun: 3, water: 4, earth: 1 },
          description: '2 Damage to each Invader.',
        },
      ],
    },
  ],

  startingCards: [
    powerCardId('boon-of-vigor'),
    powerCardId('flash-floods'),
    powerCardId('rivers-bounty'),
    powerCardId('wash-away'),
  ],
};
