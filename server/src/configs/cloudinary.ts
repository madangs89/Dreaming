import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_NAME,
  CLOUDINARY_SECRET,
} from "./env.config.js";

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRET,
});

type CloudinaryUploadResult = {
  success: boolean;
  message: string;
  url: {
    secure_url: string;
    public_id: string;
  } | null;
};

type CloudinaryDeleteResult = {
  success: boolean;
  message: string;
};

export const handleSingleUpload = async (
  filePath: string,
): Promise<CloudinaryUploadResult> => {
  try {
    if (!filePath) {
      return {
        success: false,
        message: "No file uploaded",
        url: null,
      };
    }
    const data: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
      folder: "topics",
      resource_type: "auto",
    });
    return {
      success: true,
      message: "File uploaded successfully",
      url: {
        secure_url: data.secure_url,
        public_id: data.public_id,
      },
    };
  } catch (e) {
    console.error("Cloudinary upload error:", e);

    return {
      success: false,
      message: "Failed to upload file",
      url: null,
    };
  } finally {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
};

export const handleSingleDelete = async (
  public_id: string,
): Promise<CloudinaryDeleteResult> => {
  try {
    if (!public_id) {
      console.warn("No public_id provided for deletion");
      return {
        success: false,
        message: "No public_id provided for deletion",
      };
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok") {
      return {
        success: false,
        message: "Failed to delete file",
      };
    }
    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      message: "Failed to delete file",
    };
  }
};
