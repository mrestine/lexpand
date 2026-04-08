import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';
import { sql } from './_db';

function verifyToken(date: string, score: number, token: string): boolean {
  const secret = process.env.PUZZLE_SECRET;
  if (!secret) {
    return false;
  }

  const expected = createHmac('sha256', secret)
    .update(`${date}|${score}`)
    .digest('hex');
  try {
    const expectedBuf = Buffer.from(expected, 'hex');
    const tokenBuf = Buffer.from(token, 'hex');
    return (
      expectedBuf.length === tokenBuf.length &&
      timingSafeEqual(expectedBuf, tokenBuf)
    );
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { clientId, date, score, token } = req.body ?? {};

  if (
    typeof clientId !== 'string' ||
    !clientId ||
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    typeof score !== 'number' ||
    score < 0 ||
    score > 5
  ) {
    return res.status(400).end();
  }

  if (score === 0) {
    // Score 0 = first submission attempt — no token, no monotonic check
    await sql`
      INSERT INTO scores (client_id, date, score)
      VALUES (${clientId}, ${date}, 0)
      ON CONFLICT (client_id, date, score) DO NOTHING
    `;
    return res.status(200).end();
  }

  // Score 1–5: require a valid token
  if (typeof token !== 'string' || !token) {
    return res.status(400).end();
  }

  if (!verifyToken(date, score, token)) {
    return res.status(401).end();
  }

  // Monotonic check: score N requires score N-1 already recorded
  if (score > 1) {
    const prev = await sql`
      SELECT 1 FROM scores
      WHERE client_id = ${clientId} AND date = ${date} AND score = ${score - 1}
    `;
    if (prev.rowCount === 0) {
      return res.status(409).end();
    }
  }

  await sql`
    INSERT INTO scores (client_id, date, score)
    VALUES (${clientId}, ${date}, ${score})
    ON CONFLICT (client_id, date, score) DO NOTHING
  `;

  return res.status(200).end();
}
