"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { getAdminStats } from "@/services/adminStatsService";

const metrics = [
  { key: "totalUsers", label: "Total users", helper: "All platform accounts" },
  { key: "totalRestaurants", label: "Restaurants", helper: "All live records" },
  { key: "totalOrders", label: "Orders", helper: "All platform orders" },
  { key: "pendingOrders", label: "Pending orders", helper: "Needs attention" },
  { key: "openRestaurants", label: "Open restaurants", helper: "Accepting orders" },
];

const emptyStats = {
  totalUsers: 0,
  totalRestaurants: 0,
  totalOrders: 0,
  pendingOrders: 0,
  openRestaurants: 0,
};

export function AdminStats() {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadStats() {
      setLoading(true);
      const result = await getAdminStats();

      if (!mounted) {
        return;
      }

      setStats(result.stats);
      setError(result.error);
      setLoading(false);
    }

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-4">
      {error ? (
        <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.key}
            label={metric.label}
            value={stats[metric.key].toLocaleString("en-US")}
            helper={metric.helper}
            loading={loading}
          />
        ))}
      </div>
    </section>
  );
}
