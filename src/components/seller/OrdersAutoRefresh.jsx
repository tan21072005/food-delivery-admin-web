"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

function playNewOrderTone() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;

  if (!AudioContext) {
    return;
  }

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(740, context.currentTime);
  gain.gain.setValueAtTime(0.001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.35);
}

export function OrdersAutoRefresh({ restaurantId, pendingCount, intervalMs = 30000 }) {
  const router = useRouter();
  const previousPendingCount = useRef(pendingCount);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, router]);

  useEffect(() => {
    if (pendingCount > previousPendingCount.current) {
      playNewOrderTone();
    }

    previousPendingCount.current = pendingCount;
  }, [pendingCount]);

  useEffect(() => {
    const supabase = createClient();

    if (!supabase || !restaurantId) {
      return undefined;
    }

    const channel = supabase
      .channel(`seller-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      setIsRealtimeConnected(false);
      supabase.removeChannel(channel);
    };
  }, [restaurantId, router]);

  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
      {isRealtimeConnected ? "Realtime on" : "Auto-refresh on"}
    </span>
  );
}
