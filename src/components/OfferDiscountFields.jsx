"use client";

import { useState } from "react";

export function OfferDiscountFields({ discountType = "percent", discountValue = "", errors = {}, onFieldChange }) {
  const [type, setType] = useState(discountType);

  function handleTypeChange(event) {
    setType(event.target.value);
    onFieldChange?.("discount_type");
    onFieldChange?.("discount_value");
  }

  return (
    <>
      <label className="space-y-2 text-sm text-slate-300">
        <span>Discount type</span>
        <select
          name="discount_type"
          value={type}
          aria-invalid={Boolean(errors.discount_type)}
          onChange={handleTypeChange}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        >
          <option value="percent">Percent</option>
          <option value="fixed">Fixed amount</option>
        </select>
        {errors.discount_type ? <span className="block text-xs text-rose-200">{errors.discount_type}</span> : null}
      </label>

      <label className="space-y-2 text-sm text-slate-300">
        <span>Discount value</span>
        <input
          name="discount_value"
          type="number"
          min="0.01"
          max={type === "percent" ? "100" : undefined}
          step={type === "percent" ? "0.01" : "1000"}
          defaultValue={discountValue}
          required
          aria-invalid={Boolean(errors.discount_value)}
          onChange={() => onFieldChange?.("discount_value")}
          className="w-full rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-emerald-300"
        />
        {type === "percent" ? <span className="block text-xs text-slate-500">Maximum 100%.</span> : null}
        {errors.discount_value ? <span className="block text-xs text-rose-200">{errors.discount_value}</span> : null}
      </label>
    </>
  );
}
