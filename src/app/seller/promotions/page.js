import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { OfferFilters } from "@/components/OfferFilters";
import { OfferForm } from "@/components/seller/OfferForm";
import { OfferTable } from "@/components/seller/OfferTable";
import { UrlPaginationControls } from "@/components/UrlPaginationControls";
import { createOffer, deactivateOffer, getSellerOffers, updateOffer } from "@/services/offerService";

export const metadata = {
  title: "Seller Promotions | Food Delivery Admin",
};

function redirectWithNotice(type, message) {
  const params = new URLSearchParams({ [type]: message });
  redirect(`/seller/promotions?${params.toString()}`);
}

export default async function SellerPromotionsPage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = Number(params?.page ?? 1);
  const requestedStatus = params?.status ?? "all";
  const { restaurant, offers, count, page, pageSize, status, error, isConfigured } = await getSellerOffers({
    page: requestedPage,
    status: requestedStatus,
  });

  async function createAction(formData) {
    "use server";
    const result = await createOffer(formData);
    revalidatePath("/seller/promotions");
    redirectWithNotice(result.ok ? "success" : "error", result.message);
  }

  async function updateAction(formData) {
    "use server";
    const result = await updateOffer(formData);
    revalidatePath("/seller/promotions");
    redirectWithNotice(result.ok ? "success" : "error", result.message);
  }

  async function deactivateAction(formData) {
    "use server";
    const result = await deactivateOffer(formData);
    revalidatePath("/seller/promotions");
    redirectWithNotice(result.ok ? "success" : "error", result.message);
  }

  return (
    <AppShell
      section="seller"
      title="Promotions"
      description="Create and manage basic offers for the seller restaurant."
    >
      {!isConfigured ? (
        <div className="mb-5 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Supabase environment variables are not configured. Add the public URL and anon key to manage promotions.
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

      {restaurant ? (
        <div className="space-y-6">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-white">Create offer</h2>
              <p className="mt-1 text-sm text-slate-400">{restaurant.name}</p>
            </div>
            <OfferForm action={createAction} submitLabel="Create offer" />
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Offers</h2>
            <OfferFilters basePath="/seller/promotions" status={status} />
            <OfferTable offers={offers} updateAction={updateAction} deactivateAction={deactivateAction} />
            <UrlPaginationControls
              basePath="/seller/promotions"
              searchParams={{ status: status === "all" ? "" : status }}
              page={page}
              pageSize={pageSize}
              total={count}
            />
          </section>
        </div>
      ) : (
        <EmptyState
          title="No restaurant profile found"
          description="Promotions need an approved seller restaurant before offers can be created."
          actionHref="/seller/apply"
          actionLabel="Apply as seller"
        />
      )}
    </AppShell>
  );
}
