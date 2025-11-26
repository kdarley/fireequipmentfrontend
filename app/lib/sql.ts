import postgres from 'postgres';

declare global {
  var sqlAuth: ReturnType<typeof postgres> | undefined;
  var sqlData: ReturnType<typeof postgres> | undefined;
}

/**
 * Helper to create a Postgres client
 */
function createClient(url: string | undefined) {
  if (!url) throw new Error('Database URL not provided');

  const ssl =
    url.includes('localhost') || url.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false };

  return postgres(url, {
    ssl,
    max: 10,          // connection pool size
    idle_timeout: 5,  // seconds before idle connections close
    max_lifetime: 60 * 30, // 30 minutes
  });
}

// ---- AUTH DATABASE ----
const sqlAuth = globalThis.sqlAuth ?? createClient(process.env.POSTGRES_AUTH_URL);
globalThis.sqlAuth = sqlAuth;

// ---- DATA DATABASE ----
const sqlData = globalThis.sqlData ?? createClient(process.env.POSTGRES_DATA_URL);
globalThis.sqlData = sqlData;

export { sqlAuth, sqlData };
export default sqlAuth;
