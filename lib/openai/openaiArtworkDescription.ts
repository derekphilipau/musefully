/**
 * Approx 0.012 cents for input, 0.015 cents for output = 0.03 cents per image
 * 10 images = .3 cents ($0.003)
 * 100 images = 3 cents ($0.03)
 * 1000 images = 30 cents ($0.30)
 * 10000 images = 300 cents ($3.00)
 * 100000 images = 3000 cents ($30.00)
 * 
 * OpenAI Vision API:
 * https://platform.openai.com/docs/guides/vision
 *
 * For possibly mapping keywords to emojis:
 * https://unicode.org/Public/emoji/15.1/
 * https://unicode.org/emoji/charts/emoji-list.html
 * 
 * PUT /art/_mapping
{
  "properties": {
    "mlAltText": {
      "type": "text",
      "analyzer": "unaggregatedStandardAnalyzer"
    },
    "mlDescription": {
      "type": "text",
      "analyzer": "unaggregatedStandardAnalyzer"
    }
  }
}
 */
//import { loadEnvConfig } from '@next/env';
import OpenAI from 'openai';

import { ArtworkDocument, BaseDocument } from '@/types/document';
import { getClient } from '@/lib/elasticsearch/client';
import { upsertDocument } from '@/lib/elasticsearch/import';
import { getDocument } from '@/lib/elasticsearch/search/document';

const OPENAI_VISION_MODEL = 'gpt-4-vision-preview';
const MAX_TOKENS = 1500;

//loadEnvConfig(process.cwd());

type MLDescription = {
  altText: string | undefined;
  longDescription: string | undefined;
};

export function parseAltTextAndLongDescription(
  str: string | undefined
): MLDescription | undefined {
  if (typeof str !== 'string' || str.trim().length === 0) {
    console.error('Invalid input: Input must be a non-empty string.');
    return;
  }

  const altTextRegex = /alt text:(.*?)long description:/is;
  const longDescriptionRegex = /long description:(.*)/is;

  const altTextMatch = str.match(altTextRegex);
  const longDescriptionMatch = str.match(longDescriptionRegex);

  if (!altTextMatch && !longDescriptionMatch) {
    console.error(
      'Invalid input: Input must contain both an alt text and a long description.'
    );
    return;
  }

  const altText = altTextMatch?.[1].trim();
  const longDescription = longDescriptionMatch?.[1].trim();

  return {
    altText,
    longDescription,
  };
}

/**
 * Get alt text & long description from an image and update the document
 *
 * @param index the Elasticsearch index
 * @param id the Elasticsearch document id
 * @param document the Elasticsearch document
 * @param method the method to use to update the document, either 'append' or 'replace'
 * @returns void
 */
export async function updateDocumentMLDescriptionFromImage(
  index: string,
  id: string,
  document: ArtworkDocument
): Promise<void> {
  if (!document?.image?.thumbnailUrl) return;

  const mlDescription = await getMLDescriptionFromImage(
    document.image.thumbnailUrl
  );
  /*
  TODO:
  if (mlDescription) {
    if (mlDescription.altText) document.mlAltText = mlDescription.altText;
    if (mlDescription.longDescription)
      document.mlDescription = mlDescription.longDescription;
    const client = getClient();
    await upsertDocument(client, index, id, document);
  }
  */
}

/**
 * Use GPT to get keywords for an image
 *
 * @param imageUrl The URL of the image
 * @returns A string of keywords
 */
export async function getMLDescriptionFromImage(
  imageUrl: string
): Promise<MLDescription | undefined> {
  if (!imageUrl || !process.env.OPENAI_API_KEY) return;

  const promptText = `As an art historian and accessibility expert, generate two distinct texts: ALT TEXT and LONG DESCRIPTION. The texts must adhere to accessibility guidelines, ensuring the description is inclusive and provides an equitable digital experience for all users, including those with disabilities.
    Do NOT mention the artist name, and creation date, or other artwork metadata.  ONLY describe the image. Start with the most important element of the image. Exclude repetitive information. Avoid phrases like "image of", "photo of", unless the medium is crucial. Avoid jargon and explain specialized terms. Transcribe any text within the image. Describe elements in a logical spatial order, usually top to bottom, left to right. Use familiar color terms and clarify specialized color names. Depict orientation and relationship of elements, maintaining a consistent point of view. Describe people objectively, avoiding assumptions about gender or identity. Use neutral language and non-ethnic terms for skin tone. Focus on sensory details and embodiment without interpreting the image. For infographics, prioritize the clarity of crucial information. Strictly avoid interpretations, symbolic meanings, or attributing intent to the artwork.   
    SPECIFIC GUIDELINES FOR ALT TEXT: Be concise, aiming for around fifteen words, and forming a complete sentence only if necessary.    
    SPECIFIC GUIDELINES FOR LONG DESCRIPTION: Long descriptions can be anywhere from a couple of sentences to a paragraph, written in complete sentences. Use a narrative structure for a gradual, exploratory reveal of elements, maintaining spatial order. Provide detailed, factual visual information. Focus on physical attributes and composition.`;

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
      max_tokens: MAX_TOKENS,
      model: OPENAI_VISION_MODEL,
    };
    const chatCompletion: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create(params);

    if (chatCompletion?.usage) {
      console.log(chatCompletion.usage);
    }
    console.log(JSON.stringify(chatCompletion, null, 2));
    if (chatCompletion.choices?.[0].message?.content) {
      const content = chatCompletion.choices[0].message.content;
      if (content) {
        return parseAltTextAndLongDescription(content);
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
  await updateDocumentMLDescriptionFromImage('art', id, doc);
}

testOpenAI('bkm_224999');
*/
