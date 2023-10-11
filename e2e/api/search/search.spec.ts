import { expect, test } from '@playwright/test';

function buildSearchURL(params: {
  index?: string;
  p?: number;
  size?: number;
  q?: string;
  sf?: string;
  so?: 'asc' | 'desc';
  color?: string;
}): string {
  const baseURL = '/api/search';
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  return `${baseURL}?${queryParams.toString()}`;
}

test('should execute a search on the provided Elasticsearch index', async ({
  request,
}) => {
  const url = buildSearchURL({
    index: 'art',
    p: 1,
    size: 10,
    q: 'disease',
    sf: 'startYear',
    so: 'desc',
    color: 'FF0000',
  });
  const response = await request.get(url);

  expect(response.ok()).toBeTruthy();

  const searchResponse = await response.json();
  const searchResults = searchResponse.data;

  expect(Array.isArray(searchResults)).toBeTruthy();
  searchResults.forEach((result) => {
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('_id');
    expect(result).toHaveProperty('title');
  });
});
