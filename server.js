const express = require("express");
const multer = require("multer");
const Minio = require("minio");
require("dotenv").config();

const app = express();
const port = 3000;

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

async function ensureBucketExists(bucketName) {
  return new Promise((resolve, reject) => {
    minioClient.bucketExists(bucketName, (err) => {
      if (err) {
        if (err.code === "NoSuchBucket") {
          minioClient.makeBucket(bucketName, "us-east-1", (err) => {
            if (err) return reject(err);
            console.log(
              `Bucket ${bucketName} created successfully in "us-east-1".`
            );
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

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    await ensureBucketExists(process.env.MINIO_BUCKET_NAME);

    const file = req.file;
    const { name } = req.body;
    const fileExtension = file.mimetype.split("/")[1];
    const fileName = name
      ? `${name}.${fileExtension}`
      : `${new Date().toISOString()}-${file.originalname}`;
    const filePath = `device-images/${fileName}`;

    minioClient.putObject(
      process.env.MINIO_BUCKET_NAME,
      filePath,
      file.buffer,
      { "x-amz-acl": "public-read", "Content-Type": file.mimetype },
      (err, etag) => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
        res.json({ path: `localhost:9000/cms/${filePath}` });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.delete("/delete/:path", async (req, res) => {
  const filePath = req.params.path;

  minioClient.removeObject(process.env.MINIO_BUCKET_NAME, filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({ message: "Image deleted successfully" });
  });
});

app.put("/update/:path", upload.single("image"), async (req, res) => {
  const filePath = req.params.path;
  const newFile = req.file;
  const newFilePath = `device-images/${new Date().toISOString()}-${
    newFile.originalname
  }`;

  minioClient.removeObject(process.env.MINIO_BUCKET_NAME, filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    minioClient.putObject(
      process.env.MINIO_BUCKET_NAME,
      newFilePath,
      newFile.buffer,
      { "x-amz-acl": "public-read", "Content-Type": newFile.mimetype },
      (err, etag) => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }

        res.json({ path: newFilePath });
      }
    );
  });
});

app.get("/images", async (req, res) => {
  try {
    const bucketName = process.env.MINIO_BUCKET_NAME;
    const stream = minioClient.listObjects(bucketName, "device-images/", true);

    const items = [];
    stream.on("data", (obj) => {
      const fullFileName = obj.name.split("/").pop();
      const fileNameWithoutExtension = fullFileName
        .split(".")
        .slice(0, -1)
        .join(".");
      items.push({
        name: fileNameWithoutExtension,
        url: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${obj.name}`,
      });
    });

    stream.on("end", () => {
      res.json(items);
    });

    stream.on("error", (err) => {
      console.error(err);
      res.status(500).send(err.message);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
