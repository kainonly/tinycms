'use server';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from '@bootstrap';
import { format } from 'date-fns';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey
  },
  region: config.s3.region,
  endpoint: config.s3.endpoint
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return Response.json({ msg: '尚未接收到文件' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const now = new Date();
  const filename = `/${config.name}/${format(now, 'yyyyMMdd')}/${nanoid()}`;
  await s3Client.send(new PutObjectCommand({ Bucket: config.s3.bucket, Key: filename, Body: buffer }));
  return Response.json({ location: filename });
}
