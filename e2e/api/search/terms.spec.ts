import { expect, test } from '@playwright/test';

test('should retrieve terms based on "monet"', async ({ request }) => {
  const query = 'monet';
  const response = await request.get(`/api/search/terms?q=${query}`);

  expect(response.ok()).toBeTruthy();

  const termsList = await response.json();

  expect(Array.isArray(termsList)).toBeTruthy();
  termsList.forEach((term) => {
    expect(typeof term).toBe('object');
  });
  // First result should be Monet:
  expect(termsList[0].value).toBe('Monet, Claude');
});

test('should return an appropriate error when query string is not provided', async ({
  request,
}) => {
  const response = await request.get('/api/search/terms');
  expect(response.status()).toBe(200);
  const responseBody = await response.json();
  expect(responseBody).toEqual([]);
});
