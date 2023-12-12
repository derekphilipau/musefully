/**
 * OpenAI Vision API:
 * https://platform.openai.com/docs/guides/vision
 *
 * For possibly mapping keywords to emojis:
 * https://unicode.org/Public/emoji/15.1/
 * https://unicode.org/emoji/charts/emoji-list.html
 */
import { loadEnvConfig } from '@next/env';
import OpenAI from 'openai';

import { BaseDocument } from '@/types/document';
import { getClient } from '@/lib/elasticsearch/client';
import { upsertDocument } from '@/lib/elasticsearch/import';
import { getDocument } from '@/lib/elasticsearch/search/document';

const OPENAI_VISION_MODEL = 'gpt-4-vision-preview';

loadEnvConfig(process.cwd());

/**
 * Get keywords from an image and update the document
 *
 * @param index the Elasticsearch index
 * @param id the Elasticsearch document id
 * @param document the Elasticsearch document
 * @param method the method to use to update the keywords, either 'append' or 'replace'
 * @returns void
 */
export async function updateDocumentKeywordsFromImage(
  index: string,
  id: string,
  document: BaseDocument,
  method: 'append' | 'replace' = 'append'
): Promise<void> {
  if (!document?.image?.thumbnailUrl) return;

  const keywords = await getKeywordsFromImage(document.image.thumbnailUrl);
  if (keywords && keywords.length > 0) {
    if (
      method === 'replace' ||
      !document.keywords ||
      document.keywords.length === 0
    ) {
      document.keywords = keywords;
    } else {
      const keywordsSet = new Set([...document.keywords, ...keywords]);
      document.keywords = [...keywordsSet];
    }
    const client = getClient();
    await upsertDocument(client, index, id, document);
  }
}

/**
 * Use GPT to get keywords for an image
 *
 * @param imageUrl The URL of the image
 * @returns A string of keywords
 */
export async function getKeywordsFromImage(
  imageUrl: string
): Promise<string[] | undefined> {
  if (!imageUrl || !process.env.OPENAI_API_KEY) return;

  const promptText = `As an art historian with deep knowledge of visual art, carefully examine the artwork provided. Generate a comma-separated list of significant single-word keywords that precisely represent the visible subjects or elements within this artwork, while excluding any general or universally applicable art-related terms. Avoid mentioning any elements like frames or palettes unless they are explicitly depicted within the artwork itself. Do not include any terms that might be sensitive or inappropriate. Concentrate on aspects that are unique to this piece of art, steering clear of broad categories such as art types or colors. Your response should consist solely of keywords that directly correspond to the observable content within the artwork, without any additional text or explanations. Please provide only the comma-separated single-word keywords.`;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: promptText,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      model: OPENAI_VISION_MODEL,
    };
    const chatCompletion: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create(params);

    if (chatCompletion?.usage) {
      console.log(chatCompletion.usage);
    }
    if (chatCompletion.choices?.[0].message?.content) {
      const content = chatCompletion.choices[0].message.content;
      if (content) {
        const keywords = content
          .split(',')
          .map((keyword) => keyword.trim().toLowerCase())
          .filter((keyword) => keyword.length > 0);
        if (keywords?.length > 0) {
          console.log(keywords);
          return keywords;
        }
      }
    }
  } catch (error) {
    if (error.response) {
      console.error(error.response);
    } else if (error.message) {
      console.error(error.message);
    } else {
      console.error(error);
    }
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
  await updateDocumentKeywordsFromImage('art', id, doc, 'append');
}

testOpenAI('bkm_224999');
*/