import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: process.env.AWS_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

async function uploadLogo() {
    try {
        const logoPath = path.resolve(__dirname, "../../web/public/logo.png");
        const fileBuffer = fs.readFileSync(logoPath);

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: "public/logo.png",
            Body: fileBuffer,
            ContentType: "image/png",
        });

        await s3.send(command);
        console.log("Logo successfully uploaded to R2.");
        console.log(`URL should be: ${process.env.AWS_URL}/public/logo.png`);
    } catch (e) {
        console.error("Failed to upload logo:", e);
    }
}

uploadLogo();
