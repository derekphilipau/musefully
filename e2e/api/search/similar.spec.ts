import { expect, test } from '@playwright/test';

test('should retrieve similar artworks based on the provided id', async ({
  request,
}) => {
  const searchResponse = await request.get(
    '/api/search?index=art&hasPhoto=true&size=1'
  );
  expect(searchResponse.ok()).toBeTruthy();
  const searchData = await searchResponse.json();
  const firstResult = searchData?.data?.[0];
  expect(firstResult).toBeTruthy();

  const artworkId = firstResult._id;

  const response = await request.get(
    `/api/search/similar?id=${artworkId}&hasPhoto=true`
  );

  expect(response.ok()).toBeTruthy();

  const similarArtworks = await response.json();

  expect(Array.isArray(similarArtworks)).toBeTruthy();
  similarArtworks.forEach((artwork) => {
    expect(artwork).toHaveProperty('id');
    expect(typeof artwork.id).toBe('string');
    if (artwork.image) {
      expect(typeof artwork.image).toBe('object');
    }
  });
});

test('should return error when id is not provided', async ({ request }) => {
  const response = await request.get('/api/search/similar');
  const status = response.status();
  expect(status).toBe(400);
  expect(await response.json()).toEqual({ error: 'Invalid id' });
});
