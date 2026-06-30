import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { formatVnd, getSellerDashboardMetrics } from "@/services/restaurantService";

export const metadata = {
  title: "Seller Dashboard | Food Delivery Admin",
};

export default async function SellerDashboardPage() {
  const { restaurant, metrics, error, isConfigured } = await getSellerDashboardMetrics();

  return (
    <AppShell
      section="seller"
      title="Seller dashboard"
      description="A foundation view for restaurant owners to monitor today's orders, menu status, and revenue."
    >
      {!isConfigured ? (
        <div className="mb-5 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Supabase environment variables are not configured. Add the public URL and anon key to load seller metrics.
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          Could not load dashboard metrics: {error.message}
        </div>
      ) : null}

      {restaurant ? (
        <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm text-slate-400">Current restaurant</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{restaurant.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{restaurant.address}</p>
            </div>
            <span className="w-fit rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">
              {restaurant.is_open ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Today's orders" value={metrics.todayOrders} helper="Orders created today" />
        <MetricCard label="Pending orders" value={metrics.pendingOrders} helper="Awaiting confirmation" />
        <MetricCard label="Estimated revenue" value={formatVnd(metrics.estimatedRevenue)} helper="Before settlement" />
        <MetricCard label="Active menu items" value={metrics.activeMenuItems} helper="Visible to customers" />
      </div>
    </AppShell>
  );
}
