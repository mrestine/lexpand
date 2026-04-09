import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  const { date } = req.query;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).end();
  }

  // Return total count of each score level recorded for the day
  const result = await sql`
    SELECT score, COUNT(*)::int AS count
    FROM scores
    WHERE date = ${date}
    GROUP BY score
    ORDER BY score
  `;

  const distribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of result.rows) {
    distribution[row.score] = row.count;
  }

  return res.status(200).json({ distribution });
}
