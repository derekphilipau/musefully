import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { getDictionary } from '@/dictionaries/dictionaries';
import { getDocument } from '@/util/elasticsearch/search/document';
import { getSchemaVisualArtworkJson } from '@/util/schema';
import { getCaption } from '@/util/various';
import { encode } from 'html-entities';

import type { ApiResponseDocument } from '@/types/apiResponseDocument';
import type { ArtworkDocument } from '@/types/artworkDocument';
import { siteConfig } from '@/config/site';
import { ArtworkDescription } from '@/components/artwork/artwork-description';
import { ArtworkShare } from '@/components/artwork/artwork-share';
import { LanguageDisclaimer } from '@/components/artwork/language-disclaimer';
import { SimilarArtworkList } from '@/components/artwork/similar-artwork-list';
import { Icons } from '@/components/icons';
import { DocumentImage } from '@/components/image/document-image';
import { ImageZoom } from '@/components/image/image-zoom';
import { SourceHeader } from '@/components/source/source-header';
import { buttonVariants } from '@/components/ui/button';

export async function generateMetadata({ params }): Promise<Metadata> {
  const id = params.slug[0];
  let data: ApiResponseDocument | undefined = undefined;
  try {
    data = await getDocument('art', id);
  } catch (error) {
    console.log(error);
    return {};
    // don't do anything so that the error page can be rendered later
  }

  const artwork = data?.data as ArtworkDocument;
  if (!artwork) return {};

  const caption = encode(getCaption(artwork));
  const images = [artwork?.image?.thumbnailUrl || ''];

  return {
    title: artwork.title,
    description: caption,
    openGraph: {
      title: artwork.title || '',
      description: caption,
      images,
    },
  };
}

export default async function Page({ params }) {
  const id = params.slug[0];
  const dict = getDictionary();
  const isMultiSource = siteConfig.isMultiSource;

  let data: ApiResponseDocument = await getDocument('art', id);

  if (!data?.data) {
    throw new Error('Artwork not found.');
  }

  const artwork = data?.data as ArtworkDocument;
  const similarArtworks = data?.similar as ArtworkDocument[];
  const jsonLd = getSchemaVisualArtworkJson(artwork);

  const IMAGE_DOMAIN = process.env.IMAGE_DOMAIN || '';

  return (
    <>
      <section className="container grid gap-x-12 gap-y-6 pb-8 pt-2 md:grid-cols-2 md:pb-10 md:pt-4 lg:grid-cols-8">
        <div className="flex items-start justify-center md:col-span-1 lg:col-span-3">
          {artwork?.copyrightRestricted || !artwork?.publicAccess ? (
            <DocumentImage
              item={artwork}
              imageDomain={IMAGE_DOMAIN}
              className="mb-4"
              caption={getCaption(artwork, artwork?.image?.url)}
            />
          ) : (
            <ImageZoom item={artwork} imageDomain={IMAGE_DOMAIN} />
          )}
        </div>
        <div className="md:col-span-1 lg:col-span-5">
          {isMultiSource && <SourceHeader item={artwork} />}
          <h1 className="mb-2 text-2xl font-bold leading-tight tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl">
            {artwork?.title}
          </h1>
          <div className="mb-4 text-neutral-700 dark:text-neutral-400">
            {artwork?.formattedDate}
          </div>
          <h2 className="text-lg md:text-xl">
            {artwork?.primaryConstituent?.name || 'Maker Unknown'}
          </h2>
          {artwork?.primaryConstituent?.dates && (
            <div className="mb-4 text-sm text-neutral-700 dark:text-neutral-400">
              {artwork?.primaryConstituent?.dates}
            </div>
          )}
          <h3 className="mb-4 font-semibold uppercase text-neutral-700 dark:text-neutral-400">
            {artwork?.departments?.map(
              (department, i) =>
                department && (
                  <span key={i}>{`${department}${i > 0 ? ', ' : ''}`}</span>
                )
            )}
          </h3>
          <div
            className="mb-4 text-neutral-700 dark:text-neutral-400"
            dangerouslySetInnerHTML={{
              __html: artwork?.description || '',
            }}
          ></div>
          <div className="flex gap-x-2">
            <ArtworkShare item={artwork} />
            {artwork?.url && (
              <Link
                className={buttonVariants({ variant: 'outline' })}
                href={artwork?.url}
              >
                <Icons.link className="mr-2 h-5 w-5" />
                {dict['button.source']}
              </Link>
            )}
          </div>
          <div className="gap-x-4 pt-4 lg:flex">
            <ArtworkDescription item={artwork} />
          </div>
          <div>
            <LanguageDisclaimer
              item={artwork}
              formId={process.env.FORMSPREE_FORM_ID}
            />
          </div>
        </div>
      </section>
      <SimilarArtworkList
        title={dict['artwork.similar']}
        similar={similarArtworks}
        isMultiSource={isMultiSource}
        imageDomain={IMAGE_DOMAIN}
      />

      {/* https://beta.nextjs.org/docs/guides/seo */}
      <Script id="json-ld-script" type="application/ld+json">
        {jsonLd}
      </Script>
    </>
  );
}
