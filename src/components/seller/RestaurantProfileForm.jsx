"use client";

import { useState } from "react";
import { ImagePreview } from "@/components/ImagePreview";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { validateRestaurantProfileFields } from "@/lib/validation/restaurantProfile";

function FieldError({ children }) {
  return children ? <span className="block text-xs text-rose-200">{children}</span> : null;
}

function buildPayload(formData) {
  return {
    name: formData.get("name")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
    phone_number: formData.get("phone_number")?.toString().trim() ?? "",
    address_detail: formData.get("address_detail")?.toString().trim() ?? "",
    locality: formData.get("locality")?.toString().trim() ?? "",
    logo_url: formData.get("logo_url")?.toString().trim() ?? "",
    cover_url: formData.get("cover_url")?.toString().trim() ?? "",
    logo_file: formData.get("logo_file"),
    cover_file: formData.get("cover_file"),
  };
}

export function RestaurantProfileForm({ restaurant, address, action }) {
  const [errors, setErrors] = useState({});

  function clearError(field) {
    setErrors((current) => ({ ...current, [field]: null }));
  }

  function handleSubmit(event) {
    const validationErrors = validateRestaurantProfileFields(buildPayload(new FormData(event.currentTarget)));

    if (Object.keys(validationErrors).length === 0) {
      return;
    }

    event.preventDefault();
    setErrors(validationErrors);
  }

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="space-y-6 rounded-lg border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{restaurant.name}</h2>
          <p className="mt-1 text-sm text-slate-400">Only the owner of this restaurant can update this profile.</p>
        </div>
        <label className="flex w-fit items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200">
          <input name="is_open" type="checkbox" defaultChecked={restaurant.is_open} className="h-4 w-4 accent-emerald-400" />
          Open for orders
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-300">
          <span>Name</span>
          <input
            name="name"
            defaultValue={restaurant.name}
            required
            maxLength="120"
            aria-invalid={Boolean(errors.name)}
            onChange={() => clearError("name")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
          />
          <FieldError>{errors.name}</FieldError>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span>Phone number</span>
          <input
            name="phone_number"
            defaultValue={restaurant.phone_number ?? ""}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
          />
        </label>

        <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
          <span>Description</span>
          <textarea
            name="description"
            defaultValue={restaurant.description ?? ""}
            rows={3}
            maxLength="1000"
            aria-invalid={Boolean(errors.description)}
            onChange={() => clearError("description")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
          />
          <FieldError>{errors.description}</FieldError>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span>Address detail</span>
          <input
            name="address_detail"
            defaultValue={address.addressDetail}
            required
            maxLength="240"
            aria-invalid={Boolean(errors.address_detail)}
            onChange={() => clearError("address_detail")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
          />
          <FieldError>{errors.address_detail}</FieldError>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span>Locality</span>
          <input
            name="locality"
            defaultValue={address.locality}
            maxLength="160"
            aria-invalid={Boolean(errors.locality)}
            onChange={() => clearError("locality")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
          />
          <FieldError>{errors.locality}</FieldError>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span>Logo URL</span>
          <input
            name="logo_url"
            defaultValue={restaurant.logo_url ?? ""}
            type="url"
            aria-invalid={Boolean(errors.logo_url)}
            onChange={() => clearError("logo_url")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
          />
          <FieldError>{errors.logo_url}</FieldError>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span>Cover URL</span>
          <input
            name="cover_url"
            defaultValue={restaurant.cover_url ?? ""}
            type="url"
            aria-invalid={Boolean(errors.cover_url)}
            onChange={() => clearError("cover_url")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
          />
          <FieldError>{errors.cover_url}</FieldError>
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span>Upload logo</span>
          <input
            name="logo_file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-invalid={Boolean(errors.logo_file)}
            onChange={() => clearError("logo_file")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-300"
          />
          <FieldError>{errors.logo_file}</FieldError>
          <ImagePreview src={restaurant.logo_url} className="mt-2 h-20 w-20" />
        </label>

        <label className="space-y-2 text-sm text-slate-300">
          <span>Upload cover</span>
          <input
            name="cover_file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-invalid={Boolean(errors.cover_file)}
            onChange={() => clearError("cover_file")}
            className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-300"
          />
          <FieldError>{errors.cover_file}</FieldError>
          <ImagePreview src={restaurant.cover_url} className="mt-2 h-20 w-36" />
        </label>
      </div>

      <div className="flex justify-end">
        <PendingSubmitButton className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
          Save restaurant
        </PendingSubmitButton>
      </div>
    </form>
  );
}
