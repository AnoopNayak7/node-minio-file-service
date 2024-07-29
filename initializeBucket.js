const Minio = require('minio');
require('dotenv').config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});

async function ensureBucketExists(bucketName) {
  return new Promise((resolve, reject) => {
    minioClient.bucketExists(bucketName, (err) => {
      if (err) {
        if (err.code === 'NoSuchBucket') {
          minioClient.makeBucket(bucketName, 'us-east-1', (err) => {
            if (err) return reject(err);
            console.log(`Bucket ${bucketName} created successfully in "us-east-1".`);
            resolve();
          });
        } else {
          return reject(err);
        }
      } else {
        resolve();
      }
    });
  });
}

ensureBucketExists(process.env.MINIO_BUCKET_NAME)
  .then(() => {
    console.log('Bucket is ready.');
  })
  .catch((err) => {
    console.error('Error initializing bucket:', err);
  });
