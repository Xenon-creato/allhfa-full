import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function deleteImage(key: string) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadImage({
  buffer,
  key,
  contentType,
}: {
  buffer: Buffer
  key: string
  contentType: string
}) {
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  )

  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${key}`;
}
