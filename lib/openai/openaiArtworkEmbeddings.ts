/**
 * Ada v2 Embedding model:
 * Model	Usage
 * ada v2	$0.0001 / 1K tokens
 *
 */
//import { loadEnvConfig } from '@next/env';
import OpenAI from 'openai';

import { ArtworkDocument, BaseDocument } from '@/types/document';
import { getClient } from '@/lib/elasticsearch/client';
import { upsertDocument } from '@/lib/elasticsearch/import';
import { getDocument } from '@/lib/elasticsearch/search/document';

//loadEnvConfig(process.cwd());

/**
 * Concatenate relevant text fields for embedding
 *
 * @param document The document to embed
 * @returns A string of concatenated text
 */
export function concatenateFieldsForEmbedding(
  document: ArtworkDocument
): string {
  const fields = [
    document.title,
    document.mlDescription,
    document.mlAltText,
    ...(document.keywords || []),
  ];

  return fields.filter(Boolean).join(' ');
}

/**
 * Call OpenAI to get embeddings for a text string
 *
 * @param text The text to embed
 * @returns An array of embeddings
 */
export async function getEmbeddingsFromText(
  text: string
): Promise<number[] | undefined> {
  if (!text || !process.env.OPENAI_API_KEY) return;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    const embeddingsArray = response.data as OpenAI.Embedding[];
    return embeddingsArray[0].embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return;
  }
}

export async function updateDocumentWithEmbeddings(
  index: string,
  id: string,
  document: ArtworkDocument
): Promise<void> {
  const concatenatedText = concatenateFieldsForEmbedding(document);
  const embeddings = await getEmbeddingsFromText(concatenatedText);

  if (embeddings) {
    // Assuming you have a field in your document to store embeddings
    // TODO document.embeddings = embeddings;
    const client = getClient();
    await upsertDocument(client, index, id, document);
  }
}

/**
 * Test the OpenAI API
 */
/*
export async function testOpenAI(id): Promise<void> {
  const resp = await getDocument('art', id);
  const doc = resp?.data as BaseDocument;
  if (!doc?.image?.thumbnailUrl) {
    console.log('no image');
    return;
  }
  await updateDocumentWithEmbeddings('art', id, doc);
}

testOpenAI('bkm_224999');
*/
