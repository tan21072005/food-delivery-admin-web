import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function SellerMenusPage() {
  return (
    <PlaceholderPage
      section="seller"
      title="Menus"
      description="Seller foundation for menu CRUD scoped to the seller restaurant."
      items={["List menu items", "Create and edit items", "Soft delete by setting status inactive"]}
    />
  );
}
