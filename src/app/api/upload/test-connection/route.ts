import { NextResponse } from 'next/server';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  const { endpoint, accessKeyId, secretAccessKey, bucketName } = await request.json();

  try {
    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });

    await client.send(new ListBucketsCommand({}));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Connection failed' }, { status: 400 });
  }
}
