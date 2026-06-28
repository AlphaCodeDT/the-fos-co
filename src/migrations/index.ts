import * as migration_20260626_132837_initial from './20260626_132837_initial';
import * as migration_20260626_173027_community_richtext_indexes from './20260626_173027_community_richtext_indexes';
import * as migration_20260627_000713_phase3_founder_accounts from './20260627_000713_phase3_founder_accounts';
import * as migration_20260627_032301 from './20260627_032301';
import * as migration_20260627_052400_founder_auth_verify_columns from './20260627_052400_founder_auth_verify_columns';
import * as migration_20260627_120000_founder_startup_image_urls from './20260627_120000_founder_startup_image_urls';
import * as migration_20260628_000000_social_links from './20260628_000000_social_links';
import * as migration_20260628_120000_team_member_name from './20260628_120000_team_member_name';
import * as migration_20260628_140000_location_cohort from './20260628_140000_location_cohort';
import * as migration_20260628_160000_organizations_enum_expand from './20260628_160000_organizations_enum_expand';
import * as migration_20260628_160001_organizations_enrichment from './20260628_160001_organizations_enrichment';

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
  {
    up: migration_20260628_000000_social_links.up,
    down: migration_20260628_000000_social_links.down,
    name: '20260628_000000_social_links',
  },
  {
    up: migration_20260628_120000_team_member_name.up,
    down: migration_20260628_120000_team_member_name.down,
    name: '20260628_120000_team_member_name',
  },
  {
    up: migration_20260628_140000_location_cohort.up,
    down: migration_20260628_140000_location_cohort.down,
    name: '20260628_140000_location_cohort',
  },
  {
    up: migration_20260628_160000_organizations_enum_expand.up,
    down: migration_20260628_160000_organizations_enum_expand.down,
    name: '20260628_160000_organizations_enum_expand',
  },
  {
    up: migration_20260628_160001_organizations_enrichment.up,
    down: migration_20260628_160001_organizations_enrichment.down,
    name: '20260628_160001_organizations_enrichment',
  },
];
