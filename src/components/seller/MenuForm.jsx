"use client";

import { useState } from "react";
import { ImagePreview } from "@/components/ImagePreview";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { validateMenuItemFields } from "@/lib/validation/menuItem";

function FieldError({ children }) {
  return children ? <span className="block text-xs text-rose-200">{children}</span> : null;
}

function buildPayload(formData) {
  return {
    name: formData.get("name")?.toString().trim() ?? "",
    dish_category_id: formData.get("dish_category_id")?.toString().trim() ?? "",
    description: formData.get("description")?.toString().trim() ?? "",
    base_price: Number(formData.get("base_price")),
    image_url: formData.get("image_url")?.toString().trim() ?? "",
    image_file: formData.get("image_file"),
    status: formData.get("status")?.toString().trim() ?? "active",
  };
}

export function MenuForm({ categories, item, action, submitLabel }) {
  const [errors, setErrors] = useState({});

  function clearError(field) {
    setErrors((current) => ({ ...current, [field]: null }));
  }

  function handleSubmit(event) {
    const validationErrors = validateMenuItemFields(buildPayload(new FormData(event.currentTarget)));

    if (Object.keys(validationErrors).length === 0) {
      return;
    }

    event.preventDefault();
    setErrors(validationErrors);
  }

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="grid gap-4 rounded-md border border-white/10 bg-slate-950/50 p-4 md:grid-cols-2">
      {item ? <input type="hidden" name="id" defaultValue={item.id} /> : null}

      <label className="space-y-2 text-sm text-slate-300">
        <span>Name</span>
        <input
          name="name"
          defaultValue={item?.name ?? ""}
          required
          maxLength="120"
          aria-invalid={Boolean(errors.name)}
          onChange={() => clearError("name")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        <FieldError>{errors.name}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Category</span>
        <select name="dish_category_id" defaultValue={item?.dish_category_id ?? ""} className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300">
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Base price</span>
        <input
          name="base_price"
          type="number"
          min="0"
          step="1000"
          defaultValue={item?.base_price ?? ""}
          required
          aria-invalid={Boolean(errors.base_price)}
          onChange={() => clearError("base_price")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        <FieldError>{errors.base_price}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Status</span>
        <select
          name="status"
          defaultValue={item?.status ?? "active"}
          aria-invalid={Boolean(errors.status)}
          onChange={() => clearError("status")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        >
          <option value="active">Active</option>
          <option value="sold_out">Sold out</option>
          <option value="inactive">Inactive</option>
        </select>
        <FieldError>{errors.status}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Description</span>
        <textarea
          name="description"
          rows={2}
          maxLength="1000"
          defaultValue={item?.description ?? ""}
          aria-invalid={Boolean(errors.description)}
          onChange={() => clearError("description")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        <FieldError>{errors.description}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Image URL</span>
        <input
          name="image_url"
          type="url"
          defaultValue={item?.image_url ?? ""}
          aria-invalid={Boolean(errors.image_url)}
          onChange={() => clearError("image_url")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        <FieldError>{errors.image_url}</FieldError>
      </label>

      <label className="space-y-2 text-sm text-slate-300 md:col-span-2">
        <span>Upload image</span>
        <input
          name="image_file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-invalid={Boolean(errors.image_file)}
          onChange={() => clearError("image_file")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950 hover:file:bg-emerald-300"
        />
        <FieldError>{errors.image_file}</FieldError>
      </label>

      {item?.image_url ? (
        <div className="md:col-span-2">
          <ImagePreview src={item.image_url} className="h-28 w-40" />
        </div>
      ) : null}

      <div className="flex justify-end md:col-span-2">
        <PendingSubmitButton className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
          {submitLabel}
        </PendingSubmitButton>
      </div>
    </form>
  );
}
