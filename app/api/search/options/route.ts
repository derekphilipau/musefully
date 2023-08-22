import { NextResponse } from 'next/server';
import { options } from '@/util/elasticsearch/search/options';

import type { AggOption } from '@/types/aggOption';

/**
 * @swagger
 * /api/search/options:
 *   get:
 *     summary: 'Get Aggregation Options'
 *     description: 'Retrieve aggregation options based on the provided index and field.'
 *     parameters:
 *       - name: index
 *         in: query
 *         description: 'Index to search on.'
 *         required: true
 *         schema:
 *           type: string
 *       - name: field
 *         in: query
 *         description: 'Field to aggregate on.'
 *         required: true
 *         schema:
 *           type: string
 *       - name: q
 *         in: query
 *         description: 'Optional query string to further filter the results.'
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: 'Successful response containing a list of aggregation options.'
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AggOption'
 *       '400':
 *         description: 'Bad request, typically when "index" or "field" are not provided.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: 'Internal server error.'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * components:
 *   schemas: # TODO: move schemas to separate directory
 *     AggOption:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: 'The aggregation key or name.'
 *         doc_count:
 *           type: integer
 *           format: int32
 *           description: 'The count of documents associated with the key.'
 *       required:
 *         - key
 *         - doc_count
*/
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get('index');
  const field = searchParams.get('field');
  const q = searchParams.get('q');

  if (!index || !field)
    return NextResponse.json({ error: "index and field are required" }, { status: 400 });

  try {
    const result: AggOption[] = await options({ index, field, q });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
