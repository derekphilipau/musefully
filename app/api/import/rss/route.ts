import { NextResponse, type NextRequest } from 'next/server';

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
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  try {
    await updateRssFeeds();
    return NextResponse.json({ success: true, message: 'RSS feeds updated' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
