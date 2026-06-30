import { AppShell } from "@/components/AppShell";
import { RestaurantTable } from "@/components/admin/RestaurantTable";

export const metadata = {
  title: "Restaurants | Food Delivery Admin",
};

export default function AdminRestaurantsPage() {
  return (
    <AppShell
      section="admin"
      title="Restaurants"
      description="Admin foundation for viewing and editing all restaurants."
    >
      <RestaurantTable />
    </AppShell>
  );
}