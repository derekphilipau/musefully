import { expect, test } from '@playwright/test';

test('should retrieve a specific document by its ID', async ({ request }) => {
  const indexName = 'art';
  const searchResponse = await request.get(
    `/api/search?index=${indexName}&hasPhoto=true&size=1`
  );
  expect(searchResponse.ok()).toBeTruthy();

  const searchData = await searchResponse.json();
  const firstResult = searchData?.data?.[0];

  expect(firstResult).toBeTruthy();
  expect(firstResult).toHaveProperty('_id');

  const documentId = firstResult._id;

  const response = await request.get(
    `/api/search/document?id=${documentId}&index=${indexName}`
  );

  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  const document = data.data;

  expect(document).toHaveProperty('_id');
  expect(document._id).toStrictEqual(documentId);
  expect(document).toHaveProperty('sourceId');
  expect(document).toHaveProperty('title');
  expect(document).toHaveProperty('image');
  expect(document.image).toHaveProperty('url');
});

test('should return error when id or index is not provided', async ({
  request,
}) => {
  const indexName = 'art';
  const searchResponse = await request.get(
    `/api/search?index=${indexName}&hasPhoto=true&size=1`
  );
  expect(searchResponse.ok()).toBeTruthy();
  const searchData = await searchResponse.json();
  const documentId = searchData?.data?.[0]?._id;
  expect(documentId).toBeTruthy();

  // Test missing id
  let response = await request.get(`/api/search/document?index=${indexName}`);
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'id is required' });

  // Test missing index
  response = await request.get(`/api/search/document?id=${documentId}`);
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'index is required' });
});
