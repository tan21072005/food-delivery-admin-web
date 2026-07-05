export const VALID_OFFER_DISCOUNT_TYPES = ["percent", "fixed"];
export const VALID_OFFER_STATUSES = ["active", "inactive"];

function isValidDateTime(value) {
  if (!value) {
    return true;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export function validateOfferFields(payload) {
  const errors = {};

  if (!payload.title) {
    errors.title = "Title is required.";
  }

  if (!VALID_OFFER_DISCOUNT_TYPES.includes(payload.discount_type)) {
    errors.discount_type = "Discount type must be percent or fixed.";
  }

  if (!Number.isFinite(payload.discount_value) || payload.discount_value <= 0) {
    errors.discount_value = "Discount value must be greater than 0.";
  } else if (payload.discount_type === "percent" && payload.discount_value > 100) {
    errors.discount_value = "Percent discounts cannot exceed 100.";
  }

  if (!Number.isFinite(payload.min_order_amount) || payload.min_order_amount < 0) {
    errors.min_order_amount = "Minimum order must be 0 or greater.";
  }

  if (!VALID_OFFER_STATUSES.includes(payload.status)) {
    errors.status = "Status must be active or inactive.";
  }

  if (!isValidDateTime(payload.starts_at)) {
    errors.starts_at = "Start time is invalid.";
  }

  if (!isValidDateTime(payload.ends_at)) {
    errors.ends_at = "End time is invalid.";
  }

  if (!errors.starts_at && !errors.ends_at && payload.starts_at && payload.ends_at) {
    const startsAt = new Date(payload.starts_at).getTime();
    const endsAt = new Date(payload.ends_at).getTime();

    if (startsAt >= endsAt) {
      errors.ends_at = "End time must be after start time.";
    }
  }

  return errors;
}

export function validateOfferPayload(payload) {
  return Object.values(validateOfferFields(payload)).find(Boolean) ?? null;
}
