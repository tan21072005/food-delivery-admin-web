"use client";

import { useEffect, useMemo, useState } from "react";
import { TableEmptyStateRow, TableSkeletonRows } from "@/components/TableStateRows";
import {
  createCategory,
  deleteCategory,
  listCategories,
  listCategoryRestaurants,
  updateCategory,
} from "@/services/categoryService";

const statuses = ["active", "inactive"];

const emptyForm = {
  id: null,
  restaurant_id: "",
  name: "",
  slug: "",
  sort_order: 0,
  status: "active",
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryTable() {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoading(true);
      const [categoryResult, restaurantResult] = await Promise.all([
        listCategories(),
        listCategoryRestaurants(),
      ]);

      if (!mounted) {
        return;
      }

      setCategories(categoryResult.data);
      setRestaurants(restaurantResult.data);
      setNotice(
        categoryResult.error || restaurantResult.error
          ? { type: "error", message: categoryResult.error || restaurantResult.error }
          : null,
      );
      setLoading(false);
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) => restaurantFilter === "all" || String(category.restaurant_id) === restaurantFilter,
    );
  }, [categories, restaurantFilter]);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "name" && !current.id ? { slug: slugify(value) } : {}),
    }));
  }

  function editCategory(category) {
    setForm({
      id: category.id,
      restaurant_id: String(category.restaurant_id),
      name: category.name ?? "",
      slug: category.slug ?? "",
      sort_order: category.sort_order ?? 0,
      status: category.status ?? "active",
    });
    setNotice(null);
  }

  function resetForm() {
    setForm(emptyForm);
    setNotice(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.id) {
      const currentCategory = categories.find((category) => category.id === form.id);
      const statusChanged = currentCategory && currentCategory.status !== form.status;

      if (statusChanged && !window.confirm(`Change ${form.name} status to ${form.status}?`)) {
        return;
      }
    }

    setSaving(true);

    const result = form.id ? await updateCategory(form.id, form) : await createCategory(form);
    setSaving(false);

    if (result.error) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    if (form.id) {
      setCategories((current) =>
        current.map((category) => (category.id === result.data.id ? result.data : category)),
      );
      setNotice({ type: "success", message: "Category updated." });
    } else {
      setCategories((current) => [...current, result.data]);
      setNotice({ type: "success", message: "Category created." });
    }

    setForm(emptyForm);
  }

  async function handleDelete(categoryId) {
    const category = categories.find((item) => item.id === categoryId);

    if (!window.confirm(`Delete ${category?.name ?? "this category"}?`)) {
      return;
    }

    setSaving(true);
    const result = await deleteCategory(categoryId);
    setSaving(false);

    if (result.error) {
      setNotice({ type: "error", message: result.error });
      return;
    }

    setCategories((current) => current.filter((category) => category.id !== categoryId));
    if (form.id === categoryId) {
      setForm(emptyForm);
    }
    setNotice({ type: "success", message: "Category deleted." });
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

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-3">
          <select
            value={restaurantFilter}
            onChange={(event) => setRestaurantFilter(event.target.value)}
            className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70 md:w-72"
          >
            <option value="all">All restaurants</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>

          <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-white/[0.03] text-left text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Restaurant</th>
                    <th className="px-4 py-3 font-semibold">Sort</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <TableSkeletonRows columns={5} />
                  ) : null}

                  {!loading && filteredCategories.length === 0 ? (
                    <TableEmptyStateRow
                      colSpan={5}
                      title="No categories found"
                      description="Create a category in the panel beside this table, or change the restaurant filter."
                    />
                  ) : null}

                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="transition hover:bg-white/[0.03]">
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">{category.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{category.slug}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-300">{category.restaurant?.name ?? "-"}</td>
                      <td className="px-4 py-4 text-slate-300">{category.sort_order}</td>
                      <td className="px-4 py-4 text-slate-300">{category.status}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => editCategory(category)}
                            className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category.id)}
                            disabled={saving}
                            className="rounded-md border border-rose-300/20 px-3 py-1.5 text-xs font-medium text-rose-100 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Delete
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
            <h2 className="text-base font-semibold text-white">{form.id ? "Edit category" : "Create category"}</h2>
            {form.id ? (
              <button type="button" onClick={resetForm} className="text-xs font-medium text-emerald-200">
                New
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-300">
              Restaurant
              <select
                value={form.restaurant_id}
                onChange={(event) => updateForm("restaurant_id", event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
              >
                <option value="">Select restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Name
              <input
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Slug
              <input
                value={form.slug}
                onChange={(event) => updateForm("slug", event.target.value)}
                required
                className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm text-slate-300">
                Sort order
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(event) => updateForm("sort_order", event.target.value)}
                  className="mt-1 w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-emerald-300/70"
                />
              </label>
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
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 w-full rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {saving ? "Saving..." : form.id ? "Save category" : "Create category"}
          </button>
        </form>
      </div>
    </div>
  );
}
