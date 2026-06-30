import { AppShell } from "@/components/AppShell";
import { AdminStats } from "@/components/admin/AdminStats";

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
      <AdminStats />
    </AppShell>
  );
}
