import SearchPage from '../page';
import type { PageProps } from '../page';

/**
 * Tried to use [[...index]] but it didn't work
 */
export default async function Page(props: PageProps) {
  return SearchPage(props);
}
