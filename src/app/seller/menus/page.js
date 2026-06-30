import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { MenuForm } from "@/components/seller/MenuForm";
import { MenuTable } from "@/components/seller/MenuTable";
import {
  createMenuItem,
  deactivateMenuItem,
  getSellerMenuPageData,
  updateMenuItem,
} from "@/services/menuService";

export const metadata = {
  title: "Seller Menus | Food Delivery Admin",
};

export default async function SellerMenusPage() {
  const { restaurant, categories, menuItems, error, isConfigured } = await getSellerMenuPageData();

  async function createAction(formData) {
    "use server";
    await createMenuItem(formData);
    revalidatePath("/seller/menus");
  }

  async function updateAction(formData) {
    "use server";
    await updateMenuItem(formData);
    revalidatePath("/seller/menus");
  }

  async function deactivateAction(formData) {
    "use server";
    await deactivateMenuItem(formData);
    revalidatePath("/seller/menus");
  }

  return (
    <AppShell
      section="seller"
      title="Menus"
      description="Seller foundation for menu CRUD scoped to the seller restaurant."
    >
      {!isConfigured ? (
        <div className="mb-5 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Supabase environment variables are not configured. Add the public URL and anon key to manage menus.
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          Could not load menu data: {error.message}
        </div>
      ) : null}

      {restaurant ? (
        <div className="space-y-6">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">Add menu item</h2>
              <p className="mt-1 text-sm text-slate-400">{restaurant.name}</p>
            </div>
            <MenuForm categories={categories} action={createAction} submitLabel="Create item" />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Menu items</h2>
            <MenuTable
              items={menuItems}
              categories={categories}
              updateAction={updateAction}
              deactivateAction={deactivateAction}
            />
          </section>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-300">
          No restaurant profile was found for this seller.
        </div>
      )}
    </AppShell>
  );
}
