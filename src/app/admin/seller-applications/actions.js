"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { reviewSellerApplication } from "@/services/sellerApplicationService";

const applicationsPath = "/admin/seller-applications";

export async function reviewSellerApplicationAction(formData) {
  const result = await reviewSellerApplication(formData);
  revalidatePath(applicationsPath);
  const params = new URLSearchParams({ [result.ok ? "success" : "error"]: result.message });
  redirect(`${applicationsPath}?${params.toString()}`);
}
