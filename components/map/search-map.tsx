export {};
/*
 * NOT IN USE, COLLECTIONS GEO METADATA NOT USEFUL
 */
/*
'use client';

import * as React from 'react';
import Map, { Layer, Source } from 'react-map-gl';

import { countries } from './countries';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ArtworkDocument } from '@/types/artworkDocument';

//const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;
const MAPBOX_TOKEN =
  'pk.eyJ1IjoiZGVyZWthdSIsImEiOiJjbGZhMGVkZTUwMHVqM3Buengwd2pscjFiIn0.oMkDLB0OcnqSS3jrjlC54A';
console.log('amp token', MAPBOX_TOKEN);

const layerStyle = {
  id: 'point',
  type: 'circle',
  paint: {
    'circle-radius': 10,
    'circle-color': '#007cbf',
  },
};

export function SearchMap({ items }: { items: ArtworkDocument[] }) {
  const [viewport, setViewport] = React.useState();

  if (!MAPBOX_TOKEN || !(items?.length > 0)) return null;

  // create an array of points from items:
  const features = items
    .map((item) => {
      console.log('item', item);
      if (item.geographicalCoordinates) {
        return {
          type: 'Feature',
          properties: {
            id: item.id,
            title: item.title,
          },
          geometry: {
            type: 'Point',
            coordinates: [
              item.geographicalCoordinates.lon,
              item.geographicalCoordinates.lat,
            ],
          },
        };
      }
      return null;
    })
    .filter((point) => point !== null);

  console.log('my features', features);
  const geojson = {
    type: 'FeatureCollection',
    features,
  };

  return (
    <Map
      initialViewState={{
        zoom: 1,
      }}
      style={{ width: '100%', height: 400 }}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <Source id="my-data" type="geojson" data={geojson}>
        <Layer {...layerStyle} />
      </Source>
    </Map>
  );
}
*/
