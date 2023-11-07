/**
 * Attempt to extract exhibition information from web pages.
 * 1. Get markdown from web page
 * 2. Call OpenAI GPT function to extract JSON exhibition data
 * 3. Parse JSON exhibition data into EventDocument
 *
 * Note that I tried various methods, such as asking GPT to infer the
 * start & end dates of the exhibition, but it was not very accurate.
 */
import { loadEnvConfig } from '@next/env';
import playwright from 'playwright';
import { Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai';
import TurndownService from 'turndown';

import type { ElasticsearchExtractor } from '@/types/elasticsearchExtractor';
import { EventDocument } from '@/types/document';
import { parseDateRange, type DateRange } from './dateParser';

loadEnvConfig(process.cwd());

// List all sites to extract from:
const SITES = [
  {
    url: 'https://www.moma.org/calendar/exhibitions/',
    source: 'MoMA',
    sourceId: 'moma',
    baseUrl: 'https://www.moma.org',
  },
  {
    url: 'https://www.brooklynmuseum.org/exhibitions',
    source: 'Brooklyn Museum',
    sourceId: 'bkm',
    baseUrl: 'https://www.brooklynmuseum.org',
  },
  {
    url: 'https://www.metmuseum.org/exhibitions',
    source: 'Metropolitan Museum of Art',
    sourceId: 'met',
    baseUrl: 'https://www.metmuseum.org',
  },
];

async function getPlaywrightContent(url: string): Promise<string> {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({
    javaScriptEnabled: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  });
  const page = await context.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => {
    const selectorRemovals = ['script', 'style', 'header', 'footer', 'nav'];
    selectorRemovals.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  });
  const content = await page.content();
  await browser.close();
  return content;
}

async function getMarkdownFromUrl(url: string): Promise<string> {
  const content = await getPlaywrightContent(url);
  var turndownService = new TurndownService();
  var markdown = turndownService.turndown(content);
  return markdown;
}

async function getExhibitionsWithGPT(text: string): Promise<any> {
  const payload = {
    model: process.env.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that extracts data and returns it in JSON format." 
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
    response_format: { type: "json_object" },
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

function getEventDocument(
  exhibition: any,
  site: any
): EventDocument | undefined {
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
    const eventDoc: EventDocument = {
      source: site.source,
      sourceId: site.sourceId,
      type: 'exhibition',
      url: exhibition.url,
      title: exhibition.title,
      image: {
        url: exhibition.imageUrl,
        thumbnailUrl: exhibition.imageUrl,
      },
      formattedDate: exhibition.dates,
      date: startDate ? startDate : undefined,
      endDate: endDate ? endDate : undefined,
      location,
    };
    return eventDoc;
  }
}

async function extract(): Promise<EventDocument[]> {
  const eventDocs: EventDocument[] = [];
  for (const site of SITES) {
    const markdown = await getMarkdownFromUrl(site.url);
    console.log(markdown)
    const response = await getExhibitionsWithGPT(markdown);
    if (response?.exhibitions) {
      console.log(response.exhibitions);
      for (const exhibition of response?.exhibitions) {
        const eventDoc = getEventDocument(exhibition, site);
        if (eventDoc) eventDocs.push(eventDoc);
      }
    }
  }
  //console.log(eventDocs);
  return eventDocs;
}

export const extractor: ElasticsearchExtractor = {
  indexName: 'events',
  generateId: (doc: EventDocument) => {
    return doc.url || '';
  },
  extract: async () => {
    return extract();
  },
};
