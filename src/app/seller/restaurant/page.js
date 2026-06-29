import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
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
  const { restaurant, error, isConfigured } = await getSellerRestaurant();
  const address = splitRestaurantAddress(restaurant?.address);

  async function updateProfile(formData) {
    "use server";

    const result = await updateSellerRestaurantProfile(formData);

    if (result.ok) {
      revalidatePath("/seller/restaurant");
      redirect("/seller/restaurant?saved=1");
    }
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

      {restaurant ? (
        <form action={updateProfile} className="space-y-6 rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{restaurant.name}</h2>
              <p className="mt-1 text-sm text-slate-400">Only the owner of this restaurant can update this profile.</p>
            </div>
            <label className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200">
              <input name="is_open" type="checkbox" defaultChecked={restaurant.is_open} className="h-4 w-4 accent-emerald-400" />
              Open for orders
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Name</span>
              <input name="name" defaultValue={restaurant.name} required className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Phone number</span>
              <input name="phone_number" defaultValue={restaurant.phone_number ?? ""} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
            </label>
            <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
              <span>Description</span>
              <textarea name="description" defaultValue={restaurant.description ?? ""} rows={3} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Address detail</span>
              <input name="address_detail" defaultValue={address.addressDetail} required className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Locality</span>
              <input name="locality" defaultValue={address.locality} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Logo URL</span>
              <input name="logo_url" defaultValue={restaurant.logo_url ?? ""} type="url" className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Cover URL</span>
              <input name="cover_url" defaultValue={restaurant.cover_url ?? ""} type="url" className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300" />
            </label>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              Save restaurant
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-300">
          No restaurant profile was found for this seller.
        </div>
      )}
    </AppShell>
  );
}
