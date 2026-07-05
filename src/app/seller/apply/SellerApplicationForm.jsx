"use client";

import { useState } from "react";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { validateSellerApplicationFields } from "@/lib/validation/sellerApplication";

function FieldError({ children }) {
  return children ? <p className="mt-1 text-xs text-rose-200">{children}</p> : null;
}

function buildPayload(formData) {
  return {
    restaurant_name: formData.get("restaurant_name")?.toString().trim() ?? "",
    owner_name: formData.get("owner_name")?.toString().trim() ?? "",
    email: formData.get("email")?.toString().trim().toLowerCase() ?? "",
    phone_number: formData.get("phone_number")?.toString().trim() ?? "",
    address: formData.get("address")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
  };
}

export function SellerApplicationForm({ action }) {
  const [errors, setErrors] = useState({});

  function clearError(field) {
    setErrors((current) => ({ ...current, [field]: null }));
  }

  function handleSubmit(event) {
    const formData = new FormData(event.currentTarget);
    const validationErrors = validateSellerApplicationFields(buildPayload(formData));

    if (Object.keys(validationErrors).length === 0) {
      return;
    }

    event.preventDefault();
    setErrors(validationErrors);
  }

  return (
    <form action={action} onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
      <label className="block text-sm text-slate-300">
        Restaurant name
        <input
          name="restaurant_name"
          required
          maxLength="120"
          aria-invalid={Boolean(errors.restaurant_name)}
          onChange={() => clearError("restaurant_name")}
          className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
        />
        <FieldError>{errors.restaurant_name}</FieldError>
      </label>

      <label className="block text-sm text-slate-300">
        Owner name
        <input
          name="owner_name"
          required
          maxLength="120"
          aria-invalid={Boolean(errors.owner_name)}
          onChange={() => clearError("owner_name")}
          className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
        />
        <FieldError>{errors.owner_name}</FieldError>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Email
          <input
            name="email"
            type="email"
            required
            aria-invalid={Boolean(errors.email)}
            onChange={() => clearError("email")}
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
          />
          <FieldError>{errors.email}</FieldError>
        </label>

        <label className="block text-sm text-slate-300">
          Phone
          <input
            name="phone_number"
            onChange={() => clearError("phone_number")}
            className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
          />
          <FieldError>{errors.phone_number}</FieldError>
        </label>
      </div>

      <label className="block text-sm text-slate-300">
        Address
        <input
          name="address"
          required
          maxLength="240"
          aria-invalid={Boolean(errors.address)}
          onChange={() => clearError("address")}
          className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
        />
        <FieldError>{errors.address}</FieldError>
      </label>

      <label className="block text-sm text-slate-300">
        Notes
        <textarea
          name="description"
          rows="4"
          maxLength="1000"
          aria-invalid={Boolean(errors.description)}
          onChange={() => clearError("description")}
          className="mt-1 w-full resize-y rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
        />
        <FieldError>{errors.description}</FieldError>
      </label>

      <PendingSubmitButton className="w-full rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
        Submit application
      </PendingSubmitButton>
    </form>
  );
}
