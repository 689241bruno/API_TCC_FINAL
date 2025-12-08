// utils/s3Service.js
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

// AWS_BUCKET_NAME
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function uploadToS3(fileBuffer, fileName, mimeType) {
    const uniqueFileName = `${Date.now()}_${fileName}`;
    const bucketName = process.env.AWS_BUCKET_NAME;

    const uploadParams = {
        Bucket: bucketName,
        Key: uniqueFileName,
        Body: fileBuffer,
        ContentType: mimeType,
    };

    try {
        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
        return url;

    } catch (err) {
        console.error("Erro no upload para S3:", err);
        throw new Error("Falha ao enviar arquivo para o armazenamento.");
    }
}

module.exports = { uploadToS3 };