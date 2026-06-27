import * as migration_20260626_132837_initial from './20260626_132837_initial';
import * as migration_20260626_173027_community_richtext_indexes from './20260626_173027_community_richtext_indexes';
import * as migration_20260627_000713_phase3_founder_accounts from './20260627_000713_phase3_founder_accounts';
import * as migration_20260627_032301 from './20260627_032301';
import * as migration_20260627_052400_founder_auth_verify_columns from './20260627_052400_founder_auth_verify_columns';
import * as migration_20260627_120000_founder_startup_image_urls from './20260627_120000_founder_startup_image_urls';

export const migrations = [
  {
    up: migration_20260626_132837_initial.up,
    down: migration_20260626_132837_initial.down,
    name: '20260626_132837_initial',
  },
  {
    up: migration_20260626_173027_community_richtext_indexes.up,
    down: migration_20260626_173027_community_richtext_indexes.down,
    name: '20260626_173027_community_richtext_indexes',
  },
  {
    up: migration_20260627_000713_phase3_founder_accounts.up,
    down: migration_20260627_000713_phase3_founder_accounts.down,
    name: '20260627_000713_phase3_founder_accounts',
  },
  {
    up: migration_20260627_032301.up,
    down: migration_20260627_032301.down,
    name: '20260627_032301'
  },
  {
    up: migration_20260627_052400_founder_auth_verify_columns.up,
    down: migration_20260627_052400_founder_auth_verify_columns.down,
    name: '20260627_052400_founder_auth_verify_columns',
  },
  {
    up: migration_20260627_120000_founder_startup_image_urls.up,
    down: migration_20260627_120000_founder_startup_image_urls.down,
    name: '20260627_120000_founder_startup_image_urls',
  },
];
