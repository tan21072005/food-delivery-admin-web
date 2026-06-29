import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function AdminRestaurantsPage() {
  return (
    <PlaceholderPage
      section="admin"
      title="Restaurants"
      description="Admin foundation for viewing and editing all restaurants."
      items={["List all restaurants", "Open restaurant detail", "Edit restaurant status and profile"]}
    />
  );
}
