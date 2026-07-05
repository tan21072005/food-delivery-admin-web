import { AppShell } from "@/components/AppShell";
import { OfferForm } from "@/components/admin/OfferForm";
import { OfferFilters } from "@/components/OfferFilters";
import { OfferTable } from "@/components/admin/OfferTable";
import { UrlPaginationControls } from "@/components/UrlPaginationControls";
import { createOfferAction, deactivateOfferAction, updateOfferAction } from "@/app/admin/offers/actions";
import { getAdminOffers } from "@/services/offerService";

export const metadata = {
  title: "Offers | Food Delivery Admin",
};

export default async function AdminOffersPage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = Number(params?.page ?? 1);
  const requestedStatus = params?.status ?? "all";
  const requestedRestaurantId = params?.restaurant ?? "all";
  const { offers, restaurants, count, page, pageSize, status, restaurantId, error, isConfigured } = await getAdminOffers({
    page: requestedPage,
    status: requestedStatus,
    restaurantId: requestedRestaurantId,
  });

  return (
    <AppShell
      section="admin"
      title="Offers"
      description="Manage platform-wide and restaurant-scoped offers."
    >
      {!isConfigured ? (
        <div className="mb-5 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Supabase environment variables are not configured. Add the public URL and anon key to manage offers.
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          Could not load offers. Apply docs/seller_offers_schema_rls.sql if the offers table does not exist yet. {error.message}
        </div>
      ) : null}

      {params?.error ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          {params.error}
        </div>
      ) : null}

      {params?.success ? (
        <div className="mb-5 rounded-md border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
          {params.success}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Offers</h2>
          <OfferFilters
            basePath="/admin/offers"
            status={status}
            restaurantId={restaurantId}
            restaurants={restaurants}
            showRestaurants
          />
          <OfferTable
            offers={offers}
            restaurants={restaurants}
            updateAction={updateOfferAction}
            deactivateAction={deactivateOfferAction}
          />
          <UrlPaginationControls
            basePath="/admin/offers"
            searchParams={{
              status: status === "all" ? "" : status,
              restaurant: restaurantId === "all" ? "" : restaurantId,
            }}
            page={page}
            pageSize={pageSize}
            total={count}
          />
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">Create offer</h2>
          </div>
          <OfferForm action={createOfferAction} restaurants={restaurants} submitLabel="Create offer" />
        </section>
      </div>
    </AppShell>
  );
}
