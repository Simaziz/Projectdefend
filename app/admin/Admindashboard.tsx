"use client";

// app/admin/AdminDashboard.tsx

import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import {
  Coffee, Plus, Settings, LogOut, Search, Bell,
  TrendingUp, ShoppingBag, DollarSign, AlertCircle, Menu,
  Check, RefreshCw, Edit2, Trash2, X, Upload, ImageIcon,
  Clock, CheckCircle, XCircle, Phone, MapPin, User,
  Hash, StickyNote, Flame, Store, AlarmClock, Save,
} from "lucide-react";
import { addCoffee, updateCoffee, deleteCoffee, updateOrderStatus } from "@/app/admin/actions";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  discount?: number;
  isTopDrink?: boolean;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName?: string;
  phone?: string;
  address?: string;
  note?: string;
  items: OrderItem[];
  totalPrice?: number;
  total?: number;
  status: string;
  createdAt: string;
}

interface ShopSettings {
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

// ─── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending:   { label: "Pending",   bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-300"  },
  preparing: { label: "Preparing", bg: "bg-blue-50",     text: "text-blue-700",    border: "border-blue-300"   },
  completed: { label: "Completed", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-300"},
  cancelled: { label: "Cancelled", bg: "bg-red-50",      text: "text-red-700",     border: "border-red-300"    },
};

const DEFAULT_SETTINGS: ShopSettings = {
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getOrderTotal(order: Order) {
  return (
    order.totalPrice ??
    order.total ??
    order.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ??
    0
  );
}

// ─── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({ product, onClose, onDone }: {
  product: Product | null;
  onClose: () => void;
  onDone: (updated: Product) => void;
}) {
  const isEdit = !!product?._id;
  const [isPending, startTransition] = useTransition();
  const [error, setError]       = useState("");
  const [previewUrl, setPreview] = useState(product?.image ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(formRef.current!);
    if (!fd.get("name"))  return setError("Drink name is required.");
    if (!fd.get("price")) return setError("Price is required.");
    if (!isEdit && !fileRef.current?.files?.[0]) return setError("Please upload an image.");

    startTransition(async () => {
      try {
        let result: any;
        if (isEdit) {
          fd.append("id", product._id);
          fd.append("existingImage", product.image);
          result = await updateCoffee(null, fd);
        } else {
          result = await addCoffee(null, fd);
        }
        if (result?.error) { setError(result.error); return; }
        onDone({
          _id:        isEdit ? product._id : (result?.id ?? String(Date.now())),
          name:       fd.get("name") as string,
          price:      parseFloat(fd.get("price") as string),
          stock:      Number(fd.get("stock")),
          discount:   Number(fd.get("discount")) || 0,
          isTopDrink: fd.get("isTopDrink") === "on",
          image:      previewUrl || (isEdit ? product.image : ""),
        });
        onClose();
      } catch (err: any) {
        if (err?.digest?.includes("NEXT_REDIRECT") || err?.message?.includes("NEXT_REDIRECT")) {
          onClose();
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-stone-900 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-lg">{isEdit ? "Edit Drink" : "Add New Drink"}</h2>
            <p className="text-stone-400 text-xs mt-0.5">{isEdit ? "Update product details" : "Fill in the details below"}</p>
          </div>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 p-2 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={15} /> {error}
              </div>
            )}
            {/* Image */}
            <div>
              <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-2">
                Image {isEdit ? "(leave blank to keep current)" : "*"}
              </label>
              <div onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-stone-200 hover:border-orange-400 rounded-2xl p-4 cursor-pointer transition-colors flex flex-col items-center gap-3">
                {previewUrl
                  ? <img src={previewUrl} alt="preview" className="w-24 h-24 rounded-xl object-cover" />
                  : <div className="w-16 h-16 rounded-xl bg-stone-100 flex items-center justify-center"><ImageIcon size={24} className="text-stone-300" /></div>}
                <p className="text-sm font-bold text-stone-600 flex items-center gap-2"><Upload size={14} /> Click to upload</p>
                <p className="text-xs text-stone-400">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <input ref={fileRef} type="file" name="image" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            {/* Name */}
            <div>
              <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Drink Name *</label>
              <input type="text" name="name" defaultValue={product?.name ?? ""} placeholder="e.g. Caramel Macchiato"
                className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Price ($) *</label>
                <input type="number" name="price" defaultValue={product?.price ?? ""} step="0.01" min="0" placeholder="0.00"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Stock</label>
                <input type="number" name="stock" defaultValue={product?.stock ?? 0} min="0"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            {/* Discount + Top Drink */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Discount (%)</label>
                <input type="number" name="discount" defaultValue={product?.discount ?? 0} min="0" max="100"
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                  <input type="checkbox" name="isTopDrink" defaultChecked={product?.isTopDrink ?? false} className="w-4 h-4 accent-orange-500" />
                  <div>
                    <p className="text-xs font-black text-stone-700">Top Drink</p>
                    <p className="text-[10px] text-stone-400">Feature on homepage</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 pt-2 flex gap-3 border-t border-stone-100">
            <button type="button" onClick={onClose}
              className="flex-1 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl py-2.5 text-sm font-bold transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-300 text-white rounded-xl py-2.5 text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2">
              {isPending ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {isPending ? "Saving…" : isEdit ? "Update" : "Add Drink"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ product, onClose, onDone }: {
  product: Product; onClose: () => void; onDone: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handle = () => startTransition(async () => {
    const fd = new FormData();
    fd.append("id", product._id);
    const result = await deleteCoffee(fd);
    if (result?.error) { setError(result.error); return; }
    onDone(product._id);
    onClose();
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <h3 className="font-black text-stone-900 text-lg">Delete "{product.name}"?</h3>
          <p className="text-stone-400 text-sm mt-2">This cannot be undone.</p>
          {error && <p className="text-red-500 text-xs mt-3 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl py-2.5 text-sm font-bold transition-all">
            Cancel
          </button>
          <button onClick={handle} disabled={isPending}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl py-2.5 text-sm font-black transition-all flex items-center justify-center gap-2">
            {isPending ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onStatusChange }: {
  order: Order;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const cfg   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const total = getOrderTotal(order);

  const setStatus = (newStatus: string) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("orderId", order._id);
      fd.append("status", newStatus);
      await updateOrderStatus(fd);
      onStatusChange(order._id, newStatus);
    });
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
      order.status === "pending" ? "border-amber-200" : "border-stone-100"
    }`}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-stone-50">
        <div className="flex items-center gap-2 min-w-0">
          {order.status === "pending" && (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
          )}
          <span className="text-xs font-black text-stone-400 uppercase tracking-wider flex items-center gap-1">
            <Hash size={10} />{order._id.slice(-6).toUpperCase()}
          </span>
          <span className="text-stone-200 text-xs">·</span>
          <span className="text-xs text-stone-400">{timeAgo(order.createdAt)}</span>
        </div>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {cfg.label}
        </span>
      </div>

      {/* Customer info */}
      <div className="px-4 py-3 space-y-1.5 border-b border-stone-50">
        {order.customerName && (
          <div className="flex items-center gap-2">
            <User size={13} className="text-stone-400 shrink-0" />
            <span className="text-sm font-black text-stone-800">{order.customerName}</span>
          </div>
        )}
        {order.phone && (
          <div className="flex items-center gap-2">
            <Phone size={13} className="text-stone-400 shrink-0" />
            <a href={`tel:${order.phone}`} className="text-sm text-orange-600 font-bold hover:underline">{order.phone}</a>
          </div>
        )}
        {order.address && (
          <div className="flex items-start gap-2">
            <MapPin size={13} className="text-stone-400 shrink-0 mt-0.5" />
            <span className="text-sm text-stone-600 leading-snug">{order.address}</span>
          </div>
        )}
        {order.note && (
          <div className="flex items-start gap-2">
            <StickyNote size={13} className="text-stone-400 shrink-0 mt-0.5" />
            <span className="text-sm text-stone-500 italic">"{order.note}"</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-1.5 border-b border-stone-50">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-lg">{item.quantity}×</span>
              <span className="text-sm text-stone-700">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-stone-800">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Total + action buttons */}
      <div className="px-4 py-3 bg-stone-50 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-stone-400 uppercase font-black tracking-wider">Total</p>
          <p className="text-lg font-black text-stone-900">${total.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          {order.status === "pending" && (
            <>
              <button onClick={() => setStatus("preparing")} disabled={isPending}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white px-3 py-2 rounded-xl text-xs font-black transition-all">
                {isPending ? <RefreshCw size={12} className="animate-spin" /> : <Flame size={12} />}
                Prepare
              </button>
              <button onClick={() => setStatus("cancelled")} disabled={isPending}
                className="flex items-center gap-1.5 bg-stone-200 hover:bg-red-100 hover:text-red-600 text-stone-500 px-3 py-2 rounded-xl text-xs font-black transition-all">
                <XCircle size={12} /> Cancel
              </button>
            </>
          )}
          {order.status === "preparing" && (
            <button onClick={() => setStatus("completed")} disabled={isPending}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white px-4 py-2 rounded-xl text-xs font-black transition-all">
              {isPending ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle size={12} />}
              Mark Complete
            </button>
          )}
          {order.status === "completed" && (
            <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
              <CheckCircle size={12} /> Done
            </span>
          )}
          {order.status === "cancelled" && (
            <button onClick={() => setStatus("pending")} disabled={isPending}
              className="flex items-center gap-1.5 bg-stone-200 hover:bg-stone-300 text-stone-600 px-3 py-2 rounded-xl text-xs font-black transition-all">
              <RefreshCw size={12} /> Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard({
  initialProducts,
  initialOrders,
  initialSettings,
}: {
  initialProducts: Product[];
  initialOrders:   Order[];
  initialSettings: ShopSettings;
}) {
  const [products, setProducts]             = useState<Product[]>(initialProducts);
  const [orders, setOrders]                 = useState<Order[]>(initialOrders);
  const [search, setSearch]                 = useState("");
  const [orderSearch, setOrderSearch]       = useState("");
  const [activeNav, setActiveNav]           = useState("products");
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [editTarget, setEditTarget]         = useState<Product | null | "new">(null);
  const [deleteTarget, setDeleteTarget]     = useState<Product | null>(null);
  const [statusFilter, setStatusFilter]     = useState("all");
  const [lastRefresh, setLastRefresh]       = useState(Date.now());
  const [settingsSaved, setSettingsSaved]   = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError]   = useState("");

  const [settings, setSettings] = useState<ShopSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  // ── Settings helpers ──────────────────────────────────────────────────────────
  const updateSetting = <K extends keyof ShopSettings>(key: K, value: ShopSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const saveSettings = async () => {
    setSettingsSaving(true);
    setSettingsError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed");
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch {
      setSettingsError("Failed to save settings. Please try again.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const toggleClosedDay = (day: string) =>
    setSettings((prev) => ({
      ...prev,
      closedDays: prev.closedDays.includes(day)
        ? prev.closedDays.filter((d) => d !== day)
        : [...prev.closedDays, day],
    }));

  // ── Fetch orders ──────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data);
      setLastRefresh(Date.now());
    } catch { /* silent */ }
  }, []);

  // ── Always poll every 5s regardless of active tab ────────────────────────────
  useEffect(() => {
    fetchOrders(); // fetch immediately on mount
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Also fetch immediately when switching to orders tab ───────────────────────
  useEffect(() => {
    if (activeNav === "orders") fetchOrders();
  }, [activeNav, fetchOrders]);

  // ── Pusher real-time listener ─────────────────────────────────────────────────
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_PUSHER_KEY ||
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) return;

    let pusher: any;
    let channel: any;

    const setupPusher = async () => {
      try {
        const PusherClient = (await import("pusher-js")).default;
        pusher = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });
        channel = pusher.subscribe("admin-orders");
        channel.bind("new-order", () => {
          // New order came in — fetch immediately
          fetchOrders();
        });
      } catch { /* Pusher optional — polling is the fallback */ }
    };

    setupPusher();
    return () => {
      channel?.unbind_all();
      pusher?.disconnect();
    };
  }, [fetchOrders]);

  // ── Optimistic handlers ───────────────────────────────────────────────────────
  const handleSaveDone = (updated: Product) =>
    setProducts((prev) => {
      const exists = prev.find((p) => p._id === updated._id);
      if (exists) return prev.map((p) => (p._id === updated._id ? updated : p));
      return [...prev, updated].sort((a, b) => a.name.localeCompare(b.name));
    });

  const handleDeleteDone = (id: string) =>
    setProducts((prev) => prev.filter((p) => p._id !== id));

  const handleStatusChange = (id: string, status: string) =>
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));

  // ── Derived ───────────────────────────────────────────────────────────────────
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredOrders = orders
    .filter((o) => statusFilter === "all" || o.status === statusFilter)
    .filter((o) =>
      orderSearch === "" ||
      o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone?.includes(orderSearch)
    );

  const totalValue    = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const lowStock      = products.filter((p) => p.stock <= settings.lowStockAlert).length;
  const avgPrice      = products.length ? products.reduce((a, p) => a + p.price, 0) / products.length : 0;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const revenue       = orders.filter((o) => o.status === "completed").reduce((a, o) => a + getOrderTotal(o), 0);

  const navItems = [
    { id: "products", label: "Products", icon: Coffee },
    { id: "orders",   label: "Orders",   icon: ShoppingBag, badge: pendingOrders },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-stone-100 font-sans overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────────── */}
      <aside className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-stone-900 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        <div className="px-6 py-6 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Coffee size={18} className="text-white" />
            </div>
            <div>
              <span className="text-white font-black text-sm tracking-tight">
                {settings.shopName || "BrewAdmin"}
              </span>
              <p className="text-stone-500 text-[10px] uppercase tracking-widest">Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-stone-600 text-[9px] uppercase font-black tracking-widest px-3 mb-3">Main Menu</p>
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeNav === id
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-900/30"
                  : "text-stone-400 hover:text-white hover:bg-stone-800"
              }`}>
              <Icon size={16} />
              <span className="flex-1 text-left">{label}</span>
              {badge ? (
                <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-stone-800">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">Admin</p>
              <p className="text-stone-500 text-[10px] truncate">{settings.shopEmail || "admin@brew.com"}</p>
            </div>
            <button className="text-stone-500 hover:text-stone-300 transition-colors"><LogOut size={14} /></button>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        <header className="bg-white border-b border-stone-200 px-4 md:px-6 py-3.5 flex items-center gap-4 shrink-0">
          <button className="md:hidden text-stone-500 p-1" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-stone-900 font-black text-base capitalize">{activeNav}</h1>
            <p className="text-stone-400 text-xs">Manage your {activeNav}</p>
          </div>
          {activeNav === "products" && (
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input type="text" placeholder="Search drinks…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 w-48 bg-stone-50" />
            </div>
          )}
          {activeNav === "orders" && (
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" placeholder="Name, phone, ID…" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 w-48 bg-stone-50" />
              </div>
              <button onClick={fetchOrders} title="Refresh"
                className="p-2 text-stone-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
                <RefreshCw size={16} />
              </button>
            </div>
          )}
          <button className="relative text-stone-400 hover:text-stone-700 p-2 transition-colors">
            <Bell size={18} />
            {(lowStock > 0 || pendingOrders > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">

          {/* ── PRODUCTS TAB ──────────────────────────────────────────────────── */}
          {activeNav === "products" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "Total Products",  value: products.length,             icon: Coffee,      color: "bg-orange-50 text-orange-600",   ring: "ring-orange-100" },
                  { label: "Inventory Value", value: `$${totalValue.toFixed(0)}`, icon: DollarSign,  color: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" },
                  { label: "Avg. Price",      value: `$${avgPrice.toFixed(2)}`,   icon: TrendingUp,  color: "bg-blue-50 text-blue-600",       ring: "ring-blue-100" },
                  { label: "Low Stock",       value: lowStock,                    icon: AlertCircle, color: lowStock > 0 ? "bg-red-50 text-red-600" : "bg-stone-50 text-stone-400", ring: lowStock > 0 ? "ring-red-100" : "ring-stone-100" },
                ].map(({ label, value, icon: Icon, color, ring }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 md:p-5 border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${color} ring-4 ${ring} flex items-center justify-center shrink-0`}><Icon size={18} /></div>
                    <div>
                      <p className="text-stone-400 text-[10px] uppercase font-black tracking-wider">{label}</p>
                      <p className="text-stone-900 font-black text-xl mt-0.5 leading-none">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-black text-stone-900 text-sm">Product Catalog</h2>
                    <p className="text-stone-400 text-xs mt-0.5">{filteredProducts.length} of {products.length} drinks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative sm:hidden">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 w-32 bg-stone-50" />
                    </div>
                    <button onClick={() => setEditTarget("new")}
                      className="bg-orange-600 hover:bg-orange-500 text-white px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm">
                      <Plus size={14} /> Add Drink
                    </button>
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Coffee size={32} className="text-stone-200 mx-auto mb-3" />
                    <p className="text-stone-400 text-sm font-bold">No drinks found</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile */}
                    <div className="md:hidden divide-y divide-stone-50">
                      {filteredProducts.map((p) => (
                        <div key={p._id} className="p-4 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-14 h-14 rounded-2xl object-cover border border-stone-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-stone-800 truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="text-xs font-black text-orange-700">${p.price.toFixed(2)}</span>
                              {!!p.discount && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">{p.discount}% off</span>}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.stock > 10 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{p.stock} left</span>
                              {p.isTopDrink && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">★ Top</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <button onClick={() => setEditTarget(p)} className="p-2 rounded-xl bg-stone-50 hover:bg-orange-50 hover:text-orange-600 text-stone-400 transition-all"><Edit2 size={14} /></button>
                            <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-xl bg-stone-50 hover:bg-red-50 hover:text-red-500 text-stone-400 transition-all"><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-stone-50 border-b border-stone-100">
                            {["Product", "Price", "Discount", "Stock", "Top Drink", "Actions"].map((h) => (
                              <th key={h} className={`px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                          {filteredProducts.map((p) => (
                            <tr key={p._id} className="hover:bg-stone-50/60 transition-colors group">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <img src={p.image} alt={p.name} className="w-12 h-12 rounded-2xl object-cover border border-stone-100 group-hover:scale-105 transition-transform" />
                                  <span className="text-sm font-black text-stone-800">{p.name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-4"><span className="text-sm font-black text-orange-700">${p.price.toFixed(2)}</span></td>
                              <td className="px-5 py-4">
                                {p.discount ? <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">{p.discount}%</span> : <span className="text-xs text-stone-300">—</span>}
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${p.stock > settings.lowStockAlert ? "bg-emerald-500" : "bg-red-500"}`} />
                                  <span className={`text-xs font-bold ${p.stock > settings.lowStockAlert ? "text-emerald-700" : "text-red-600"}`}>{p.stock} units</span>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                {p.isTopDrink ? <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">★ Yes</span> : <span className="text-xs text-stone-300">—</span>}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => setEditTarget(p)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-orange-100 hover:text-orange-700 text-stone-500 rounded-xl text-xs font-bold transition-all">
                                    <Edit2 size={12} /> Edit
                                  </button>
                                  <button onClick={() => setDeleteTarget(p)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-red-100 hover:text-red-600 text-stone-500 rounded-xl text-xs font-bold transition-all">
                                    <Trash2 size={12} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* ── ORDERS TAB ────────────────────────────────────────────────────── */}
          {activeNav === "orders" && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { label: "Total Orders", value: orders.length,                                       icon: ShoppingBag,  color: "bg-stone-50 text-stone-600",    ring: "ring-stone-100" },
                  { label: "Pending",      value: orders.filter(o => o.status === "pending").length,   icon: Clock,        color: "bg-amber-50 text-amber-600",    ring: "ring-amber-100" },
                  { label: "Completed",    value: orders.filter(o => o.status === "completed").length, icon: CheckCircle,  color: "bg-emerald-50 text-emerald-600",ring: "ring-emerald-100" },
                  { label: "Revenue",      value: `$${revenue.toFixed(0)}`,                            icon: DollarSign,   color: "bg-orange-50 text-orange-600",  ring: "ring-orange-100" },
                ].map(({ label, value, color, ring, icon: Icon }) => (
                  <div key={label} className="bg-white rounded-2xl p-4 md:p-5 border border-stone-100 shadow-sm flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${color} ring-4 ${ring} flex items-center justify-center shrink-0`}><Icon size={18} /></div>
                    <div>
                      <p className="text-stone-400 text-[10px] uppercase font-black tracking-wider">{label}</p>
                      <p className="text-stone-900 font-black text-xl mt-0.5 leading-none">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {["all", "pending", "preparing", "completed", "cancelled"].map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black capitalize transition-all ${
                        statusFilter === s ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-500 hover:border-stone-400"
                      }`}>
                      {s === "all" ? "All" : s}
                      {s !== "all" && <span className="ml-1.5 opacity-60">({orders.filter(o => o.status === s).length})</span>}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 hidden sm:block">
                  Auto-refreshes every 5s · Last: {new Date(lastRefresh).toLocaleTimeString()}
                </p>
              </div>

              {/* Mobile search */}
              <div className="relative sm:hidden">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" placeholder="Search name, phone, ID…" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
              </div>

              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
                  <ShoppingBag size={32} className="text-stone-200 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm font-bold">No orders found</p>
                  <p className="text-stone-300 text-xs mt-1">Try a different filter or wait for new orders.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── SETTINGS TAB ──────────────────────────────────────────────────── */}
          {activeNav === "settings" && (
            <div className="max-w-2xl space-y-5">

              {settingsSaved && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold">
                  <Check size={16} /> Settings saved successfully!
                </div>
              )}

              {/* Shop Status */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100">
                  <h2 className="font-black text-stone-900 text-sm flex items-center gap-2"><Store size={15} className="text-orange-500" /> Shop Status</h2>
                  <p className="text-stone-400 text-xs mt-0.5">Toggle your shop open or closed for customers</p>
                </div>
                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-stone-800">{settings.isOpen ? "Shop is Open 🟢" : "Shop is Closed 🔴"}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{settings.isOpen ? "Customers can place orders" : "No new orders will be accepted"}</p>
                  </div>
                  <button onClick={() => updateSetting("isOpen", !settings.isOpen)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${settings.isOpen ? "bg-emerald-500" : "bg-stone-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${settings.isOpen ? "translate-x-7" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>

              {/* Shop Info */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100">
                  <h2 className="font-black text-stone-900 text-sm flex items-center gap-2"><Store size={15} className="text-orange-500" /> Shop Information</h2>
                  <p className="text-stone-400 text-xs mt-0.5">Your shop's public details</p>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div>
                    <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Shop Name</label>
                    <input type="text" value={settings.shopName} onChange={(e) => updateSetting("shopName", e.target.value)}
                      placeholder="e.g. Cozy Cup Coffee"
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Address</label>
                    <input type="text" value={settings.shopAddress} onChange={(e) => updateSetting("shopAddress", e.target.value)}
                      placeholder="e.g. 123 Brew Street, Bangkok"
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Phone</label>
                      <input type="tel" value={settings.shopPhone} onChange={(e) => updateSetting("shopPhone", e.target.value)}
                        placeholder="e.g. 081-234-5678"
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Email</label>
                      <input type="email" value={settings.shopEmail} onChange={(e) => updateSetting("shopEmail", e.target.value)}
                        placeholder="e.g. hello@cozycup.com"
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100">
                  <h2 className="font-black text-stone-900 text-sm flex items-center gap-2"><AlarmClock size={15} className="text-orange-500" /> Opening Hours</h2>
                  <p className="text-stone-400 text-xs mt-0.5">Set your daily open and close times</p>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Open Time</label>
                      <input type="time" value={settings.openTime} onChange={(e) => updateSetting("openTime", e.target.value)}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-1.5">Close Time</label>
                      <input type="time" value={settings.closeTime} onChange={(e) => updateSetting("closeTime", e.target.value)}
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-2">Closed Days</label>
                    <div className="flex flex-wrap gap-2">
                      {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => (
                        <button key={day} onClick={() => toggleClosedDay(day)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all border ${
                            settings.closedDays.includes(day)
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                          }`}>
                          {day}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-2">
                      {settings.closedDays.length === 0 ? "Open every day" : `Closed on: ${settings.closedDays.join(", ")}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-100">
                  <h2 className="font-black text-stone-900 text-sm flex items-center gap-2"><Bell size={15} className="text-orange-500" /> Notifications & Alerts</h2>
                  <p className="text-stone-400 text-xs mt-0.5">Control when you get notified</p>
                </div>
                <div className="px-5 py-4 divide-y divide-stone-50">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-black text-stone-800">New Order Alert</p>
                      <p className="text-xs text-stone-400 mt-0.5">Show badge when a new order arrives</p>
                    </div>
                    <button onClick={() => updateSetting("notifyNewOrder", !settings.notifyNewOrder)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.notifyNewOrder ? "bg-orange-500" : "bg-stone-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${settings.notifyNewOrder ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-black text-stone-800">Low Stock Alert</p>
                      <p className="text-xs text-stone-400 mt-0.5">Show warning when stock falls below threshold</p>
                    </div>
                    <button onClick={() => updateSetting("notifyLowStock", !settings.notifyLowStock)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${settings.notifyLowStock ? "bg-orange-500" : "bg-stone-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${settings.notifyLowStock ? "translate-x-6" : "translate-x-0"}`} />
                    </button>
                  </div>
                  <div className="py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-black text-stone-800">Low Stock Threshold</p>
                        <p className="text-xs text-stone-400 mt-0.5">Alert when stock drops to this number</p>
                      </div>
                      <span className="text-lg font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-xl">
                        {settings.lowStockAlert}
                      </span>
                    </div>
                    <input type="range" min="1" max="50" step="1"
                      value={settings.lowStockAlert}
                      onChange={(e) => updateSetting("lowStockAlert", Number(e.target.value))}
                      className="w-full accent-orange-500" />
                    <div className="flex justify-between text-[10px] text-stone-300 mt-1">
                      <span>1 unit</span><span>50 units</span>
                    </div>
                  </div>
                </div>
              </div>

              {settingsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm font-bold">
                  <AlertCircle size={15} /> {settingsError}
                </div>
              )}

              <button onClick={saveSettings} disabled={settingsSaving}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg">
                {settingsSaving
                  ? <><RefreshCw size={16} className="animate-spin" /> Saving…</>
                  : <><Save size={16} /> Save Settings</>}
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      {editTarget !== null && (
        <ProductModal
          product={editTarget === "new" ? null : editTarget}
          onClose={() => setEditTarget(null)}
          onDone={handleSaveDone}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDone={handleDeleteDone}
        />
      )}
    </div>
  );
}