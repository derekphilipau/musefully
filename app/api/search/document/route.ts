import { NextResponse } from 'next/server';
import { getDocument } from '@/util/elasticsearch/search/document';

/**
 * @swagger
 * /api/search/document:
 *   get:
 *     summary: Retrieve a specific document by its ID
 *     description: Endpoint to retrieve a document based on the provided index and ID.
 *     parameters:
 *       - in: query
 *         name: index
 *         required: true
 *         description: The index in which the document is stored.
 *         schema:
 *           type: string
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the document to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved document.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 anyFieldName:
 *                   type: string
 *                 anotherFieldName:
 *                   type: number
 *       400:
 *         description: Either 'id' or 'index' not provided.
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
  const index = searchParams.get('index');
  const id = searchParams.get('id');

  if (!id || Array.isArray(id))
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  if (!index || Array.isArray(index))
    return NextResponse.json({ error: "index is required" }, { status: 400 });

  try {
    const result = await getDocument(index, id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
