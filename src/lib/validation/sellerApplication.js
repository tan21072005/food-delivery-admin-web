export function validateSellerApplicationFields(payload) {
  const errors = {};

  if (!payload.restaurant_name || !payload.owner_name || !payload.email || !payload.address) {
    if (!payload.restaurant_name) errors.restaurant_name = "Restaurant name is required.";
    if (!payload.owner_name) errors.owner_name = "Owner name is required.";
    if (!payload.email) errors.email = "Email is required.";
    if (!payload.address) errors.address = "Address is required.";
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (payload.restaurant_name?.length > 120) {
    errors.restaurant_name = "Restaurant name must be 120 characters or fewer.";
  }

  if (payload.owner_name?.length > 120) {
    errors.owner_name = "Owner name must be 120 characters or fewer.";
  }

  if (payload.address?.length > 240) {
    errors.address = "Address must be 240 characters or fewer.";
  }

  if (payload.description?.length > 1000) {
    errors.description = "Description must be 1000 characters or fewer.";
  }

  return errors;
}

export function firstFieldError(errors) {
  return Object.values(errors).find(Boolean) ?? null;
}

export function validateSellerApplicationPayload(payload) {
  return firstFieldError(validateSellerApplicationFields(payload));
}
