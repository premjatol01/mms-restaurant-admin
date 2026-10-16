import { IMAGE_MAX_MB } from "./constants";
import { websiteApi } from "../../../api/website.api";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Uploads an image file and resolves with the hosted URL, or falls back to data URL.
export async function readImageFile(file, { maxSizeMB = IMAGE_MAX_MB } = {}) {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: only JPG, PNG or WebP images are allowed`);
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`${file.name}: image must be smaller than ${maxSizeMB} MB`);
  }

  try {
    const formData = new FormData();
    formData.append("image", file);
    const res = await websiteApi.uploadImage(formData);
    if (res.data?.success && res.data?.url) {
      return res.data.url;
    }
  } catch (err) {
    console.warn("Direct file upload failed, falling back to data URL:", err);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`${file.name}: could not read the image`));
    reader.readAsDataURL(file);
  });
}

export function makeId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
