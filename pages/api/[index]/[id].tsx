import type { NextApiRequest, NextApiResponse } from 'next';
import { getDocument } from '@/util/elasticsearch/search/document';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { index, id } = req.query;
    if (!id || Array.isArray(id))
      res.status(500).json({ error: 'Id not provided' });
    else if (!index || Array.isArray(index))
      res.status(500).json({ error: 'Index not provided' });
    else {
      const result = await getDocument(index, id);
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}
