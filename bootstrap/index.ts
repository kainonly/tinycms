import { PrismaClient } from '@prisma/client';

export const config = {
  production: process.env.NODE_ENV === 'production',
  name: process.env.NAME as string,
  key: process.env.KEY as string,
  public_url: process.env.PUBLIC_URL as string,
  s3: {
    accessKeyId: process.env.S3_ACCESSKEYID as string,
    secretAccessKey: process.env.S3_SECRETACCESSKEY as string,
    region: process.env.S3_REGION as string,
    endpoint: process.env.S3_ENDPOINT as string,
    bucket: process.env.S3_BUCKET as string
  }
};

export const db = new PrismaClient();
