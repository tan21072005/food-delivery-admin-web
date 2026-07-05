import Link from "next/link";
import { MENU_ITEM_STATUS_OPTIONS } from "@/services/menuService";

function buildHref({ status, categoryId }) {
  const params = new URLSearchParams();

  if (status && status !== "all") {
    params.set("status", status);
  }

  if (categoryId && categoryId !== "all") {
    params.set("category", categoryId);
  }

  const query = params.toString();
  return query ? `/seller/menus?${query}` : "/seller/menus";
}

function FilterLink({ href, active, children }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
          : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export function MenuFilters({ categories, status, categoryId }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", ...MENU_ITEM_STATUS_OPTIONS].map((option) => (
          <FilterLink
            key={option}
            href={buildHref({ status: option, categoryId })}
            active={status === option}
          >
            {option === "all" ? "All statuses" : option.replaceAll("_", " ")}
          </FilterLink>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterLink href={buildHref({ status, categoryId: "all" })} active={categoryId === "all"}>
          All categories
        </FilterLink>
        {categories.map((category) => (
          <FilterLink
            key={category.id}
            href={buildHref({ status, categoryId: String(category.id) })}
            active={String(category.id) === String(categoryId)}
          >
            {category.name}
          </FilterLink>
        ))}
      </div>
    </div>
  );
}
