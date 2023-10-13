import axios from 'axios';
import sharp from 'sharp';

import { exists, uploadToS3 } from './s3';

/**
 * Process an image for a document, return image name if successful.
 *
 * @param url URL of original image
 * @param id ID of document
 * @param indexName Index name e.g. "art"
 * @returns Image name if successful, undefined otherwise
 */
export async function processDocumentImage(
  url: string,
  id: string,
  indexName: string,
  overwrite = false
): Promise<boolean> {
  if (!url || !indexName || !id) return false;
  const name = `${indexName}/${id}`; // e.g. art/bkm-12345
  const result = await processAndUploadImage(url, name, overwrite);
  console.log(`Processed ${indexName} ID ${id}, url: ${url}`);
  return result;
}

/**
 * Create resized versions of an image in jpg & webp formats and upload to S3.
 *
 * @param url URL of original image
 * @param name Name of image to be used as prefix for resized versions
 * @returns
 */
async function processAndUploadImage(
  url: string,
  name: string,
  overwrite: boolean
): Promise<boolean> {
  let buffer: Buffer;

  if (!url) return false;

  if (
    !overwrite &&
    (await exists(`${name}-s.webp`)) // Assume all sizes exist if small webp exists
    //(await exists(`${name}-s.jpg`)) &&
    //(await exists(`${name}-s.webp`)) &&
    //(await exists(`${name}-m.webp`)) &&
    //(await exists(`${name}-l.webp`))
  ) {
    console.log('Image already exists, skipping processing.');
    return true;
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    buffer = Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error(
      `Failed to download image from URL: ${url}. Error: ${error.message}`
    );
    return false;
  }

  const meta = await sharp(buffer).metadata();

  // Use small jpg for fallback, otherwise webp:
  if (!await resizeAndUploadImage(buffer, meta, name, 's', 'jpg')) return false;
  if (!await resizeAndUploadImage(buffer, meta, name, 's', 'webp')) return false;
  if (!await resizeAndUploadImage(buffer, meta, name, 'm', 'webp')) return false;
  if (!await resizeAndUploadImage(buffer, meta, name, 'l', 'webp')) return false;

  return true;
}

async function resizeAndUploadImage(
  buffer: Buffer,
  meta: sharp.Metadata,
  name: string,
  sizeType: string,
  type: string
): Promise<boolean> {
  let size = 300;
  if (sizeType === 'm') size = 600;
  if (sizeType === 'l') size = 1200;
  try {
    const shouldResize =
      meta.width && meta.height && (meta.width > size || meta.height > size);

    if (type === 'jpg') {
      const jpgBuffer = shouldResize
        ? await sharp(buffer)
            .rotate() // auto-orient image based on EXIF data
            .resize({
              width: size,
              height: size,
              fit: 'inside',
            })
            .jpeg({ quality: 80 })
            .toBuffer()
        : buffer;
      await uploadToS3(`${name}-${sizeType}.jpg`, jpgBuffer);
    } else if (type === 'webp') {
      const webpBuffer = shouldResize
        ? await sharp(buffer)
            .rotate() // auto-orient image based on EXIF data
            .resize({
              width: size,
              height: size,
              fit: 'inside',
            })
            .webp({ quality: 80 })
            .toBuffer()
        : buffer;
      await uploadToS3(`${name}-${sizeType}.webp`, webpBuffer);
    }
    return true;
  } catch (error) {
    console.error(
      `Failed to process or upload image of size ${size}. Error: ${error.message}`
    );
    return false;
  }
}
