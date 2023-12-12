/**
 * Deprecated, doesn't work that great and relies on old version of OpenAI API.
 * 
 * Attempt to extract exhibition information from web pages.
 * 1. Get markdown from web page
 * 2. Call OpenAI GPT function to extract JSON exhibition data
 * 3. Parse JSON exhibition data
 */
export {}
/**
import { loadEnvConfig } from '@next/env';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';

import type { ElasticsearchExtractor } from '@/types/elasticsearchExtractor';
import { parseDateRange, type DateRange } from './util/dateParser';
import { getMarkdownFromUrl } from './util/markdown';
import { siteConfig } from '@/config/site';
loadEnvConfig(process.cwd());

async function getExhibitionsWithGPT(text: string): Promise<any> {
  const payload = {
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that extracts data and returns it in JSON format.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    functions: [
      {
        name: 'parse_exhibitions',
        description: 'Extract all exhibition data from the markdown text.',
        parameters: {
          type: 'object',
          properties: {
            exhibitions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'URL of exhibition web page',
                  },
                  title: {
                    type: 'string',
                    description: 'Title of exhibition',
                  },
                  imageUrl: {
                    type: 'string',
                    description: 'URL of exhibition image',
                  },
                  dates: {
                    type: 'string',
                    description: 'Exhibition dates',
                  },
                  location: {
                    type: 'string',
                    description: 'Exhibition location',
                  },
                },
              },
              description: 'List of exhibitions with their data',
            },
          },
        },
      },
    ],
    function_call: { name: 'parse_exhibitions' },
    response_format: { type: 'json_object' },
  } as CreateChatCompletionRequest;

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const chatCompletion = await openai.createChatCompletion(payload);
    if (chatCompletion?.data?.usage) {
      console.log(chatCompletion.data.usage);
    }
    if (chatCompletion?.data?.choices?.[0].message?.function_call?.arguments) {
      console.log(chatCompletion.data.choices[0].message.function_call.arguments)
      return JSON.parse(
        chatCompletion.data.choices[0].message.function_call.arguments
      );
    }
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

function getSheetEvent(
  exhibition: any,
  site: any
): any | undefined {
  if (exhibition.imageUrl?.startsWith('//'))
    exhibition.imageUrl = `https:${exhibition.imageUrl}`;
  else if (exhibition.imageUrl?.startsWith('/'))
    exhibition.imageUrl = `${site.baseUrl}${exhibition.imageUrl}`;

  if (exhibition.url?.startsWith('/'))
    exhibition.url = `${site.baseUrl}${exhibition.url}`;

  const location =
    exhibition.location === exhibition.title ? undefined : exhibition.location;

  const { startDate, endDate }: DateRange = parseDateRange(exhibition.dates);

  if (exhibition.title && exhibition.url) {
    const eventDoc: any = {
      url: exhibition.url,
      sourceId: site.sourceId,
      title: exhibition.title,
      image: exhibition.imageUrl,
      formattedDate: exhibition.dates,
      startDate: startDate ? startDate : undefined,
      endDate: endDate ? endDate : undefined,
      location,
    };
    return eventDoc;
  }
}

async function extract(): Promise<any[]> {
  const eventDocs: any[] = [];
  for (const site of siteConfig.exhibitionUrls) {
    console.log(`Extracting exhibitions from ${site.url}`);
    const markdown = await getMarkdownFromUrl(site.url);
    const response = await getExhibitionsWithGPT(markdown);
    if (response?.exhibitions) {
      console.log(response.exhibitions);
      for (const exhibition of response?.exhibitions) {
        const eventDoc = getSheetEvent(exhibition, site);
        if (eventDoc) eventDocs.push(eventDoc);
      }
    }
  }
  return eventDocs;
}

export const extractor: ElasticsearchExtractor = {
  indexName: 'events',
  typeName: 'exhibitions',
  generateId: (doc: any) => {
    return doc.url || '';
  },
  extract: async () => {
    return extract();
  },
};
*/