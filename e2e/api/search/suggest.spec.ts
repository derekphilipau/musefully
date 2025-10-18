import { expect, test } from '@playwright/test';

test('should retrieve suggestions based on "picasso"', async ({ request }) => {
  const query = 'picasso';
  const response = await request.get(`/api/search/suggest?q=${query}`);
  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();
  const suggestions = responseBody.data;

  expect(Array.isArray(suggestions)).toBeTruthy();
  suggestions.forEach((suggestion) => {
    expect(typeof suggestion).toBe('object');
  });
  expect(suggestions.length).toBeGreaterThan(0);
});

test('should retrieve suggestions based on "monet"', async ({ request }) => {
  const query = 'monet';
  const response = await request.get(`/api/search/suggest?q=${query}`);
  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();
  const suggestions = responseBody.data;

  expect(Array.isArray(suggestions)).toBeTruthy();
  expect(suggestions.length).toBeGreaterThan(0);
  const hasMatch = suggestions.some((s) =>
    String(s?.value || '')
      .toLowerCase()
      .includes('monet')
  );
  expect(hasMatch).toBeTruthy();
});

test('should return empty object when query string is not provided', async ({
  request,
}) => {
  const response = await request.get('/api/search/suggest');
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toEqual({});
});
