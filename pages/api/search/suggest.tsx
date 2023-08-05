import type { NextApiRequest, NextApiResponse } from 'next';
import { suggest } from '@/util/elasticsearch/search/suggest';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await suggest(req?.query?.q as string);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
}
