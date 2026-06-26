import * as migration_20260626_132837_initial from './20260626_132837_initial';

export const migrations = [
  {
    up: migration_20260626_132837_initial.up,
    down: migration_20260626_132837_initial.down,
    name: '20260626_132837_initial'
  },
];
