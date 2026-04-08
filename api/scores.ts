import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { date } = req.query;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).end();
  }

  // Count unique users per max score achieved
  const result = await sql`
    WITH max_scores AS (
      SELECT client_id, MAX(score) AS max_score
      FROM scores
      WHERE date = ${date}
      GROUP BY client_id
    )
    SELECT max_score AS score, COUNT(*)::int AS count
    FROM max_scores
    GROUP BY max_score
    ORDER BY max_score
  `;

  const distribution: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  let total = 0;
  for (const row of result.rows) {
    distribution[row.score] = row.count;
    total += row.count;
  }

  return res.status(200).json({ distribution, total });
}
