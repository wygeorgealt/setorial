import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName = process.env.AWS_BUCKET;
  private readonly publicUrl = process.env.AWS_URL;

  constructor() {
    if (!process.env.AWS_ENDPOINT) {
      this.logger.warn('AWS_ENDPOINT is not defined. File uploads may attempt to connect to AWS instead of Cloudflare R2.');
    }
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'auto',
      endpoint: process.env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
      forcePathStyle: true, // Crucial for R2 connection compatibility
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'avatars'): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      // Return the public URL
      return `${this.publicUrl}/${fileName}`;
    } catch (error) {
      this.logger.error(`Failed to upload file to R2: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPresignedUrl(keyOrUrl: string, expiresIn: number = 3600): Promise<string> {
    // If it's a full URL, extract the key
    let key = keyOrUrl;
    if (keyOrUrl.startsWith('http')) {
      key = keyOrUrl.replace(`${this.publicUrl}/`, '');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(`Failed to generate signed URL: ${error.message}`);
      return keyOrUrl; // Fallback to original
    }
  }
}
