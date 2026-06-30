import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/AppShell";
import { OfferForm } from "@/components/seller/OfferForm";
import { OfferTable } from "@/components/seller/OfferTable";
import { createOffer, deactivateOffer, getSellerOffers, updateOffer } from "@/services/offerService";

export const metadata = {
  title: "Seller Promotions | Food Delivery Admin",
};

export default async function SellerPromotionsPage() {
  const { restaurant, offers, error, isConfigured } = await getSellerOffers();

  async function createAction(formData) {
    "use server";
    await createOffer(formData);
    revalidatePath("/seller/promotions");
  }

  async function updateAction(formData) {
    "use server";
    await updateOffer(formData);
    revalidatePath("/seller/promotions");
  }

  async function deactivateAction(formData) {
    "use server";
    await deactivateOffer(formData);
    revalidatePath("/seller/promotions");
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
            <OfferTable offers={offers} updateAction={updateAction} deactivateAction={deactivateAction} />
          </section>
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6 text-sm text-slate-300">
          No restaurant profile was found for this seller.
        </div>
      )}
    </AppShell>
  );
}
