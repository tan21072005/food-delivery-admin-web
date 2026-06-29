import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function AdminCategoriesPage() {
  return (
    <PlaceholderPage
      section="admin"
      title="Categories"
      description="Admin foundation for menu category management."
      items={["List menu categories", "Create category", "Edit category"]}
    />
  );
}
