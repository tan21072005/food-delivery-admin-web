import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function SellerRestaurantPage() {
  return (
    <PlaceholderPage
      section="seller"
      title="Restaurant profile"
      description="Seller foundation for viewing and editing the active restaurant profile."
      items={["Edit name and description", "Update phone and address", "Manage logo, cover, and open status"]}
    />
  );
}
