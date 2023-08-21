import { NextResponse } from 'next/server';
import { options } from '@/util/elasticsearch/search/options';

import type { AggOption } from '@/types/aggOption';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get('index');
  const field = searchParams.get('field');
  const q = searchParams.get('q');

  if (!index || !field)
    return NextResponse.json({ error: "index and field are required" }, { status: 400 });

  try {
    const result: AggOption[] = await options({ index, field, q });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
