import { getUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { AppShellChrome } from "@/components/AppShellChrome";

const navItems = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/restaurants", label: "Restaurants" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/offers", label: "Offers" },
    { href: "/admin/seller-applications", label: "Seller applications" },
  ],
  seller: [
    { href: "/seller/dashboard", label: "Dashboard" },
    { href: "/seller/restaurant", label: "Restaurant" },
    { href: "/seller/menus", label: "Menus" },
    { href: "/seller/orders", label: "Orders" },
    { href: "/seller/promotions", label: "Promotions" },
  ],
};

export async function AppShell({ section, title, description, children }) {
  const items = navItems[section] ?? [];
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const userSummary = user
    ? {
        email: user.email,
        role: getUserRole(user),
      }
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppShellChrome section={section} items={items} user={userSummary} />

      <div className="lg:pl-64">
        <header className="border-b border-white/10 bg-slate-900/70 px-5 py-5 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {section === "admin" ? "Operations" : "Restaurant workspace"}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      </div>
    </div>
  );
}
