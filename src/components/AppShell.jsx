import Link from "next/link";

const navItems = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/restaurants", label: "Restaurants" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/offers", label: "Offers" },
  ],
  seller: [
    { href: "/seller/dashboard", label: "Dashboard" },
    { href: "/seller/restaurant", label: "Restaurant" },
    { href: "/seller/menus", label: "Menus" },
    { href: "/seller/orders", label: "Orders" },
    { href: "/seller/promotions", label: "Promotions" },
  ],
};

export function AppShell({ section, title, description, children }) {
  const items = navItems[section] ?? [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-slate-950/95 px-5 py-6 lg:block">
        <Link href={`/${section}/dashboard`} className="block text-lg font-semibold">
          Food Delivery
        </Link>
        <p className="mt-1 text-sm text-slate-400">{section === "admin" ? "Admin Portal" : "Seller Portal"}</p>
        <nav className="mt-8 space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

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
