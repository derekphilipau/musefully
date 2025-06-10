import { SearchResultsSkeleton } from '@/components/skeletons/search-results-skeleton';

export default function IndexLoading() {
  return <SearchResultsSkeleton itemType="mixed" showFilters={true} />;
}
