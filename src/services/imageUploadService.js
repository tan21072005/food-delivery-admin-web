const IMAGE_BUCKET = "restaurant-media";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function cleanFileName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function hasUpload(file) {
  return file && typeof file === "object" && "size" in file && file.size > 0;
}

export async function uploadRestaurantImage(supabase, file, pathParts) {
  if (!hasUpload(file)) {
    return { url: null, error: null };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { url: null, error: "Images must be JPEG, PNG, or WebP." };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { url: null, error: "Images must be 5MB or smaller." };
  }

  const safeName = cleanFileName(file.name || "upload");
  const path = [...pathParts, `${crypto.randomUUID()}-${safeName}`].join("/");
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}
