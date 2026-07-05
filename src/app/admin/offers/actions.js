"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminOffer,
  deactivateAdminOffer,
  updateAdminOffer,
} from "@/services/offerService";

const adminOffersPath = "/admin/offers";

async function runOfferAction(action, formData) {
  const result = await action(formData);
  revalidatePath(adminOffersPath);
  const params = new URLSearchParams({ [result.ok ? "success" : "error"]: result.message });
  redirect(`${adminOffersPath}?${params.toString()}`);
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
