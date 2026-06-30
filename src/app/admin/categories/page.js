import { AppShell } from "@/components/AppShell";
import { CategoryTable } from "@/components/admin/CategoryTable";

export const metadata = {
  title: "Categories | Food Delivery Admin",
};

export default function AdminCategoriesPage() {
  return (
    <AppShell
      section="admin"
      title="Categories"
      description="Admin foundation for menu category management."
    >
      <CategoryTable />
    </AppShell>
  );
}