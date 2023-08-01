import React, { useEffect, useState } from 'react';
import OpenSeaDragon from 'openseadragon';

const OpenSeaDragonViewer = ({ image }) => {
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    setViewer(
      OpenSeaDragon({
        id: 'openSeaDragon',
        prefixUrl: '/img/openseadragon-images/',
        showNavigationControl: false,
        animationTime: 0.5,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2,
        minZoomLevel: 1,
        visibilityRatio: 1,
        zoomPerScroll: 2,
        tileSources: {
          type: 'image',
          url: image,
          buildPyramid: false,
        },
      })
    );
  }, [image]);

  return (
    <div
      id="openSeaDragon"
      style={{
        border: 'none',
        margin: '0px',
        padding: '0px',
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        top: '0px',
        left: '0px',
        touchAction: 'none',
        textAlign: 'left',
      }}
    ></div>
  );
};
export default OpenSeaDragonViewer;
