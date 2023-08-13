import type { NextApiRequest, NextApiResponse } from 'next';
import { similarArtworksById } from '@/util/elasticsearch/search/similarArtworks';
import { getBooleanValue } from '@/util/various';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id, hasPhoto } = req.query;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid id' });
      return;
    }
    const result = await similarArtworksById(id, getBooleanValue(hasPhoto));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
}
