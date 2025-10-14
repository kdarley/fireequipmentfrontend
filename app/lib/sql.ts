import postgres from 'postgres';

declare global {
  var sqlAuth: ReturnType<typeof postgres> | undefined;
  var sqlData: ReturnType<typeof postgres> | undefined;
}

/**
 * Helper to create a new Postgres client
 * Ensures SSL is disabled for local EC2 and dev environments
 */
function createClient(url: string | undefined) {
  if (!url) {
    throw new Error('Database URL not provided');
  }

  // Disable SSL for local/dev connections
  const ssl = url.includes('localhost') || url.includes('127.0.0.1') ? false : { rejectUnauthorized: false };

  return postgres(url, { ssl });
}

// ---- AUTH DATABASE ----
const sqlAuth =
  process.env.NODE_ENV === 'development'
    ? createClient(process.env.POSTGRES_AUTH_URL)
    : globalThis.sqlAuth ??= createClient(process.env.POSTGRES_AUTH_URL);

// ---- DATA DATABASE ----
const sqlData =
  process.env.NODE_ENV === 'development'
    ? createClient(process.env.POSTGRES_DATA_URL)
    : globalThis.sqlData ??= createClient(process.env.POSTGRES_DATA_URL);

// Cache in production
if (process.env.NODE_ENV !== 'development') {
  globalThis.sqlAuth = sqlAuth;
  globalThis.sqlData = sqlData;
}

export { sqlAuth, sqlData };
export default sqlAuth;
