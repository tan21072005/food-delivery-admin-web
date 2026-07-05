export const MENU_ITEM_STATUS_OPTIONS = ["active", "inactive", "sold_out"];
export const MAX_MENU_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_MENU_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function hasUpload(file) {
  return file && typeof file === "object" && "size" in file && file.size > 0;
}

function isValidUrl(value) {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function validateMenuItemFields(payload) {
  const errors = {};

  if (!payload.name) {
    errors.name = "Name is required.";
  } else if (payload.name.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  if (!Number.isFinite(payload.base_price) || payload.base_price < 0) {
    errors.base_price = "Base price must be 0 or greater.";
  }

  if (!MENU_ITEM_STATUS_OPTIONS.includes(payload.status)) {
    errors.status = "Status must be active, inactive, or sold out.";
  }

  if (payload.description?.length > 1000) {
    errors.description = "Description must be 1000 characters or fewer.";
  }

  if (!isValidUrl(payload.image_url)) {
    errors.image_url = "Image URL must start with http or https.";
  }

  if (hasUpload(payload.image_file)) {
    if (!ALLOWED_MENU_IMAGE_TYPES.includes(payload.image_file.type)) {
      errors.image_file = "Images must be JPEG, PNG, or WebP.";
    } else if (payload.image_file.size > MAX_MENU_IMAGE_SIZE) {
      errors.image_file = "Images must be 5MB or smaller.";
    }
  }

  return errors;
}

export function validateMenuItemPayload(payload) {
  return Object.values(validateMenuItemFields(payload)).find(Boolean) ?? null;
}
