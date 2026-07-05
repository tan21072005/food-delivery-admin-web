import Link from "next/link";
import { SellerApplicationForm } from "./SellerApplicationForm";
import { submitSellerApplicationAction } from "./actions";

export const metadata = {
  title: "Apply as Seller | Food Delivery Admin",
};

export default async function SellerApplyPage({ searchParams }) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <section className="py-4">
          <Link href="/login" className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200">
            Food Delivery
          </Link>
          <h1 className="mt-8 max-w-2xl text-4xl font-semibold tracking-tight text-white">
            Sell food through the platform
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Send your restaurant details to the operations team. Approved applications are provisioned by admins through
            the secure seller account flow.
          </p>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-lg font-semibold text-white">Seller application</h2>

          {params?.error ? (
            <div className="mt-4 rounded-md border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              {params.error}
            </div>
          ) : null}

          {params?.success ? (
            <div className="mt-4 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
              {params.success}
            </div>
          ) : null}

          <SellerApplicationForm action={submitSellerApplicationAction} />
        </section>
      </div>
    </main>
  );
}
