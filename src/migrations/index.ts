import * as migration_20260626_132837_initial from './20260626_132837_initial';
import * as migration_20260626_173027_community_richtext_indexes from './20260626_173027_community_richtext_indexes';

export const migrations = [
  {
    up: migration_20260626_132837_initial.up,
    down: migration_20260626_132837_initial.down,
    name: '20260626_132837_initial',
  },
  {
    up: migration_20260626_173027_community_richtext_indexes.up,
    down: migration_20260626_173027_community_richtext_indexes.down,
    name: '20260626_173027_community_richtext_indexes'
  },
];
