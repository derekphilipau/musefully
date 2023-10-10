import convert from 'color-convert';
import getPixels from 'get-pixels';
import ndarray from 'ndarray';
import kmeans from 'node-kmeans';

const ALPHA_THRESHOLD = 125; // Minimum alpha value (transparency) for a pixel to be considered
const KMEANS_SEED = 0.3; // Seed value for the k-means clustering
const VALUE_MIN = 5; // Minimum value value for a pixel to be considered
const VALUE_MAX = 100; // Maximum value value for a pixel to be considered
const SATURATION_MIN = 10; // Minimum saturation value for a pixel to be considered
const SATURATION_MAX = 100; // Maximum saturation value for a pixel to be considered
const SATURATION_BOOST = 0; // Amount to boost saturation by (0-100)
const VALUE_BOOST = 0; // Amount to boost value by (0-100)
const SAMPLE_RATE = 0.009; // Higher values will sample more pixels

interface Cluster {
  centroid: number[];
  cluster: number[][];
}

// Define type for the color palette
interface ColorPalette {
  lab: number[];
  rgb: number[];
  hex: string;
  hsv: number[];
  percent: number;
}

/**
 * Get pixels from an image and convert it into an ndarray of pixels
 * TODO: Add ndarray type
 *
 * @param {*} imageUrlOrPath URL or path to the image
 * @returns ndarray of pixels
 */
async function getPixelsAsync(imageUrlOrPath: string): Promise<ndarray> {
  return new Promise<ndarray>((resolve, reject) => {
    getPixels(imageUrlOrPath, (err, pixels) => {
      if (err) {
        reject(err);
      } else {
        resolve(pixels);
      }
    });
  });
}

/**
 * Calculate the distance between two colors in the Lab color space
 *
 * @param {*} p
 * @param {*} q
 * @returns
 */
function labDistance(p, q) {
  const labDifference = Math.sqrt(
    (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2
  );
  return labDifference;
}

async function getKmeansClusters(points, numClusters) {
  return new Promise((resolve, reject) => {
    kmeans.clusterize(
      points,
      {
        k: numClusters,
        seed: KMEANS_SEED,
        distance: (p, q) => labDistance(p, q),
      },
      (err, res) => {
        if (err) reject(err);
        else resolve(res);
      }
    );
  });
}

/**
 * @param {ndarray} pixels
 * @param {number} valueMin
 * @param {number} valueMax
 * @param {number} saturationMin
 * @param {number} saturationMax
 * @param {number} valueBoost
 * @param {number} saturationBoost
 * @returns {number[][]}
 */
function getSampledFlatPixelArray(
  pixels: any, // ndarray
  valueMin: number,
  valueMax: number,
  saturationMin: number,
  saturationMax: number,
  valueBoost: number,
  saturationBoost: number
): number[][] {
  const totalImagePixels = pixels.shape[0] * pixels.shape[1];

  // For performance reasons, take a higher percentage of pixels for smaller images:
  const numberPixelsToSample = Math.min(
    totalImagePixels,
    Math.round(SAMPLE_RATE * totalImagePixels + 4000)
  );
  const pixelArray: number[][] = [];
  let i: number, j: number, idx: number;
  // Randomly sample pixels from the image
  for (let count = 0; count < numberPixelsToSample; count++) {
    i = Math.floor(Math.random() * pixels.shape[0]);
    j = Math.floor(Math.random() * pixels.shape[1]);

    idx = (i * pixels.shape[1] + j) * pixels.shape[2];
    // Get rgba pixels
    let [r, g, b, a] = [
      pixels.data[idx],
      pixels.data[idx + 1],
      pixels.data[idx + 2],
      pixels.data[idx + 3],
    ];
    // Don't include transparent pixels
    if (typeof a === 'undefined' || a >= ALPHA_THRESHOLD) {
      let [h, s, v] = convert.rgb.hsv(r, g, b);
      if (saturationBoost || valueBoost) {
        // Increase the saturation and value by the specified amounts
        s = Math.min(s + saturationBoost, 100);
        v = Math.min(v + valueBoost, 100);
      }
      // Skip pixels that fall outside saturation and value ranges
      if (
        v >= valueMin &&
        v <= valueMax &&
        s >= saturationMin &&
        s <= saturationMax
      ) {
        pixelArray.push(convert.hsv.lab(h, s, v));
      }
    }
  }
  return pixelArray;
}

/**
 * @param {string} imageUrlOrPath
 * @param {number} numColors
 * @param {number} valueMin
 * @param {number} valueMax
 * @param {number} saturationMin
 * @param {number} saturationMax
 * @param {number} valueBoost
 * @param {number} saturationBoost
 * @param {boolean} isSortedByHue
 * @returns {Promise<ColorPalette[]>}
 */
export default async function dominantColors(
  imageUrlOrPath: string,
  numColors: number,
  valueMin: number = VALUE_MIN,
  valueMax: number = VALUE_MAX,
  saturationMin: number = SATURATION_MIN,
  saturationMax: number = SATURATION_MAX,
  valueBoost: number = VALUE_BOOST,
  saturationBoost: number = SATURATION_BOOST,
  isSortedByHue: boolean = false
): Promise<ColorPalette[]> {
  try {
    // return an empty array if any errors occur
    if (!imageUrlOrPath) return [];
    const pixels = await getPixelsAsync(imageUrlOrPath);

    let dataArray = getSampledFlatPixelArray(
      pixels,
      valueMin,
      valueMax,
      saturationMin,
      saturationMax,
      valueBoost,
      saturationBoost
    );

    let clusters;
    try {
      clusters = await getKmeansClusters(dataArray, numColors);
    } catch (error) {
      // If k-means clustering fails, try again without filtering pixels
      let dataArray = getSampledFlatPixelArray(pixels, 0, 100, 0, 100, 0, 0);
      clusters = await getKmeansClusters(dataArray, numColors);
    }

    const totalLength = clusters.reduce(
      (acc, cluster) => acc + cluster.cluster.length,
      0
    );

    // Map clusters to an array of objects, where each object contains the color and
    // its hue value, along with the percent.
    const palette = clusters.map((cluster) => {
      return {
        lab: cluster.centroid,
        rgb: convert.lab.rgb(cluster.centroid),
        hex: convert.lab.hex(cluster.centroid),
        hsv: convert.lab.hsv(cluster.centroid),
        percent: cluster.cluster.length / totalLength,
      };
    });

    if (isSortedByHue) {
      // Sort the clusters by hue value
      palette.sort((a, b) => a.hsv[0] - b.hsv[0]);
    }

    return palette;
  } catch (error) {
    return [];
  }
}
