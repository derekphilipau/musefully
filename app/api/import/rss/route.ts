import { NextResponse } from 'next/server';
import updateRssFeeds from '@/util/import/updateRssFeed';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const realSecret = process.env.API_SECRET;

  if (!realSecret)
    return NextResponse.json({ error: "API_SECRET environment variable not set" }, { status: 400 });

  if (secret !== realSecret)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await updateRssFeeds();
    return NextResponse.json({ success: true, message: 'RSS feeds updated' });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
