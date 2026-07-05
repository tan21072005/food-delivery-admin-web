"use client";

import { useEffect, useState } from "react";
import { PaginationControls } from "@/components/PaginationControls";
import { TableEmptyStateRow, TableSkeletonRows } from "@/components/TableStateRows";
import { listRestaurants, updateRestaurant } from "@/services/adminRestaurantService";

const statuses = ["active", "inactive", "suspended"];

const initialForm = {
  id: null,
  name: "",
  description: "",
  phone_number: "",
  address: "",
  is_open: false,
  status: "active",
};

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function mapRestaurantToForm(restaurant) {
  return {
    id: restaurant.id,
    name: restaurant.name ?? "",
    description: restaurant.description ?? "",
    phone_number: restaurant.phone_number ?? "",
    address: restaurant.address ?? "",
    is_open: Boolean(restaurant.is_open),
    status: restaurant.status ?? "active",
  };
}

export function RestaurantTable() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadRestaurants() {
      setLoading(true);
      const result = await listRestaurants({ page, query, status: statusFilter });

      if (!mounted) {
        return;
      }

      setRestaurants(result.data);
      setPageSize(result.pageSize);
      setTotal(result.count);
      setNotice(result.error ? { type: "error", message: result.error } : null);
      setLoading(false);
    }

    loadRestaurants();

    return () => {
      mounted = false;
    };
  }, [page, query, statusFilter]);

  function updateQuery(value) {
    setQuery(value);
    setPage(1);
  }

  function updateStatusFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function selectRestaurant(restaurant) {
    setSelectedRestaurant(restaurant);
    setForm(mapRestaurantToForm(restaurant));
    setNotice(null);
  }

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.id) {
      return;
    }

    const statusChanged = selectedRestaurant && selectedRestaurant.status !== form.status;
    const openChanged = selectedRestaurant && Boolean(selectedRestaurant.is_open) !== Boolean(form.is_open);

    if (statusChanged || openChanged) {
      const changes = [
        statusChanged ? `status to ${form.status}` : null,
        openChanged ? (form.is_open ? "open for orders" : "closed for orders") : null,
      ]
        .filter(Boolean)
        .join(" and ");

      if (!window.confirm(`Update ${selectedRestaurant.name} ${changes}?`)) {
        return;
      }
    }

    setSaving(true);
    const result = await updateRestaurant(form.id, form);
    setSaving(false);

    if (result.error) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    setRestaurants((current) =>
      current.map((restaurant) => (restaurant.id === result.data.id ? result.data : restaurant)),
    );
    setSelectedRestaurant(result.data);
    setForm(mapRestaurantToForm(result.data));
    setNotice({ type: "success", message: "Restaurant updated." });
  }

  return (
    <div className="space-y-5">
      {notice ? (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
              : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <input
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          placeholder="Search restaurants, address, or phone"
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
        />
        <select
          value={statusFilter}
          onChange={(event) => updateStatusFilter(event.target.value)}
          className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
        >
          <option value="all">All statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-white/[0.03] text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Restaurant</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Cuisine</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Open</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <TableSkeletonRows columns={6} />
                ) : null}

                {!loading && restaurants.length === 0 ? (
                  <TableEmptyStateRow
                    colSpan={6}
                    title="No restaurants found"
                    description="Try a different search term or status filter."
                  />
                ) : null}

                {restaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="cursor-pointer transition hover:bg-white/[0.03]"
                    onClick={() => selectRestaurant(restaurant)}
                  >
                    <td className="px-4 py-4">
                      <div className="font-medium text-white">{restaurant.name}</div>
                      <div className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {restaurant.address}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">
                      <div>{restaurant.owner?.full_name ?? "Unknown"}</div>
                      <div className="mt-1 text-xs text-slate-500">{restaurant.owner?.email}</div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{restaurant.cuisine?.name ?? "-"}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-slate-200">
                        {restaurant.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{restaurant.is_open ? "Yes" : "No"}</td>
                    <td className="px-4 py-4 text-slate-300">
                      {Number(restaurant.avg_rating ?? 0).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls page={page} pageSize={pageSize} total={total} onPageChange={setPage} disabled={loading} />
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-base font-semibold text-white">
            {selectedRestaurant ? "Edit restaurant" : "Select a restaurant"}
          </h2>
          {selectedRestaurant ? (
            <p className="mt-1 text-xs text-slate-500">Created {formatDate(selectedRestaurant.created_at)}</p>
          ) : null}

          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-300">
              Name
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                disabled={!selectedRestaurant}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Phone
              <input
                value={form.phone_number}
                onChange={(event) => updateForm("phone_number", event.target.value)}
                disabled={!selectedRestaurant}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Address
              <textarea
                value={form.address}
                onChange={(event) => updateForm("address", event.target.value)}
                disabled={!selectedRestaurant}
                required
                rows="3"
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Description
              <textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                disabled={!selectedRestaurant}
                rows="3"
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-slate-300">
                Status
                <select
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                  disabled={!selectedRestaurant}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.is_open}
                  onChange={(event) => updateForm("is_open", event.target.checked)}
                  disabled={!selectedRestaurant}
                  className="h-4 w-4 rounded border-white/10 bg-slate-900"
                />
                Open
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedRestaurant || saving}
            className="mt-5 w-full rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {saving ? "Saving..." : "Save restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}
