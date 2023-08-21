import { NextResponse } from 'next/server';
import { terms } from '@/util/elasticsearch/search/terms';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  try {
    const result = await terms(q);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
