// utils/cloudinaryService.js

require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { Buffer } = require("buffer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Faz o upload de um Buffer para o Cloudinary, usando o ID do usuário para
 * gerar um public_id fixo (ex: perfil_123) para sobrescrever a imagem anterior.
 */
async function uploadImageToCloudinary(
  fileBuffer,
  usuarioId // NOVO: ID do usuário para criar public_id fixo
) {
  // O nome da pasta agora é fixo e deve ser o mesmo usado na URL pública final
  const folderName = "users_img_perfil";
  const mimeType = "image/jpeg"; // 1. Converte Buffer para Base64 Data URI

  const base64Image = Buffer.from(fileBuffer).toString("base64");
  const dataUri = `data:${mimeType};base64,${base64Image}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folderName, // Define a pasta de destino
      resource_type: "auto",
      overwrite: true, // Garante que a foto antiga com o mesmo public_id será sobrescrita // 🛑 O CAMPO CRÍTICO: public_id fixo baseado no ID do usuário
      public_id: `perfil_${usuarioId}`,
    });

    return result.secure_url;
  } catch (error) {
    console.error("Erro no upload para Cloudinary:", error);
    throw new Error("Falha ao fazer upload da imagem.");
  }
}

module.exports = { uploadImageToCloudinary };
