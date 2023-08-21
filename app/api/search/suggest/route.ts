import { NextResponse } from 'next/server';
import { suggest } from '@/util/elasticsearch/search/suggest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  try {
    const result = await suggest(q);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
