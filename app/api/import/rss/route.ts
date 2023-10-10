import { NextResponse } from 'next/server';

import updateRssFeeds from '@/lib/import/updateRssFeed';

/**
 * @swagger
 * /api/import/rss:
 *   get:
 *     summary: Updates RSS feeds
 *     description: Endpoint to update RSS feeds. Requires secret for authentication.
 *     parameters:
 *       - in: query
 *         name: secret
 *         required: true
 *         description: The secret key for authentication.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: RSS feeds successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: API_SECRET environment variable not set or other bad request.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized request due to invalid secret.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: object
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const realSecret = process.env.API_SECRET;

  if (!realSecret)
    return NextResponse.json(
      { error: 'API_SECRET environment variable not set' },
      { status: 400 }
    );

  if (secret !== realSecret)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await updateRssFeeds();
    return NextResponse.json({ success: true, message: 'RSS feeds updated' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
