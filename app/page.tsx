import { Key } from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { AggOptions } from '@/types/aggOptions';
import type { ApiResponseSearch } from '@/types/apiResponseSearch';
import type { BaseDocument } from '@/types/baseDocument';
import type { Term } from '@/types/term';
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
import { ArtistTermCard } from '@/components/search/artist-term-card';
import { SearchAsYouTypeInput } from '@/components/search/search-as-you-type-input';
import { SearchCheckbox } from '@/components/search/search-checkbox';
import { SearchDidYouMean } from '@/components/search/search-did-you-mean';
import { SearchFilterTag } from '@/components/search/search-filter-tag';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchPagination } from '@/components/search/search-pagination';

function getLayoutGridClass(layout: LayoutType) {
  if (layout === LAYOUT_GRID)
    return 'my-4 relative grid grid-cols-1 gap-8 pb-8 md:grid-cols-2 md:pb-10 lg:grid-cols-3';
  return 'my-4 relative grid grid-cols-1 gap-8 pb-8 md:pb-10';
}

type Props = {
  params: { index: string };
  searchParams: GenericSearchParams;
};

export default async function Page({ params, searchParams }: Props) {
  const dict = getDictionary();
  let errorMessage = dict['search.noResults'];

  const isMultiSource = siteConfig.isMultiSource;

  const sanitizedParams = getSanitizedSearchParams(params.index, searchParams);

  const filterArr = Object.entries(sanitizedParams.aggFilters);

  // Query Elasticsearch
  let response: ApiResponseSearch = await search(sanitizedParams);
  const items: BaseDocument[] = response?.data || [];
  const terms: Term[] = response?.terms || [];
  const filters: Term[] = response?.filters || [];
  const apiError = response?.error || '';
  const options: AggOptions = response?.options || {};
  const count = response?.metadata?.count || 0;
  const totalPages = response?.metadata?.pages || 0;

  return (
    <section className="container pt-2">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <div className="grow">
          <SearchAsYouTypeInput params={searchParams} />
        </div>
        {sanitizedParams.index === 'art' && (
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <div className="flex items-center space-x-2">
              <SearchCheckbox
                params={searchParams}
                name="hasPhoto"
                value={sanitizedParams.hasPhoto}
                label={dict['search.hasPhoto']}
              />
            </div>
            <div className="flex items-center space-x-2">
              <SearchCheckbox
                params={searchParams}
                name="onView"
                value={sanitizedParams.onView}
                label={dict['search.onView']}
              />
            </div>
            <div className="flex items-center space-x-2">
              <SearchCheckbox
                params={searchParams}
                name="isUnrestricted"
                value={sanitizedParams.isUnrestricted}
                label={dict['search.openAccess']}
              />
            </div>
          </div>
        )}
      </div>
      {(filterArr?.length > 0 || sanitizedParams.hexColor) && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filterArr?.length > 0 &&
            filterArr.map(
              (filter, i) =>
                filter && (
                  <SearchFilterTag
                    key={i}
                    params={searchParams}
                    name={filter[0]}
                    value={filter[1]}
                  />
                )
            )}
          {sanitizedParams.hexColor && (
            <SearchFilterTag
              params={searchParams}
              name="color"
              value={sanitizedParams.hexColor}
            />
          )}
        </div>
      )}
      <div className="gap-6 pb-8 pt-2 sm:grid sm:grid-cols-3 md:grid-cols-4 md:pt-4">
        {sanitizedParams.isShowFilters && (
          <div className="hidden h-full space-y-2 sm:col-span-1 sm:block">
            <SearchFilters searchParams={sanitizedParams} options={options} />
          </div>
        )}
        <div
          className={
            sanitizedParams.isShowFilters
              ? 'sm:col-span-2 md:col-span-3'
              : 'sm:col-span-3 md:col-span-4'
          }
        >
          {apiError?.length > 0 && (
            <h3 className="mb-6 text-lg font-extrabold leading-tight tracking-tighter text-red-800">
              {apiError}
            </h3>
          )}

          <ArtistTermCard filters={filters} />

          <div className="flex w-full">
            <div className="w-full">
              <SearchPagination
                searchParams={sanitizedParams}
                isShowViewOptions={true}
                options={options}
                count={count}
                totalPages={totalPages}
              />
            </div>
          </div>

          <SearchDidYouMean terms={terms} />

          <div className={getLayoutGridClass(sanitizedParams.layout)}>
            {items?.length > 0 &&
              items.map(
                (item: any, i: Key) =>
                  item && (
                    <div className="" key={i}>
                      {item.type === 'artwork' && !sanitizedParams.cardType && (
                        <ArtworkCard
                          item={item}
                          layout={sanitizedParams.layout}
                          showType={sanitizedParams.index === 'all'}
                          showColor={sanitizedParams.hexColor ? true : false}
                          isMultiSource={isMultiSource}
                        />
                      )}
                      {item.type === 'news' && (
                        <ContentCard
                          item={item}
                          layout={sanitizedParams.layout}
                          showType={sanitizedParams.index === 'all'}
                          isMultiSource={isMultiSource}
                        />
                      )}
                      {(item.type === 'exhibition' ||
                        item.type === 'event') && (
                        <EventCard
                          item={item}
                          layout={sanitizedParams.layout}
                          showType={sanitizedParams.index === 'all'}
                          isMultiSource={isMultiSource}
                        />
                      )}
                      {item.sourceId === 'newyorkercartoon' && (
                        <ImageNewsCard
                          item={item}
                          layout={sanitizedParams.layout}
                          showType={sanitizedParams.index === 'all'}
                          isMultiSource={isMultiSource}
                        />
                      )}
                      {item.type === 'rss' &&
                        item.sourceId !== 'newyorkercartoon' && (
                          <NewsCard
                            item={item}
                            layout={sanitizedParams.layout}
                            showType={sanitizedParams.index === 'all'}
                            isMultiSource={isMultiSource}
                          />
                        )}
                    </div>
                  )
              )}
            {!(items?.length > 0) && (
              <h3 className="my-10 mb-4 text-lg md:text-xl">{errorMessage}</h3>
            )}
          </div>
          <SearchPagination
            searchParams={sanitizedParams}
            isShowViewOptions={false}
            options={options}
            count={count}
            totalPages={totalPages}
          />
        </div>
      </div>
    </section>
  );
}
