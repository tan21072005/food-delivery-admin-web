import Link from "next/link";
import { OFFER_STATUSES } from "@/services/offerService";

function buildHref(basePath, values) {
  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value && value !== "all") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
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

export function OfferFilters({ basePath, status, restaurantId = "all", restaurants = [], showRestaurants = false }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", ...OFFER_STATUSES].map((option) => (
          <FilterLink
            key={option}
            href={buildHref(basePath, { status: option, restaurant: restaurantId })}
            active={status === option}
          >
            {option === "all" ? "All statuses" : option}
          </FilterLink>
        ))}
      </div>
      {showRestaurants ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterLink href={buildHref(basePath, { status, restaurant: "all" })} active={restaurantId === "all"}>
            All scopes
          </FilterLink>
          <FilterLink href={buildHref(basePath, { status, restaurant: "global" })} active={restaurantId === "global"}>
            Global
          </FilterLink>
          {restaurants.map((restaurant) => (
            <FilterLink
              key={restaurant.id}
              href={buildHref(basePath, { status, restaurant: String(restaurant.id) })}
              active={String(restaurant.id) === String(restaurantId)}
            >
              {restaurant.name}
            </FilterLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}
