import type { NextApiRequest, NextApiResponse } from 'next';
import updateRssFeeds from '@/util/import/updateRssFeed';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { secret } = req.query;
    // const { secret } = req.body; // Someday use POST instead of GET
    const realSecret = process.env.API_SECRET;

    if (!realSecret) {
      res.status(500).json({ error: 'API_SECRET not set' });
      return;
    }
    /*
    // Someday use POST instead of GET
    if (req.method !== 'POST') {
      res.status(405).send({ message: 'Only POST requests allowed' })
      return
    }
    */

    if (secret !== realSecret) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await updateRssFeeds();
    res.status(200).json({ success: true, message: 'RSS feeds updated' });
  } catch (error) {
    res.status(500).json({ error });
  }
}
