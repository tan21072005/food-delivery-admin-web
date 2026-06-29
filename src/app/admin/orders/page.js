import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function AdminOrdersPage() {
  return (
    <PlaceholderPage
      section="admin"
      title="Orders"
      description="Admin foundation for platform-wide order monitoring."
      items={["List all orders", "Filter by status", "View order items"]}
    />
  );
}
