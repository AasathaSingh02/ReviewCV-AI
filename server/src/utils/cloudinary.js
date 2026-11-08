import cloudinary from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const uploadToCloudinary = async (filePath) => {
  const hasCloudinary = 
    Boolean(process.env.CLOUDINARY_NAME) && 
    Boolean(process.env.CLOUDINARY_KEY) && 
    Boolean(process.env.CLOUDINARY_SECRET);

  const filename = path.basename(filePath);

  // Determine the public URL of the backend (e.g. on Render or custom domain)
  // Render automatically provides RENDER_EXTERNAL_URL: https://reviewcv-ai.onrender.com
  const rawBackendUrl =
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.NODE_ENV === "production" ? "https://reviewcv-ai.onrender.com" : null);

  const backendUrl = rawBackendUrl
    ? rawBackendUrl.replace(/\/$/, "")
    : `http://localhost:${process.env.PORT || 5000}`;

  const localFileUrl = `${backendUrl}/uploads/${filename}`;

  if (!hasCloudinary) {
    console.log(`[CLOUDINARY] ℹ️ Cloudinary credentials not configured. Serving local file at: ${localFileUrl}`);
    return localFileUrl;
  }

  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      resource_type: "raw",
      use_filename: true,
      unique_filename: true,
      folder: "resumes",
    });

    return result.secure_url;
  } catch (error) {
    console.warn("Cloudinary upload warning:", error.message, "- using local file link:", localFileUrl);
    return localFileUrl;
  }
};
