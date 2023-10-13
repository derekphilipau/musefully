import { NextResponse } from 'next/server';

import { suggest } from '@/lib/elasticsearch/search/suggest';

/**
 * @swagger
 * /api/search/suggest:
 *   get:
 *     summary: Get suggestions based on a query string
 *     description: Endpoint to fetch suggestions based on the provided query string.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: The query string for which to fetch suggestions.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved suggestions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object   # Placeholder for the structure of suggestions
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
  const q = searchParams.get('q');

  try {
    const result = await suggest(q);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
