import { NextResponse } from 'next/server';

import { search } from '@/lib/elasticsearch/search/search';

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Execute a search on an Elasticsearch index
 *     description: Endpoint to execute a search on the provided Elasticsearch index based on the given parameters.
 *     parameters:
 *       - in: query
 *         name: index
 *         required: true
 *         description: Name of the Elasticsearch index to search.
 *         schema:
 *           type: string
 *       - in: query
 *         name: p
 *         required: false
 *         description: Page number.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         required: false
 *         description: Page size.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: q
 *         required: false
 *         description: Query to search for.
 *         schema:
 *           type: string
 *       - in: query
 *         name: sf
 *         required: false
 *         description: Sort field.
 *         schema:
 *           type: string
 *       - in: query
 *         name: so
 *         required: false
 *         description: Sort order.
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *       - in: query
 *         name: color
 *         required: false
 *         description: Hex string representing the color to search for.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully executed search.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object # TODO add schemas
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
  const params = Object.fromEntries(searchParams.entries());

  try {
    const result = await search(params);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
