import { NextResponse } from 'next/server';
import { terms } from '@/util/elasticsearch/search/terms';

/**
 * @swagger
 * /api/search/terms:
 *   get:
 *     summary: Get terms based on a query string
 *     description: Endpoint to fetch terms based on the provided query string.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: The query string for which to fetch terms.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved terms.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object   # TODO: Add schemas
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
    const result = await terms(q);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
