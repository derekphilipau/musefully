import { NextResponse } from 'next/server';
import { similarArtworksById } from '@/util/elasticsearch/search/similarArtworks';
import { getBooleanValue } from '@/util/various';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const hasPhoto = searchParams.get('hasPhoto');

  if (!id || Array.isArray(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const result = await similarArtworksById(id, getBooleanValue(hasPhoto));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
