"use client";

// components/ShopStatusBanner.tsx
// Drop this anywhere on your customer-facing layout —
// navbar, landing page hero, or top of menu page.

import { useShopSettings } from "../hook/useShopSettings";
import { Clock, Phone, MapPin } from "lucide-react";

// ── Small inline badge — perfect for navbar ────────────────────────────────────
export function ShopStatusBadge() {
  const { isCurrentlyOpen, loading, settings } = useShopSettings();

  if (loading) return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-400 text-xs font-bold animate-pulse">
      <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
      Checking…
    </span>
  );

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
      isCurrentlyOpen
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-red-50 text-red-700 border-red-200"
    }`}>
      <span className={`relative flex w-2 h-2`}>
        {isCurrentlyOpen && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full w-2 h-2 ${isCurrentlyOpen ? "bg-emerald-500" : "bg-red-500"}`} />
      </span>
      {isCurrentlyOpen ? "Open Now" : "Closed"}
    </span>
  );
}

// ── Compact pill banner — fits inline, not full width ─────────────────────────
export function ShopStatusBanner() {
  const { isCurrentlyOpen, loading, settings } = useShopSettings();

  if (loading) return (
    <div className="h-7 w-28 bg-stone-100 animate-pulse rounded-full" />
  );

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
      isCurrentlyOpen
        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
        : "bg-red-50 border-red-200 text-red-700"
    }`}>
      {/* Pulsing dot */}
      <span className="relative flex w-2 h-2 shrink-0">
        {isCurrentlyOpen && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full w-2 h-2 ${isCurrentlyOpen ? "bg-emerald-500" : "bg-red-500"}`} />
      </span>

      {/* Label */}
      <span>{isCurrentlyOpen ? "Open Now" : "Closed"}</span>

      {/* Divider + hours */}
      <span className="opacity-40">·</span>
      <span className="flex items-center gap-1 opacity-75">
        <Clock size={10} />
        {settings.openTime}–{settings.closeTime}
      </span>
    </div>
  );
}

// ── Closed overlay — blocks ordering when shop is closed ──────────────────────
export function ShopClosedOverlay({ children }: { children: React.ReactNode }) {
  const { isCurrentlyOpen, loading, settings } = useShopSettings();

  if (loading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      {!isCurrentlyOpen && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10 p-6 text-center">
          <div className="text-4xl mb-3">☕</div>
          <h3 className="font-black text-stone-900 text-lg">We're Closed Right Now</h3>
          <p className="text-stone-500 text-sm mt-1">
            {settings.closedDays.includes(
              ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()]
            )
              ? "We're closed today. See you tomorrow!"
              : `Come back at ${settings.openTime}!`
            }
          </p>
          <p className="text-stone-400 text-xs mt-3 flex items-center gap-1">
            <Clock size={11} /> Hours: {settings.openTime} – {settings.closeTime}
          </p>
        </div>
      )}
    </div>
  );
}