import { NextResponse } from 'next/server';

import { similarArtworksById } from '@/lib/elasticsearch/search/similarArtworks';
import { getBooleanValue } from '@/lib/various';

/**
 * @swagger
 * /api/search/similar:
 *   get:
 *     summary: Retrieve Similar Artworks by ID
 *     description: Endpoint to get similar artworks by a given ID. Optionally, filter results based on the presence of a photo.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the artwork.
 *         schema:
 *           type: string
 *       - in: query
 *         name: hasPhoto
 *         required: false
 *         description: Flag to indicate if the artwork should have a photo.
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Successfully retrieved similar artworks.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object # TODO: Add schemas
 *       400:
 *         description: Invalid ID or other bad request.
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
  const id = searchParams.get('id');
  const hasPhoto = searchParams.get('hasPhoto');

  if (!id || Array.isArray(id))
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const result = await similarArtworksById(id, getBooleanValue(hasPhoto));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
