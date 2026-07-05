import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { OrderTable } from "@/components/seller/OrderTable";
import { OrderFilters } from "@/components/seller/OrderFilters";
import { OrdersAutoRefresh } from "@/components/seller/OrdersAutoRefresh";
import { UrlPaginationControls } from "@/components/UrlPaginationControls";
import { advanceOrderStatus, getSellerOrders } from "@/services/orderService";

export const metadata = {
  title: "Seller Orders | Food Delivery Admin",
};

export default async function SellerOrdersPage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = Number(params?.page ?? 1);
  const requestedStatus = params?.status ?? "all";
  const { restaurant, orders, count, pendingCount, page, pageSize, status, error, isConfigured } =
    await getSellerOrders({ page: requestedPage, status: requestedStatus });

  async function advanceAction(formData) {
    "use server";
    await advanceOrderStatus(formData);
    revalidatePath("/seller/orders");
  }

  return (
    <AppShell
      section="seller"
      title="Orders"
      description="Seller foundation for restaurant-scoped order management."
    >
      {!isConfigured ? (
        <div className="mb-5 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Supabase environment variables are not configured. Add the public URL and anon key to manage orders.
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          Could not load orders: {error.message}
        </div>
      ) : null}

      {restaurant ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">{restaurant.name}</h2>
              <p className="mt-1 text-sm text-slate-400">Pending orders can be advanced through ready status.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                {pendingCount} pending
              </span>
              <OrdersAutoRefresh restaurantId={restaurant.id} pendingCount={pendingCount} />
            </div>
          </div>
          <OrderFilters status={status} />
          <OrderTable orders={orders} advanceAction={advanceAction} />
          <UrlPaginationControls
            basePath="/seller/orders"
            searchParams={{ status: status === "all" ? "" : status }}
            page={page}
            pageSize={pageSize}
            total={count}
          />
        </section>
      ) : (
        <EmptyState
          title="No restaurant profile found"
          description="Orders are available after an admin approves and provisions this seller restaurant."
          actionHref="/seller/apply"
          actionLabel="Apply as seller"
        />
      )}
    </AppShell>
  );
}
