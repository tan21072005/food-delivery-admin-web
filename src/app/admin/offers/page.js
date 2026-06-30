import { AppShell } from "@/components/AppShell";
import { AdminOfferManager } from "@/components/admin/AdminOfferManager";

export const metadata = {
  title: "Offers | Food Delivery Admin",
};

export default function AdminOffersPage() {
  return (
    <AppShell
      section="admin"
      title="Offers"
      description="Manage platform-wide and restaurant-scoped offers."
    >
      <AdminOfferManager />
    </AppShell>
  );
}
