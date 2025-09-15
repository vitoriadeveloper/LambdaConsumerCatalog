import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { REGION } from "../constants/bucket.js";
import { streamToString } from "../utils/streamUtils.js";

const client = new S3Client({ region: REGION });

export async function getS3Object(bucket, key) {
  try {
    const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return streamToString(response.Body);
  } catch (error) {
    console.error("[getS3Object] - Erro ao obter objeto do bucket", error);
    throw error;
  }
}

export async function putS3Object(bucket, key, content) {
  try {
    return await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: content,
        ContentType: "application/json"
      })
    );
  } catch (error) {
    console.error("[putS3Object] - Erro ao enviar objeto para bucket", error);
    throw error;
  }
}
