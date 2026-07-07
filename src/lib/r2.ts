import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { R2Config } from '@/types';

export const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET || 'photos';

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    });
  }
  return _client;
}

export function createR2ClientFromConfig(config: R2Config): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export function isR2Configured(): boolean {
  const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
  const key = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secret = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  if (!endpoint || !key || !secret) return false;
  if (endpoint.includes('localhost') || key === 'placeholder' || secret === 'placeholder') return false;
  return true;
}

export async function getPresignedUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresInSeconds: number = 900
) {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return { url, key };
}

export async function getPresignedUploadUrlWithClient(
  client: S3Client,
  bucket: string,
  key: string,
  contentType: string,
  expiresInSeconds: number = 900
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return { url, key };
}

export async function getPresignedDownloadUrl(
  client: S3Client,
  bucket: string,
  key: string,
  expiresInSeconds: number = 3600
) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const url = await getSignedUrl(client, command, { expiresIn: expiresInSeconds });
  return url;
}
