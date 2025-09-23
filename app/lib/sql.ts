import postgres from 'postgres';

declare global {
  var sql: ReturnType<typeof postgres>;
}

let sqlClient: ReturnType<typeof postgres>;

if (!globalThis.sql) {
  sqlClient = postgres(process.env.POSTGRES_URL!, {
    ssl: { rejectUnauthorized: false },
  });
  globalThis.sql = sqlClient;
} else {
  sqlClient = globalThis.sql;
}

export default sqlClient;
