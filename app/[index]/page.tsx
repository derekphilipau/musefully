import SearchPage from '../page';

/**
 * Tried to use [[...index]] but it didn't work
 */
export default async function Page({ params, searchParams }) {
  return SearchPage({ params, searchParams });
}
