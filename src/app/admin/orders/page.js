import { AppShell } from "@/components/AppShell";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";

export const metadata = {
  title: "Orders | Food Delivery Admin",
};

export default function AdminOrdersPage() {
  return (
    <AppShell
      section="admin"
      title="Orders"
      description="Admin foundation for platform-wide order monitoring."
    >
      <AdminOrderTable />
    </AppShell>
  );
}