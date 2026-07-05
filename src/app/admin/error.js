"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

export default function AdminError({ error, unstable_retry }) {
  return <RouteErrorState error={error} unstable_retry={unstable_retry} title="Admin workspace failed to load" />;
}
