"use server";

import { redirect } from "next/navigation";
import { submitSellerApplication } from "@/services/sellerApplicationService";

export async function submitSellerApplicationAction(formData) {
  const result = await submitSellerApplication(formData);
  const params = new URLSearchParams({ [result.ok ? "success" : "error"]: result.message });
  redirect(`/seller/apply?${params.toString()}`);
}
