export declare class UploadService {
    private readonly logger;
    private readonly s3Client;
    private readonly bucketName;
    private readonly publicUrl;
    constructor();
    uploadFile(file: Express.Multer.File, folder?: string): Promise<string>;
    getPresignedUrl(keyOrUrl: string, expiresIn?: number): Promise<string>;
}
