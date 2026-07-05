import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { UrlPaginationControls } from "@/components/UrlPaginationControls";
import {
  SELLER_APPLICATION_STATUSES,
  listSellerApplications,
} from "@/services/sellerApplicationService";
import { reviewSellerApplicationAction } from "./actions";

export const metadata = {
  title: "Seller Applications | Food Delivery Admin",
};

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildFilterHref(status) {
  const params = new URLSearchParams();

  if (status !== "pending") {
    params.set("status", status);
  }

  const query = params.toString();
  return query ? `/admin/seller-applications?${query}` : "/admin/seller-applications";
}

function StatusFilters({ status }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {["all", ...SELLER_APPLICATION_STATUSES].map((option) => (
        <Link
          key={option}
          href={buildFilterHref(option)}
          aria-current={status === option ? "page" : undefined}
          className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm font-medium transition ${
            status === option
              ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
              : "border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          {option === "all" ? "All statuses" : option}
        </Link>
      ))}
    </div>
  );
}

function ReviewForm({ application, status }) {
  return (
    <form action={reviewSellerApplicationAction} className="space-y-3">
      <input type="hidden" name="id" value={application.id} />
      <input type="hidden" name="status" value={status} />
      <textarea
        name="admin_note"
        defaultValue={application.admin_note ?? ""}
        placeholder="Admin note"
        rows="2"
        className="w-full resize-y rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
      />
      <ConfirmSubmitButton
        confirmMessage={`${status === "approved" ? "Approve" : "Reject"} ${application.restaurant_name}?`}
        pendingLabel="Saving..."
        disabled={application.status !== "pending" || application.status === status}
        className={`w-full rounded-md px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 ${
          status === "approved"
            ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
            : "bg-rose-400 text-slate-950 hover:bg-rose-300"
        }`}
      >
        {status === "approved" ? "Approve" : "Reject"}
      </ConfirmSubmitButton>
    </form>
  );
}

export default async function AdminSellerApplicationsPage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = Number(params?.page ?? 1);
  const requestedStatus = params?.status ?? "pending";
  const { applications, count, page, pageSize, status, error, isConfigured } = await listSellerApplications({
    page: requestedPage,
    status: requestedStatus,
  });

  return (
    <AppShell
      section="admin"
      title="Seller applications"
      description="Review restaurants asking for seller access without granting roles from a public form."
    >
      {!isConfigured ? (
        <div className="mb-5 rounded-md border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
          Supabase environment variables are not configured.
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-md border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          Could not load seller applications. Apply the seller_applications schema in docs/supabase_v3_food_delivery_schema.sql. {error.message}
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

      <div className="space-y-4">
        <StatusFilters status={status} />

        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Restaurant</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                      No seller applications found.
                    </td>
                  </tr>
                ) : null}

                {applications.map((application) => (
                  <tr key={application.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{application.restaurant_name}</div>
                      <div className="mt-1 max-w-sm text-xs leading-5 text-slate-400">{application.address}</div>
                      {application.description ? (
                        <div className="mt-2 max-w-sm text-xs leading-5 text-slate-500">{application.description}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{application.owner_name}</div>
                      <div className="mt-1 text-xs text-slate-400">{application.email}</div>
                      <div className="mt-1 text-xs text-slate-500">{application.phone_number ?? "-"}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-200">
                        {application.status}
                      </span>
                      {application.reviewed_at ? (
                        <div className="mt-2 text-xs text-slate-500">
                          Reviewed {formatDate(application.reviewed_at)}
                        </div>
                      ) : null}
                      {application.restaurant ? (
                        <div className="mt-2 text-xs text-emerald-300">
                          Restaurant #{application.restaurant.id}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-slate-300">{formatDate(application.created_at)}</td>
                    <td className="min-w-64 px-4 py-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <ReviewForm application={application} status="approved" />
                        <ReviewForm application={application} status="rejected" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <UrlPaginationControls
          basePath="/admin/seller-applications"
          searchParams={{ status: status === "pending" ? "" : status }}
          page={page}
          pageSize={pageSize}
          total={count}
        />
      </div>
    </AppShell>
  );
}
