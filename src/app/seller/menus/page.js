import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { MenuForm } from "@/components/seller/MenuForm";
import { MenuFilters } from "@/components/seller/MenuFilters";
import { MenuTable } from "@/components/seller/MenuTable";
import { UrlPaginationControls } from "@/components/UrlPaginationControls";
import {
  createMenuItem,
  deactivateMenuItem,
  getSellerMenuPageData,
  updateMenuItem,
} from "@/services/menuService";

export const metadata = {
  title: "Seller Menus | Food Delivery Admin",
};

function redirectWithNotice(type, message) {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/seller/menus?${params.toString()}`);
}

export default async function SellerMenusPage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = Number(params?.page ?? 1);
  const requestedStatus = params?.status ?? "all";
  const requestedCategoryId = params?.category ?? "all";
  const { restaurant, categories, menuItems, count, page, pageSize, status, categoryId, error, isConfigured } =
    await getSellerMenuPageData({
      page: requestedPage,
      status: requestedStatus,
      categoryId: requestedCategoryId,
    });

  async function createAction(formData) {
    "use server";
    const result = await createMenuItem(formData);
    revalidatePath("/seller/menus");
    redirectWithNotice(result.ok ? "success" : "error", result.message);
  }

  async function updateAction(formData) {
    "use server";
    const result = await updateMenuItem(formData);
    revalidatePath("/seller/menus");
    redirectWithNotice(result.ok ? "success" : "error", result.message);
  }

  async function deactivateAction(formData) {
    "use server";
    const result = await deactivateMenuItem(formData);
    revalidatePath("/seller/menus");
    redirectWithNotice(result.ok ? "success" : "error", result.message);
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

      {params?.error ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          {params.error}
        </div>
      ) : null}

      {params?.success ? (
        <div className="mb-5 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
          {params.success}
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
            <MenuFilters categories={categories} status={status} categoryId={categoryId} />
            <MenuTable
              items={menuItems}
              categories={categories}
              updateAction={updateAction}
              deactivateAction={deactivateAction}
            />
            <UrlPaginationControls
              basePath="/seller/menus"
              searchParams={{
                status: status === "all" ? "" : status,
                category: categoryId === "all" ? "" : categoryId,
              }}
              page={page}
              pageSize={pageSize}
              total={count}
            />
          </section>
        </div>
      ) : (
        <EmptyState
          title="No restaurant profile found"
          description="Menus need an approved seller restaurant before items can be created."
          actionHref="/seller/apply"
          actionLabel="Apply as seller"
        />
      )}
    </AppShell>
  );
}
