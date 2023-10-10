import type { ApiResponseDocument } from '@/types/apiResponseDocument';
import type { ArtworkDocument } from '@/types/artworkDocument';
import { getDocument } from '@/lib/elasticsearch/search/document';

async function getArtwork(id: string): Promise<ApiResponseDocument> {
  const data = await getDocument('art', id, false);
  return data;
}

export async function getTourArtworks(tour: any) {
  const tourArtworks: any = [];
  for (let i = 0; i < tour.tourArtworks.length; i++) {
    const tourArtwork = tour.tourArtworks[i];
    const res: ApiResponseDocument = await getArtwork(tourArtwork._id);
    const artwork = res?.data as ArtworkDocument;
    if (artwork?.id) {
      tourArtworks.push({ ...tourArtwork, ...artwork });
    }
  }
  tour.tourArtworks = tourArtworks;
  return tour;
}
