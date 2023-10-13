import { PutObjectCommand, S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const REGION = process.env.AWS_REGION;
console.log(REGION);
const s3Client = new S3Client({ region: REGION });

export async function uploadToS3(key: string, buffer: Buffer) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: buffer,
  });

  try {
    await s3Client.send(command);
  } catch (err) {
    console.error(err);
  }
}

export async function exists(key: string): Promise<boolean> {
  const input = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  }
  const command = new HeadObjectCommand(input);
  try {
    const response = await s3Client.send(command);
    if (response.$metadata.httpStatusCode === 200) return true;  
  } catch(err) {
    // Assume not found exception
  }
  return false;
}
