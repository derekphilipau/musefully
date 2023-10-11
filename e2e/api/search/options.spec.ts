import { expect, test } from '@playwright/test';

test('should retrieve aggregation options based on the provided index and field', async ({
  request,
}) => {
  const indexName = 'art';
  const fieldName = 'primaryConstituent.canonicalName';
  const query = 'picasso';

  const response = await request.get(
    `/api/search/options?index=${indexName}&field=${fieldName}&q=${query}`
  );

  expect(response.ok()).toBeTruthy();

  const aggOptions = await response.json();

  expect(Array.isArray(aggOptions)).toBeTruthy();
  aggOptions.forEach((option) => {
    expect(option).toHaveProperty('key');
    expect(typeof option.key).toBe('string');
    expect(option).toHaveProperty('doc_count');
    expect(Number.isInteger(option.doc_count)).toBeTruthy();
  });
  expect(aggOptions[0].key).toBe('Picasso, Pablo');
});

test('should return error when index or field is not provided', async ({
  request,
}) => {
  let response = await request.get(
    `/api/search/options?field=primaryConstituent.canonicalName`
  );
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: 'index and field are required',
  });

  response = await request.get(`/api/search/options?index=art`);
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({
    error: 'index and field are required',
  });
});
