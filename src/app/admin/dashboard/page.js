import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";

export const metadata = {
  title: "Admin Dashboard | Food Delivery Admin",
};

export default function AdminDashboardPage() {
  return (
    <AppShell
      section="admin"
      title="Admin dashboard"
      description="A foundation view for platform-wide users, restaurants, and order operations."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total users" value="--" helper="Connect userService.js" />
        <MetricCard label="Restaurants" value="--" helper="All restaurants" />
        <MetricCard label="Orders" value="--" helper="All orders" />
        <MetricCard label="Pending orders" value="--" helper="Needs attention" />
        <MetricCard label="Open restaurants" value="--" helper="Accepting orders" />
      </div>
    </AppShell>
  );
}
