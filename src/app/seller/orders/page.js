import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { OrderTable } from "@/components/seller/OrderTable";
import { advanceOrderStatus, getSellerOrders } from "@/services/orderService";

export const metadata = {
  title: "Seller Orders | Food Delivery Admin",
};

export default async function SellerOrdersPage() {
  const { restaurant, orders, error, isConfigured } = await getSellerOrders();

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
          <div>
            <h2 className="text-lg font-semibold text-white">{restaurant.name}</h2>
            <p className="mt-1 text-sm text-slate-400">Pending orders can be advanced through ready status.</p>
          </div>
          <OrderTable orders={orders} advanceAction={advanceAction} />
        </section>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-300">
          No restaurant profile was found for this seller.
        </div>
      )}
    </AppShell>
  );
}
