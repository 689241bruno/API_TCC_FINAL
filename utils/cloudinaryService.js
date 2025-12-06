require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { Buffer } = require("buffer"); // Importa Buffer explicitamente, se necessário

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// 2. Função de Upload
async function uploadImageToCloudinary(
  fileBuffer,
  folderName = "img_perfil_usuarios"
) {
  // Nota: O Multer geralmente fornece o tipo de arquivo. Se não estiver usando o Multer
  // de forma que armazene o tipo, você pode tentar detectar ou usar um padrão.
  const mimeType = "image/jpeg"; // Ajuste conforme o tipo de arquivo esperado

  // Converte Buffer para Base64 Data URI
  const base64Image = Buffer.from(fileBuffer).toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Image}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folderName, // Ex: 'perfil_usuarios'
      resource_type: "auto",
      overwrite: true,
      public_id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
    });

    return result.secure_url;
  } catch (error) {
    console.error("Erro no upload para Cloudinary:", error);
    throw new Error("Falha ao fazer upload da imagem.");
  }
}

module.exports = { uploadImageToCloudinary };
