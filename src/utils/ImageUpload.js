import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  awsKeyId,
  awsKeySecret,
  bucketName,
  bucketRegion,
} from "../config/constants.js";

export const imageUploader = async (filePath, fileName) => {
  const s3 = new S3Client({
    region: bucketRegion,
    credentials: {
      accessKeyId: awsKeyId,
      secretAccessKey: awsKeySecret,
    },
  });

  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ACL: "public-read",
  };
  const command = new PutObjectCommand(params);
  await s3.send(command);
  return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${fileName}`;
};
