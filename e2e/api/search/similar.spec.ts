import { expect, test } from '@playwright/test';

test('should retrieve similar artworks based on the provided id', async ({
  request,
}) => {
  const ARTWORK_ID = 'bkm_9448';
  const HAS_PHOTO = true;

  const response = await request.get(
    `/api/search/similar?id=${ARTWORK_ID}&hasPhoto=${HAS_PHOTO}`
  );

  expect(response.ok()).toBeTruthy();

  const similarArtworks = await response.json();

  expect(Array.isArray(similarArtworks)).toBeTruthy();
  similarArtworks.forEach((artwork) => {
    expect(artwork).toHaveProperty('id');
    expect(typeof artwork.id).toBe('string');
    if (HAS_PHOTO) {
      expect(artwork).toHaveProperty('image');
      expect(typeof artwork.image).toBe('object');
    }
  });
});

test('should return error when id is not provided', async ({ request }) => {
  const response = await request.get('/api/search/similar');
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'Invalid id' });
});
