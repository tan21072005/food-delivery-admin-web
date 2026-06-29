import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function SellerOrdersPage() {
  return (
    <PlaceholderPage
      section="seller"
      title="Orders"
      description="Seller foundation for restaurant-scoped order management."
      items={["List restaurant orders", "View order items", "Advance pending orders through ready status"]}
    />
  );
}
