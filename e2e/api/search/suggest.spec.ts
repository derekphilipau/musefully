import { expect, test } from '@playwright/test';

test('should retrieve suggestions based on "picasso"', async ({ request }) => {
  const query = 'picasso';
  const response = await request.get(`/api/search/suggest?q=${query}`);
  const responseBody = await response.json();
  const suggestions = responseBody.data;

  expect(response.ok()).toBeTruthy();
  expect(Array.isArray(suggestions)).toBeTruthy();
  suggestions.forEach((suggestion) => {
    expect(typeof suggestion).toBe('object');
  });
});

test('should retrieve suggestions based on "cezanne"', async ({ request }) => {
  const query = 'cezanne';
  const response = await request.get(`/api/search/suggest?q=${query}`);
  const responseBody = await response.json();
  const suggestions = responseBody.data;

  expect(response.ok()).toBeTruthy();
  expect(Array.isArray(suggestions)).toBeTruthy();
  expect(suggestions.length).toBe(1);
  expect(suggestions[0].value).toBe('Cézanne, Paul');
});

test('should return empty object when query string is not provided', async ({
  request,
}) => {
  const response = await request.get('/api/search/suggest');
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toEqual({});
});
