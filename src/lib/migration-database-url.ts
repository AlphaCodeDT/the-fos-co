/**
 * Resolve Postgres URL for Payload migrations (DDL, advisory locks).
 * Runtime should use DATABASE_URL on the transaction pooler (:6543).
 * Migrations must use DATABASE_URI_SESSION (direct :5432) when runtime is pooled.
 */
export function resolveMigrationDatabaseUrl(): string {
  const sessionUrl = process.env.DATABASE_URI_SESSION?.trim()
  const runtimeUrl = process.env.DATABASE_URL?.trim()

  if (sessionUrl) {
    return sessionUrl
  }

  if (!runtimeUrl) {
    throw new Error('DATABASE_URL is required for migrations.')
  }

  if (runtimeUrl.includes(':6543')) {
    throw new Error(
      'Migrations require DATABASE_URI_SESSION (Supabase direct :5432). DATABASE_URL uses the transaction pooler (:6543).',
    )
  }

  return runtimeUrl
}

/** Point DATABASE_URL at the session-capable connection for the current process. */
export function applyMigrationDatabaseUrl(): void {
  process.env.DATABASE_URL = resolveMigrationDatabaseUrl()
}
