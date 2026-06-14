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

export const getCloudinaryResourceType = (
  mimeType: string,
): "image" | "video" | "raw" => {
  switch (mimeType) {
    case "image":
      return "image";

    case "video":
    case "audio":
      return "video";

    default:
      return "raw";
  }
};

export const handleSingleDelete = async (
  public_id: string,
  mimeType: string = "other",
): Promise<CloudinaryDeleteResult> => {
  try {
    if (!public_id) {
      return {
        success: false,
        message: "No public_id provided for deletion",
      };
    }

    const resourceType = getCloudinaryResourceType(mimeType);

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType,
    });

    // File deleted successfully
    if (result.result === "ok") {
      return {
        success: true,
        message: "File deleted successfully",
      };
    }

    // File already doesn't exist
    if (result.result === "not found") {
      console.warn(`File already deleted: ${public_id}`);

      return {
        success: true,
        message: "File already deleted",
      };
    }

    console.error(
      `Unexpected Cloudinary delete response for ${public_id}:`,
      result,
    );

    return {
      success: false,
      message: `Failed to delete file: ${result.result}`,
    };
  } catch (error) {
    console.error(
      `Cloudinary delete error for ${public_id}:`,
      error,
    );

    return {
      success: false,
      message: "Failed to delete file",
    };
  }
};