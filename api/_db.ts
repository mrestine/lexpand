import { sql } from '@vercel/postgres';

export async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      client_id TEXT NOT NULL,
      date DATE NOT NULL,
      score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 5),
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (client_id, date, score)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS scores_date_score_idx ON scores (date, score)
  `;
}

export { sql };
