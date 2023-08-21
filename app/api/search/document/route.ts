import { NextResponse } from 'next/server';
import { getDocument } from '@/util/elasticsearch/search/document';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get('index');
  const id = searchParams.get('id');

  if (!id || Array.isArray(id))
    return NextResponse.json({ error: "id is required" }, { status: 400 });

  if (!index || Array.isArray(index))
    return NextResponse.json({ error: "index is required" }, { status: 400 });

  try {
    const result = await getDocument(index, id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
