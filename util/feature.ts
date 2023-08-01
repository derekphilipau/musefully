import { getDocument } from '@/util/elasticsearch/search/document';

import type { ApiResponseDocument } from '@/types/apiResponseDocument';
import type { CollectionObjectDocument } from '@/types/collectionObjectDocument';

async function getCollectionObject(id: string): Promise<ApiResponseDocument> {
  const data = await getDocument('collections', id, false);
  return data;
}

export async function getTourObjects(tour: any) {
  const tourObjects: any = [];
  for (let i = 0; i < tour.tourObjects.length; i++) {
    const tourObject = tour.tourObjects[i];
    const res: ApiResponseDocument = await getCollectionObject(tourObject._id);
    const collectionObject = res?.data as CollectionObjectDocument;
    if (collectionObject?.id) {
      tourObjects.push({ ...tourObject, ...collectionObject });
    }
  }
  tour.tourObjects = tourObjects;
  return tour;
}
