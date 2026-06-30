"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createOffer,
  deactivateOffer,
  listOfferRestaurants,
  listOffers,
  updateOffer,
} from "@/services/adminOfferService";

const emptyForm = {
  id: null,
  restaurant_id: "",
  title: "",
  description: "",
  discount_type: "percent",
  discount_value: "",
  min_order_amount: 0,
  starts_at: "",
  ends_at: "",
  status: "active",
};

const statuses = ["active", "inactive"];
const discountTypes = ["percent", "fixed"];

function toInputDateTime(value) {
  return value ? new Date(value).toISOString().slice(0, 16) : "";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "Not set";
}

function formatVnd(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
}

function formatDiscount(offer) {
  if (offer.discount_type === "percent") {
    return `${Number(offer.discount_value ?? 0)}%`;
  }

  return formatVnd(offer.discount_value);
}

function mapOfferToForm(offer) {
  return {
    id: offer.id,
    restaurant_id: offer.restaurant_id ? String(offer.restaurant_id) : "",
    title: offer.title ?? "",
    description: offer.description ?? "",
    discount_type: offer.discount_type ?? "percent",
    discount_value: offer.discount_value ?? "",
    min_order_amount: offer.min_order_amount ?? 0,
    starts_at: toInputDateTime(offer.starts_at),
    ends_at: toInputDateTime(offer.ends_at),
    status: offer.status ?? "active",
  };
}

export function AdminOfferManager() {
  const [offers, setOffers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      const [offerResult, restaurantResult] = await Promise.all([listOffers(), listOfferRestaurants()]);

      if (!mounted) {
        return;
      }

      setOffers(offerResult.data);
      setRestaurants(restaurantResult.data);
      setNotice(
        offerResult.error || restaurantResult.error
          ? { type: "error", message: offerResult.error || restaurantResult.error }
          : null,
      );
      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOffers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return offers.filter((offer) => {
      const matchesQuery =
        !normalizedQuery ||
        offer.title?.toLowerCase().includes(normalizedQuery) ||
        offer.description?.toLowerCase().includes(normalizedQuery) ||
        offer.restaurant?.name?.toLowerCase().includes(normalizedQuery);

      const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
      const matchesRestaurant =
        restaurantFilter === "all" ||
        (restaurantFilter === "global" && !offer.restaurant_id) ||
        String(offer.restaurant_id) === restaurantFilter;

      return matchesQuery && matchesStatus && matchesRestaurant;
    });
  }, [offers, query, restaurantFilter, statusFilter]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setNotice(null);
  }

  function editOffer(offer) {
    setForm(mapOfferToForm(offer));
    setNotice(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    const result = form.id ? await updateOffer(form.id, form) : await createOffer(form);
    setSaving(false);

    if (result.error) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    if (form.id) {
      setOffers((current) => current.map((offer) => (offer.id === result.data.id ? result.data : offer)));
      setNotice({ type: "success", message: "Offer updated." });
    } else {
      setOffers((current) => [result.data, ...current]);
      setNotice({ type: "success", message: "Offer created." });
    }

    setForm(emptyForm);
  }

  async function handleDeactivate(offerId) {
    setSaving(true);
    const result = await deactivateOffer(offerId);
    setSaving(false);

    if (result.error) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    setOffers((current) => current.map((offer) => (offer.id === result.data.id ? result.data : offer)));
    if (form.id === offerId) {
      setForm(mapOfferToForm(result.data));
    }
    setNotice({ type: "success", message: "Offer set inactive." });
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search offers or restaurants"
              className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
            />
            <select
              value={restaurantFilter}
              onChange={(event) => setRestaurantFilter(event.target.value)}
              className="rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
            >
              <option value="all">All scopes</option>
              <option value="global">Global offers</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
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

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/[0.03] text-left text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Offer</th>
                    <th className="px-4 py-3 font-semibold">Scope</th>
                    <th className="px-4 py-3 font-semibold">Discount</th>
                    <th className="px-4 py-3 font-semibold">Minimum</th>
                    <th className="px-4 py-3 font-semibold">Window</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                        Loading offers...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && filteredOffers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                        No offers found.
                      </td>
                    </tr>
                  ) : null}

                  {filteredOffers.map((offer) => (
                    <tr key={offer.id} className="align-top transition hover:bg-white/[0.03]">
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">{offer.title}</div>
                        <div className="mt-1 max-w-xs text-xs text-slate-500">{offer.description}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-300">{offer.restaurant?.name ?? "Global"}</td>
                      <td className="px-4 py-4 text-slate-200">{formatDiscount(offer)}</td>
                      <td className="px-4 py-4 text-slate-300">{formatVnd(offer.min_order_amount)}</td>
                      <td className="px-4 py-4 text-slate-300">
                        <div>{formatDate(offer.starts_at)}</div>
                        <div className="mt-1">{formatDate(offer.ends_at)}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-300">{offer.status}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => editOffer(offer)}
                            className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeactivate(offer.id)}
                            disabled={saving || offer.status === "inactive"}
                            className="rounded-md border border-rose-300/20 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Inactive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">{form.id ? "Edit offer" : "Create offer"}</h2>
            {form.id ? (
              <button type="button" onClick={resetForm} className="text-xs font-medium text-emerald-200">
                New
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-300">
              Scope
              <select
                value={form.restaurant_id}
                onChange={(event) => updateForm("restaurant_id", event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
              >
                <option value="">Global offer</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Title
              <input
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Description
              <textarea
                value={form.description}
                onChange={(event) => updateForm("description", event.target.value)}
                rows="3"
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-slate-300">
                Discount type
                <select
                  value={form.discount_type}
                  onChange={(event) => updateForm("discount_type", event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
                >
                  {discountTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-300">
                Value
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.discount_value}
                  onChange={(event) => updateForm("discount_value", event.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
                />
              </label>
            </div>
            <label className="block text-sm text-slate-300">
              Minimum order
              <input
                type="number"
                min="0"
                step="1000"
                value={form.min_order_amount}
                onChange={(event) => updateForm("min_order_amount", event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-slate-300">
                Starts at
                <input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(event) => updateForm("starts_at", event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
                />
              </label>
              <label className="block text-sm text-slate-300">
                Ends at
                <input
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(event) => updateForm("ends_at", event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
                />
              </label>
            </div>
            <label className="block text-sm text-slate-300">
              Status
              <select
                value={form.status}
                onChange={(event) => updateForm("status", event.target.value)}
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 w-full rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {saving ? "Saving..." : form.id ? "Save offer" : "Create offer"}
          </button>
        </form>
      </div>
    </div>
  );
}
