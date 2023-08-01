import type { Metadata } from 'next';
import Script from 'next/script';
import { getDictionary } from '@/dictionaries/dictionaries';
import { getDocument } from '@/util/elasticsearch/search/document';
import { getSchemaVisualArtworkJson } from '@/util/schema';
import { getCaption } from '@/util/various';
import { encode } from 'html-entities';

import type { ApiResponseDocument } from '@/types/apiResponseDocument';
import type { CollectionObjectDocument } from '@/types/collectionObjectDocument';
import { siteConfig } from '@/config/site';
import { ImageViewer } from '@/components/collection-object-image/image-viewer';
import { CollectionObjectDescription } from '@/components/collection-object/collection-object-description';
import { CollectionObjectShare } from '@/components/collection-object/collection-object-share';
import { LanguageDisclaimer } from '@/components/collection-object/language-disclaimer';
import { SimilarCollectionObjectList } from '@/components/collection-object/similar-collection-object-list';
import { MuseumMapDialog } from '@/components/museum-map/museum-map-dialog';

export async function generateMetadata({ params }): Promise<Metadata> {
  const id = params.slug[0];
  let data: ApiResponseDocument | undefined = undefined;
  try {
    data = await getDocument('collections', id);
  } catch (error) {
    console.log(error);
    return {};
    // don't do anything so that the error page can be rendered later
  }

  const collectionObject = data?.data as CollectionObjectDocument;
  if (!collectionObject) return {};

  const caption = encode(getCaption(collectionObject));
  const images = [collectionObject?.image?.thumbnailUrl || ''];

  return {
    title: collectionObject.title,
    description: caption,
    openGraph: {
      title: collectionObject.title || '',
      description: caption,
      images,
    },
  };
}

export default async function Page({ params }) {
  const id = params.slug[0];
  const dict = getDictionary();
  const isMultiDataset = siteConfig.datasets.length > 1;

  let data: ApiResponseDocument = await getDocument('collections', id);

  if (!data?.data) {
    throw new Error('Collection object not found.');
  }

  const collectionObject = data?.data as CollectionObjectDocument;
  const similarCollectionObjects = data?.similar as CollectionObjectDocument[];
  const jsonLd = getSchemaVisualArtworkJson(collectionObject);

  return (
    <>
      <section className="container grid gap-x-12 gap-y-6 pb-8 pt-6 md:grid-cols-2 md:py-10 lg:grid-cols-8">
        <div className="flex items-start justify-center md:col-span-1 lg:col-span-3">
          <ImageViewer item={collectionObject} />
        </div>
        <div className="md:col-span-1 lg:col-span-5">
          {isMultiDataset && (
            <div className="mb-2 text-base text-neutral-700 dark:text-neutral-400">
              {dict[`dataset.${collectionObject?.source}.name`]}
            </div>
          )}
          <h1 className="mb-2 text-2xl font-bold leading-tight tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl">
            {collectionObject?.title}
          </h1>
          <div className="mb-4 text-neutral-700 dark:text-neutral-400">
            {collectionObject?.formattedDate}
          </div>
          <h2 className="text-lg md:text-xl">
            {collectionObject?.primaryConstituent?.name || 'Maker Unknown'}
          </h2>
          {collectionObject?.primaryConstituent?.dates && (
            <div className="mb-4 text-sm text-neutral-700 dark:text-neutral-400">
              {collectionObject?.primaryConstituent?.dates}
            </div>
          )}
          <h3 className="mb-4 font-semibold uppercase text-neutral-700 dark:text-neutral-400">
            {collectionObject?.departments?.map(
              (department, i) =>
                department && (
                  <span key={i}>{`${department}${i > 0 ? ', ' : ''}`}</span>
                )
            )}
          </h3>
          <div
            className="mb-4 text-neutral-700 dark:text-neutral-400"
            dangerouslySetInnerHTML={{
              __html: collectionObject?.description || '',
            }}
          ></div>
          <div>
            <CollectionObjectShare item={collectionObject} />
          </div>
          <div className="gap-x-4 pt-4 lg:flex">
            <div>
              <CollectionObjectDescription item={collectionObject} />
            </div>
            <div className="flex-0 my-4">
              <MuseumMapDialog item={collectionObject} />
            </div>
          </div>
          <div>
            <LanguageDisclaimer
              item={collectionObject}
              formId={process.env.FORMSPREE_FORM_ID}
            />
          </div>
        </div>
      </section>
      <SimilarCollectionObjectList
        title={dict['artwork.similar']}
        similar={similarCollectionObjects}
        isMultiDataset={isMultiDataset}
      />

      {/* https://beta.nextjs.org/docs/guides/seo */}
      <Script id="json-ld-script" type="application/ld+json">
        {jsonLd}
      </Script>
    </>
  );
}
