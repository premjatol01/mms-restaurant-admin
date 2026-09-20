import { IMAGE_MAX_MB } from "./constants";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Reads an image file and resolves with a data URL.
// TODO: when the upload API is ready, upload the file here and resolve with the hosted URL instead.
export function readImageFile(file, { maxSizeMB = IMAGE_MAX_MB } = {}) {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      reject(new Error(`${file.name}: only JPG, PNG or WebP images are allowed`));
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      reject(new Error(`${file.name}: image must be smaller than ${maxSizeMB} MB`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`${file.name}: could not read the image`));
    reader.readAsDataURL(file);
  });
}

export function makeId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
