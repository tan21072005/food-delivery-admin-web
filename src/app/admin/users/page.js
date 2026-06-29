import { PlaceholderPage } from "@/components/PlaceholderPage";

export default function AdminUsersPage() {
  return (
    <PlaceholderPage
      section="admin"
      title="Users"
      description="Admin foundation for reviewing users by role and status."
      items={["List users", "Filter by role", "Filter by status"]}
    />
  );
}
