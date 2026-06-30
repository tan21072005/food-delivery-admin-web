"use server";

import { revalidatePath } from "next/cache";
import {
  createAdminOffer,
  deactivateAdminOffer,
  updateAdminOffer,
} from "@/services/offerService";

const adminOffersPath = "/admin/offers";

async function runOfferAction(action, formData) {
  const result = await action(formData);
  revalidatePath(adminOffersPath);
  return result;
}

export async function createOfferAction(formData) {
  return runOfferAction(createAdminOffer, formData);
}

export async function updateOfferAction(formData) {
  return runOfferAction(updateAdminOffer, formData);
}

export async function deactivateOfferAction(formData) {
  return runOfferAction(deactivateAdminOffer, formData);
}
