import { AppShell } from "@/components/AppShell";
import { UserTable } from "@/components/admin/UserTable";

export const metadata = {
  title: "Users | Food Delivery Admin",
};

export default function AdminUsersPage() {
  return (
    <AppShell
      section="admin"
      title="Users"
      description="Admin foundation for reviewing users by role and status."
    >
      <UserTable />
    </AppShell>
  );
}