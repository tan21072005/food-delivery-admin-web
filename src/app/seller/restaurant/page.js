import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { RestaurantProfileForm } from "@/components/seller/RestaurantProfileForm";
import {
  getSellerRestaurant,
  splitRestaurantAddress,
  updateSellerRestaurantProfile,
} from "@/services/restaurantService";

export const metadata = {
  title: "Restaurant Profile | Food Delivery Admin",
};

export default async function SellerRestaurantPage({ searchParams }) {
  const params = await searchParams;
  const saved = params?.saved === "1";
  const actionError = params?.error;
  const { restaurant, error, isConfigured } = await getSellerRestaurant();
  const address = splitRestaurantAddress(restaurant?.address);

  async function updateProfile(formData) {
    "use server";

    const result = await updateSellerRestaurantProfile(formData);

    if (result.ok) {
      revalidatePath("/seller/restaurant");
      redirect("/seller/restaurant?saved=1");
    }

    const notice = new URLSearchParams({ error: result.message });
    redirect(`/seller/restaurant?${notice.toString()}`);
  }

  return (
    <AppShell
      section="seller"
      title="Restaurant profile"
      description="Seller foundation for viewing and editing the active restaurant profile."
    >
      {!isConfigured ? (
        <div className="mb-5 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Supabase environment variables are not configured. Add the public URL and anon key to edit the restaurant.
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          Could not load restaurant profile: {error.message}
        </div>
      ) : null}

      {saved ? (
        <div className="mb-5 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
          Restaurant profile updated.
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          {actionError}
        </div>
      ) : null}

      {restaurant ? (
        <RestaurantProfileForm restaurant={restaurant} address={address} action={updateProfile} />
      ) : (
        <EmptyState
          title="No restaurant profile found"
          description="Ask an admin to approve the seller application and provision this restaurant workspace."
          actionHref="/seller/apply"
          actionLabel="Apply as seller"
        />
      )}
    </AppShell>
  );
}
