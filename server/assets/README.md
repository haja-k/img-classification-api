# Image Classification Client

## Getting Started

1. Make sure Docker version 20.1.1 and docker-compose are installed.
2. Start Docker services in the server.
3. In the extracted folder directory, build the image using the Dockerfile.
    ```docker build -t <image-name> .```
4. Run the image built by ```docker run -d -p <port-number>:80 <image-name> --name <container-name>```
3. Test out the prediction endpoints with SwaggerUI through browser using the url ```http://<ip address>:<port-number>/docs```

## API Endpoints

### 1. Single Image Classification
- Endpoint: /predict_single
- HTTP Method: POST
- Description: This endpoint allows you to classify a single uploaded image.
#### Request
- Method: POST
- Request URL: http://[ip address]:8005/predict_single
- Request Body: Use a multipart/form-data request to upload a single image with the key "file"
#### Response
- Response Body: JSON response with the predicted class and p-value.

### 2. Batch Image Classification
- Endpoint: /predict_batch
- HTTP Method: POST
- Description: This endpoint allows you to classify a batch of uploaded images.
#### Request
- Method: POST
- Request URL: http://[ip address]:8005/predict_batch
- Request Body: Use a multipart/form-data request to upload a batch of images with the key "files"
#### Response
- Response Body: JSON response with the predicted classes and probabilities for the batch of images.