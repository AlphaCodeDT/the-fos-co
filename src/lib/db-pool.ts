import pg from 'pg'
import type { PoolConfig, QueryConfig } from 'pg'

type PgQueryArg = string | QueryConfig

function withoutPreparedStatementName(query: PgQueryArg): PgQueryArg {
  if (typeof query !== 'object' || query === null || !('name' in query)) {
    return query
  }

  const { name, ...rest } = query
  void name
  return rest
}

let pgDriverPatched = false

function patchQueryMethod(target: { query: (...args: never[]) => unknown }) {
  const originalQuery = target.query

  target.query = function patchedQuery(this: unknown, ...args: never[]) {
    if (args[0] && typeof args[0] === 'object') {
      args[0] = withoutPreparedStatementName(args[0] as PgQueryArg) as never
    }

    return originalQuery.apply(this, args)
  }
}

/** Strip named prepared statements — unsupported on Supavisor transaction pooler (port 6543). */
function patchPgForTransactionPooler() {
  if (pgDriverPatched) return
  pgDriverPatched = true

  patchQueryMethod(pg.Pool.prototype)
  patchQueryMethod(pg.Client.prototype)
}

/**
 * Postgres pool tuned for Vercel serverless + Supabase transaction pooler.
 * Reads DATABASE_URL from env — never hardcode credentials.
 */
export function createPostgresPoolConfig(): PoolConfig {
  return {
    connectionString: process.env.DATABASE_URL || '',
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idleTimeoutMillis: Number(process.env.DATABASE_POOL_IDLE_TIMEOUT_MS ?? 30_000),
    connectionTimeoutMillis: Number(process.env.DATABASE_CONNECTION_TIMEOUT_MS ?? 10_000),
    allowExitOnIdle: true,
  }
}

/** pg driver with prepared-statement names stripped (transaction pooler safe). */
export function createPgDriver(): typeof pg {
  patchPgForTransactionPooler()
  return pg
}
