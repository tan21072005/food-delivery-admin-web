"use client";

import { RouteErrorState } from "@/components/RouteErrorState";

export default function SellerError({ error, unstable_retry }) {
  return <RouteErrorState error={error} unstable_retry={unstable_retry} title="Seller workspace failed to load" />;
}
