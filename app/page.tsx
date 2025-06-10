import type { Metadata } from 'next';
import { SearchProvider } from '@/contexts/search-context';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { AggOptions } from '@/types/aggregation';
import type { ApiResponseSearch } from '@/types/apiResponseSearch';
import type { BaseDocument, TermDocument } from '@/types/document';
import { siteConfig } from '@/config/site';
import { search } from '@/lib/elasticsearch/search/search';
import {
  getSanitizedSearchParams,
  LAYOUT_GRID,
} from '@/lib/elasticsearch/search/searchParams';
import type {
  GenericSearchParams,
  LayoutType,
} from '@/lib/elasticsearch/search/searchParams';
import { ArtworkCard } from '@/components/artwork/artwork-card';
import { ContentCard } from '@/components/search-card/content-card';
import { EventCard } from '@/components/search-card/event-card';
import { ImageNewsCard } from '@/components/search-card/image-news-card';
import { NewsCard } from '@/components/search-card/news-card';
import { ArtSearchCheckboxes } from '@/components/search/art-search-checkboxes';
import { ArtistTermCard } from '@/components/search/artist-term-card';
import { EventSearchCheckboxes } from '@/components/search/event-search-checkboxes';
import { SearchAsYouTypeInput } from '@/components/search/search-as-you-type-input';
import { SearchDidYouMean } from '@/components/search/search-did-you-mean';
import { SearchFilterTags } from '@/components/search/search-filter-tags';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchPagination } from '@/components/search/search-pagination';

function getLayoutGridClass(layout: LayoutType) {
  if (layout === LAYOUT_GRID)
    return 'my-4 relative grid grid-cols-1 gap-8 pb-8 md:grid-cols-2 md:pb-10 lg:grid-cols-3';
  return 'my-4 relative grid grid-cols-1 gap-8 pb-8 md:pb-10';
}

export type PageProps = {
  params: Promise<{ index: string }>;
  searchParams: Promise<GenericSearchParams>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const sanitizedParams = getSanitizedSearchParams(params.index, searchParams);

  let title = 'musefully';
  let description = 'Musefully browse the art world.';

  if (sanitizedParams.query) {
    title = `"${sanitizedParams.query}" | musefully`;
    description = `Search results for "${sanitizedParams.query}" - browse artworks, exhibitions, and art news.`;
  } else if (sanitizedParams.index === 'art') {
    title = 'Art Collection | musefully';
    description =
      'Browse thousands of artworks from major museums and collections worldwide.';
  } else if (sanitizedParams.index === 'news') {
    title = 'Art News | musefully';
    description =
      'Latest art news, reviews, and articles from leading art publications.';
  } else if (sanitizedParams.index === 'events') {
    title = 'Art Events & Exhibitions | musefully';
    description =
      'Discover current and upcoming art exhibitions, events, and cultural happenings.';
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'musefully',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const dict = getDictionary();
  let errorMessage = dict['search.noResults'];

  const isMultiSource = siteConfig.isMultiSource;

  const sanitizedParams = getSanitizedSearchParams(params.index, searchParams);

  // Query Elasticsearch
  let response: ApiResponseSearch = await search(sanitizedParams);
  const items: BaseDocument[] = response?.data || [];
  const terms: TermDocument[] = response?.terms || [];
  const filters: TermDocument[] = response?.filters || [];
  const apiError = response?.error || '';
  const options: AggOptions = response?.options || {};
  const count = response?.metadata?.count || 0;
  const totalPages = response?.metadata?.pages || 0;

  return (
    <SearchProvider
      searchParams={sanitizedParams}
      options={options}
      count={count}
      totalPages={totalPages}
      isMultiSource={isMultiSource}
    >
      <section className="container pt-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="grow">
            <SearchAsYouTypeInput />
          </div>
          {sanitizedParams.index === 'art' && (
            <ArtSearchCheckboxes searchParams={sanitizedParams} />
          )}
          {sanitizedParams.index === 'events' && (
            <EventSearchCheckboxes searchParams={sanitizedParams} />
          )}
        </div>
        <SearchFilterTags searchParams={sanitizedParams} />
        <div className="gap-6 pb-8 pt-2 sm:grid sm:grid-cols-3 md:grid-cols-4 md:pt-4">
          {sanitizedParams.isShowFilters && (
            <aside
              className="hidden h-full space-y-2 sm:col-span-1 sm:block"
              aria-label="Search filters"
            >
              <SearchFilters />
            </aside>
          )}
          <main
            className={
              sanitizedParams.isShowFilters
                ? 'sm:col-span-2 md:col-span-3'
                : 'sm:col-span-3 md:col-span-4'
            }
            role="main"
            aria-label="Search results"
          >
            {apiError?.length > 0 && (
              <h3 className="mb-6 text-lg font-extrabold leading-tight tracking-tighter text-red-800">
                {apiError}
              </h3>
            )}

            <ArtistTermCard filters={filters} />

            <div className="flex w-full">
              <div className="w-full">
                <SearchPagination isShowViewOptions={true} />
              </div>
            </div>

            <SearchDidYouMean terms={terms} />

            <div className={getLayoutGridClass(sanitizedParams.layout)}>
              {items?.length > 0 &&
                items.map((item: BaseDocument, index: number) => {
                  if (!item) return null;

                  return (
                    <div key={item._id}>
                      {item.type === 'artwork' && !sanitizedParams.cardType && (
                        <ArtworkCard
                          item={item}
                          showType={sanitizedParams.index === 'all'}
                          showColor={sanitizedParams.hexColor ? true : false}
                          layout={sanitizedParams.layout}
                          isMultiSource={isMultiSource}
                        />
                      )}
                      {item.type === 'news' && (
                        <ContentCard
                          item={item}
                          showType={sanitizedParams.index === 'all'}
                          layout={sanitizedParams.layout}
                          isMultiSource={isMultiSource}
                        />
                      )}
                      {(item.type === 'exhibition' ||
                        item.type === 'event') && (
                        <EventCard
                          item={item}
                          showType={sanitizedParams.index === 'all'}
                          layout={sanitizedParams.layout}
                          isMultiSource={isMultiSource}
                        />
                      )}
                      {item.sourceId === 'newyorkercartoon' && (
                        <ImageNewsCard
                          item={item}
                          showType={sanitizedParams.index === 'all'}
                          layout={sanitizedParams.layout}
                          isMultiSource={isMultiSource}
                        />
                      )}
                      {item.type === 'rss' &&
                        item.sourceId !== 'newyorkercartoon' && (
                          <NewsCard
                            item={item}
                            showType={sanitizedParams.index === 'all'}
                            layout={sanitizedParams.layout}
                            isMultiSource={isMultiSource}
                          />
                        )}
                    </div>
                  );
                })}
              {!(items?.length > 0) && (
                <h3 className="my-10 mb-4 text-lg md:text-xl">
                  {errorMessage}
                </h3>
              )}
            </div>
            <SearchPagination isShowViewOptions={false} />
          </main>
        </div>
      </section>
    </SearchProvider>
  );
}
