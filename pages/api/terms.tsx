import type { NextApiRequest, NextApiResponse } from 'next';
import { terms } from '@/util/elasticsearch/search/terms';

/*
type ResponseData = {
  message?: string,
  error?: string
}
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const result = await terms(req.query?.q);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error });
  }
}
