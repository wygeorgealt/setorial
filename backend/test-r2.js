require('dotenv/config');
const { S3Client, PutObjectCommand, ListBucketsCommand } = require('@aws-sdk/client-s3');

const endpoint = process.env.AWS_ENDPOINT;
const bucket = process.env.AWS_BUCKET;
const region = process.env.AWS_REGION;

console.log('--- R2 Config ---');
console.log('Endpoint:', endpoint);
console.log('Bucket:', bucket);
console.log('Region:', region);
console.log('Access Key:', process.env.AWS_ACCESS_KEY_ID ? '✅ set' : '❌ missing');
console.log('Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ set' : '❌ missing');
console.log('');

const s3 = new S3Client({
  region: region || 'auto',
  endpoint: endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function test() {
  try {
    console.log('1. Testing connection (ListBuckets)...');
    const listRes = await s3.send(new ListBucketsCommand({}));
    console.log('   ✅ Connected! Buckets:', listRes.Buckets.map(b => b.Name).join(', '));
  } catch (err) {
    console.log('   ❌ ListBuckets failed:', err.message);
  }

  try {
    console.log('2. Testing upload (PutObject)...');
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: 'test/hello.txt',
      Body: Buffer.from('Hello from Setorial test!'),
      ContentType: 'text/plain',
    }));
    console.log('   ✅ Upload success! File at: test/hello.txt');
    console.log('   Public URL:', `${process.env.AWS_URL}/test/hello.txt`);
  } catch (err) {
    console.log('   ❌ Upload failed:', err.message);
  }
}

test();
