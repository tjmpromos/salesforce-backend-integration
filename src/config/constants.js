import { config } from "dotenv";
config();
export const PORT = process.env.PORT;
export const bucketRegion = process.env.AWS_BUCKET_REGION;
export const awsKeyId = process.env.AWS_KEY_ID;
export const awsKeySecret = process.env.AWS_KEY_SECRET;
export const bucketName = process.env.AWS_BUCKET_NAME;
export const username = process.env.USERNAME;
