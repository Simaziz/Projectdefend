// hooks/useShopSettings.ts
// Use this hook in any customer-facing client component
// to read live shop settings (name, open/close status, hours, etc.)

"use client";

import { useState, useEffect } from "react";

export interface ShopSettings {
  shopName:        string;
  shopAddress:     string;
  shopPhone:       string;
  shopEmail:       string;
  openTime:        string;
  closeTime:       string;
  closedDays:      string[];
  lowStockAlert:   number;
  notifyNewOrder:  boolean;
  notifyLowStock:  boolean;
  isOpen:          boolean;
}

const DEFAULT: ShopSettings = {
  shopName:        "Cozy Cup",
  shopAddress:     "",
  shopPhone:       "",
  shopEmail:       "",
  openTime:        "08:00",
  closeTime:       "20:00",
  closedDays:      [],
  lowStockAlert:   10,
  notifyNewOrder:  true,
  notifyLowStock:  true,
  isOpen:          true,
};

// Returns true if current time is within open/close range and today is not a closed day
function isWithinHours(settings: ShopSettings): boolean {
  const now   = new Date();
  const days  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = days[now.getDay()];

  if (settings.closedDays.includes(today)) return false;

  const [openH,  openM]  = settings.openTime.split(":").map(Number);
  const [closeH, closeM] = settings.closeTime.split(":").map(Number);

  const nowMinutes   = now.getHours() * 60 + now.getMinutes();
  const openMinutes  = openH  * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/shop/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({ ...DEFAULT, ...data });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // isCurrentlyOpen = admin toggled open AND within opening hours
  const isCurrentlyOpen = settings.isOpen && isWithinHours(settings);

  return { settings, loading, isCurrentlyOpen };
}