
# Node.js MinIO Image Manager

This project is a Node.js application that handles image uploads, updates, deletions, and listings using MinIO for storage. It provides a RESTful API for managing images stored in a MinIO bucket.

## What is MinIO?

MinIO is a high-performance, distributed object storage service compatible with Amazon S3. It is ideal for storing unstructured data such as images, videos, and backups. MinIO offers scalable and secure storage solutions.

## API Endpoints

### 1. Upload an Image

- **Endpoint:** `POST /upload`
- **Description:** Uploads an image to MinIO. The image is saved with the name specified in the `name` field of the request body, with the appropriate file extension based on the image's MIME type.

**Request Example:**

```sh
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path/to/your/image.jpg" \
  -F "name=desiredImageName"
```

**Response Example:**

```json
{
  "path": "device-images/desiredImageName.jpg"
}
```

### 2. Delete an Image

- **Endpoint:** `DELETE /delete/:path`
- **Description:** Deletes an image from MinIO using the specified file path.

**Request Example:**

```sh
curl -X DELETE http://localhost:3000/delete/device-images/desiredImageName.jpg
```

**Response Example:**

```json
{
  "message": "Image deleted successfully"
}
```

### 3. Update an Image

- **Endpoint:** `PUT /update/:path`
- **Description:** Replaces an existing image in MinIO with a new image provided in the request. The old image specified by `:path` will be deleted.

**Request Example:**

```sh
curl -X PUT http://localhost:3000/update/device-images/oldImageName.jpg \
  -H "Content-Type: multipart/form-data" \
  -F "image=@path/to/your/newImage.png"
```

**Response Example:**

```json
{
  "path": "device-images/newImageName.png"
}
```

### 4. List All Images

- **Endpoint:** `GET /images`
- **Description:** Retrieves a list of all images stored in MinIO under the `device-images` prefix. Each image is returned with its name (excluding the extension) and URL.

**Request Example:**

```sh
curl -X GET http://localhost:3000/images
```

**Response Example:**

```json
[
  {
    "name": "example",
    "url": "http://localhost:9000/cms/device-images/example.jpg"
  },
  {
    "name": "another-image",
    "url": "http://localhost:9000/cms/device-images/another-image.png"
  }
]
```

## Setup Instructions

1. **Clone the Repository:**

    ```sh
    git clone https://github.com/AnoopNayak7/node-minio-file-service
    cd node-minio-file-service
    ```

2. **Install Dependencies:**

    ```sh
    npm install
    ```

3. **Configure Environment Variables:**

    Create a `.env` file in the root directory with the following content:

    ```env
    MINIO_ENDPOINT=localhost
    MINIO_PORT=9000
    MINIO_ACCESS_KEY=youraccesskey
    MINIO_SECRET_KEY=yoursecretkey
    MINIO_BUCKET_NAME=cms // change it to any name
    ```

4. **Start the Server and run Docker compose:**
    ```sh
    docker-compose up -d
    ```
      
    ```sh
    npm start
    ```

The server will run at `http://localhost:3000`.
