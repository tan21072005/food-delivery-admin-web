import { ALLOWED_MENU_IMAGE_TYPES, MAX_MENU_IMAGE_SIZE } from "@/lib/validation/menuItem";

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

function validateImageFile(file, fieldName, errors) {
  if (!hasUpload(file)) {
    return;
  }

  if (!ALLOWED_MENU_IMAGE_TYPES.includes(file.type)) {
    errors[fieldName] = "Images must be JPEG, PNG, or WebP.";
  } else if (file.size > MAX_MENU_IMAGE_SIZE) {
    errors[fieldName] = "Images must be 5MB or smaller.";
  }
}

export function validateRestaurantProfileFields(payload) {
  const errors = {};

  if (!payload.name) {
    errors.name = "Name is required.";
  } else if (payload.name.length > 120) {
    errors.name = "Name must be 120 characters or fewer.";
  }

  if (payload.description?.length > 1000) {
    errors.description = "Description must be 1000 characters or fewer.";
  }

  if (!payload.address_detail && !payload.locality) {
    errors.address_detail = "Address is required.";
  }

  if (payload.address_detail?.length > 240) {
    errors.address_detail = "Address detail must be 240 characters or fewer.";
  }

  if (payload.locality?.length > 160) {
    errors.locality = "Locality must be 160 characters or fewer.";
  }

  if (!isValidUrl(payload.logo_url)) {
    errors.logo_url = "Logo URL must start with http or https.";
  }

  if (!isValidUrl(payload.cover_url)) {
    errors.cover_url = "Cover URL must start with http or https.";
  }

  validateImageFile(payload.logo_file, "logo_file", errors);
  validateImageFile(payload.cover_file, "cover_file", errors);

  return errors;
}

export function validateRestaurantProfilePayload(payload) {
  return Object.values(validateRestaurantProfileFields(payload)).find(Boolean) ?? null;
}
