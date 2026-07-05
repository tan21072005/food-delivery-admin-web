"use client";

import { useState } from "react";
import { OfferDiscountFields } from "@/components/OfferDiscountFields";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { validateOfferFields } from "@/lib/validation/offer";

function toInputDateTime(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toISOString().slice(0, 16);
}

function FieldError({ children }) {
  return children ? <span className="block text-xs text-rose-200">{children}</span> : null;
}

function buildOfferPayload(formData) {
  return {
    title: formData.get("title")?.toString().trim() ?? "",
    discount_type: formData.get("discount_type")?.toString().trim() ?? "percent",
    discount_value: Number(formData.get("discount_value")),
    min_order_amount: Number(formData.get("min_order_amount") || 0),
    starts_at: formData.get("starts_at")?.toString().trim() || null,
    ends_at: formData.get("ends_at")?.toString().trim() || null,
    status: formData.get("status")?.toString().trim() ?? "active",
  };
}

export function OfferForm({ action, offer, restaurants = [], submitLabel }) {
  const [errors, setErrors] = useState({});

  function clearError(field) {
    setErrors((current) => ({ ...current, [field]: null }));
  }

  function handleSubmit(event) {
    const validationErrors = validateOfferFields(buildOfferPayload(new FormData(event.currentTarget)));

    if (Object.keys(validationErrors).length === 0) {
      return;
    }

    event.preventDefault();
    setErrors(validationErrors);
  }

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="grid gap-4 rounded-md border border-white/10 bg-slate-950/50 p-4 md:grid-cols-2">
      {offer ? <input type="hidden" name="id" defaultValue={offer.id} /> : null}

      <label className="space-y-2 text-sm text-slate-300">
        <span>Scope</span>
        <select
          name="restaurant_id"
          defaultValue={offer?.restaurant_id ? String(offer.restaurant_id) : ""}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        >
          <option value="">Global offer</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Status</span>
        <select
          name="status"
          defaultValue={offer?.status ?? "active"}
          aria-invalid={Boolean(errors.status)}
          onChange={() => clearError("status")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <FieldError>{errors.status}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Title</span>
        <input
          name="title"
          defaultValue={offer?.title ?? ""}
          required
          aria-invalid={Boolean(errors.title)}
          onChange={() => clearError("title")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        <FieldError>{errors.title}</FieldError>
      </label>

      <OfferDiscountFields
        discountType={offer?.discount_type ?? "percent"}
        discountValue={offer?.discount_value ?? ""}
        errors={errors}
        onFieldChange={clearError}
      />

      <label className="space-y-2 text-sm text-slate-300">
        <span>Minimum order</span>
        <input
          name="min_order_amount"
          type="number"
          min="0"
          step="1000"
          defaultValue={offer?.min_order_amount ?? 0}
          aria-invalid={Boolean(errors.min_order_amount)}
          onChange={() => clearError("min_order_amount")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        <FieldError>{errors.min_order_amount}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Starts at</span>
        <input
          name="starts_at"
          type="datetime-local"
          defaultValue={toInputDateTime(offer?.starts_at)}
          aria-invalid={Boolean(errors.starts_at)}
          onChange={() => clearError("starts_at")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        <FieldError>{errors.starts_at}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Ends at</span>
        <input
          name="ends_at"
          type="datetime-local"
          defaultValue={toInputDateTime(offer?.ends_at)}
          aria-invalid={Boolean(errors.ends_at)}
          onChange={() => clearError("ends_at")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        <FieldError>{errors.ends_at}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Description</span>
        <textarea
          name="description"
          rows={2}
          defaultValue={offer?.description ?? ""}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
      </label>

      <div className="flex justify-end md:col-span-2">
        <PendingSubmitButton
          className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </PendingSubmitButton>
      </div>
    </form>
  );
}
