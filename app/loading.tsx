import { SearchResultsSkeleton } from '@/components/skeletons/search-results-skeleton';

export default function Loading() {
  return <SearchResultsSkeleton itemType="mixed" showFilters={true} />;
}
