import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";

export const metadata = {
  title: "Seller Dashboard | Food Delivery Admin",
};

export default function SellerDashboardPage() {
  return (
    <AppShell
      section="seller"
      title="Seller dashboard"
      description="A foundation view for restaurant owners to monitor today's orders, menu status, and revenue."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Today's orders" value="--" helper="Orders created today" />
        <MetricCard label="Pending orders" value="--" helper="Awaiting confirmation" />
        <MetricCard label="Estimated revenue" value="--" helper="Before settlement" />
        <MetricCard label="Active menu items" value="--" helper="Visible to customers" />
      </div>
    </AppShell>
  );
}
