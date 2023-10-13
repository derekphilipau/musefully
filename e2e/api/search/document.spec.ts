import { expect, test } from '@playwright/test';

test('should retrieve a specific document by its ID', async ({ request }) => {
  const indexName = 'art';
  const documentId = 'bkm_225001';

  const response = await request.get(
    `/api/search/document?id=${documentId}&index=${indexName}`
  );

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  const document = data.data;

  expect(document).toHaveProperty('_id');
  expect(document._id).toStrictEqual(documentId);
  expect(document).toHaveProperty('constituents');
  expect(document.constituents.length).toBe(1);
});

test('should return error when id or index is not provided', async ({
  request,
}) => {
  const indexName = 'art';
  const documentId = 'bkm_225001';

  // Test missing id
  let response = await request.get(`/api/search/document?index=${indexName}`);
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'id is required' });

  // Test missing index
  response = await request.get(`/api/search/document?id=${documentId}`);
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'index is required' });
});
