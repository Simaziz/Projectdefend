"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Coffee, ShieldCheck, CreditCard, MapPin, Loader2 } from "lucide-react";

export default function OrderButton({ coffee }: { coffee: any }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ address: "", phone: "", note: "" });

  const totalPrice = coffee.price * quantity;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [showForm]);

  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error("GPS not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          setFormData((prev) => ({ ...prev, address: data.display_name || `Lat: ${latitude}, Lon: ${longitude}` }));
          toast.success("📍 Location synced!");
        } catch {
          toast.error("GPS active, but address failed.");
        } finally {
          setLocating(false);
        }
      },
      () => { setLocating(false); toast.error("Location access denied."); },
      { enableHighAccuracy: true }
    );
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Sending to kitchen...");

    try {
      // ── Send as items[] array so admin sees it as one package ──────────────
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: session?.user?.name || session?.user?.email || "Guest",
          address:      formData.address,
          phone:        formData.phone,
          note:         formData.note,
          items: [{ coffeeId: coffee._id, quantity }],
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Order failed");
      }

      setShowForm(false);
      setQuantity(1);
      setFormData({ address: "", phone: "", note: "" });

      setTimeout(() => {
        toast.success("🎉 Order placed! We're brewing your drink!", {
          id: loadingToast,
          duration: 4000,
          style: { background: "#1c1917", color: "#fafaf9", borderRadius: "1.25rem", fontSize: "14px", fontWeight: "700", padding: "14px 24px", border: "1px solid rgba(234,88,12,0.4)" },
          iconTheme: { primary: "#ea580c", secondary: "#fff" },
        });
      }, 300);

    } catch (err: any) {
      toast.error(err.message || "Order failed.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {mounted && createPortal(
        <Toaster
          position="top-center"
          containerStyle={{ zIndex: 99999, top: 24 }}
          toastOptions={{
            style: { background: "#1c1917", color: "#fafaf9", borderRadius: "1.25rem", fontSize: "14px", fontWeight: "700", padding: "14px 24px", border: "1px solid rgba(234,88,12,0.4)" },
          }}
        />,
        document.body
      )}

      {/* Trigger Button */}
      <button
        onClick={() => {
          if (status === "loading") return;
          if (!session) {
            toast.error("Please login to place an order!", { icon: "🔒" });
            setTimeout(() => router.push("/login"), 1500);
            return;
          }
          setShowForm(true);
        }}
        disabled={coffee.stock <= 0 || status === "loading"}
        className="w-full py-2 sm:py-4 px-3 sm:px-6 rounded-2xl font-black uppercase text-[9px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.25em] text-white bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all duration-200 shadow-lg disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {coffee.stock <= 0 ? "Out of Stock" : "Place Order"}
      </button>

      {/* Order Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
                className="absolute inset-0 bg-stone-950/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ y: "100%", opacity: 0.5 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-[#fdfcfb] w-full max-w-lg rounded-t-[3rem] md:rounded-[3rem] shadow-2xl relative z-10 flex flex-col max-h-[92vh] overflow-hidden"
              >
                {/* Header */}
                <div className="px-8 pt-10 pb-6 shrink-0 bg-white/50 backdrop-blur-sm border-b border-stone-50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-4xl font-serif italic text-stone-900 tracking-tight">Checkout</h2>
                    <button onClick={() => setShowForm(false)} className="bg-stone-100 p-3 rounded-2xl text-stone-400">
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
                  <form id="order-form" onSubmit={handleOrder} className="space-y-6">

                    {/* Summary */}
                    <div className="flex items-center justify-between p-4 bg-stone-50 rounded-3xl border border-stone-100">
                      <div className="flex items-center gap-3">
                        <Coffee className="text-orange-600" size={20} />
                        <p className="text-xs font-black text-stone-800 uppercase tracking-tight">{coffee.name}</p>
                      </div>
                      <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
                        <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 text-stone-400 hover:text-stone-900 transition-colors"><Minus size={14} /></button>
                        <span className="px-3 text-xs font-black text-stone-900">{quantity}</span>
                        <button type="button" onClick={() => setQuantity(Math.min(coffee.stock, quantity + 1))} className="p-1 text-stone-400 hover:text-stone-900 transition-colors"><Plus size={14} /></button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1">Phone Number</label>
                        <input
                          required type="tel" placeholder="+123 456 789"
                          className="w-full bg-white border-stone-100 border-2 rounded-2xl p-4 text-sm font-bold outline-none focus:border-orange-600/30 transition-all shadow-sm"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between px-1">
                          <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest">Delivery Address</label>
                          <button type="button" onClick={fetchCurrentLocation} disabled={locating}
                            className="flex items-center gap-1 text-[9px] font-black text-orange-600 uppercase tracking-widest disabled:opacity-50">
                            {locating ? <><Loader2 size={9} className="animate-spin" />Locating...</> : <><MapPin size={9} />Use GPS</>}
                          </button>
                        </div>
                        <textarea
                          required value={formData.address} placeholder="Street, Floor..."
                          className="w-full bg-white border-stone-100 border-2 rounded-2xl p-4 text-xs font-semibold h-24 resize-none outline-none focus:border-orange-600/30 transition-all shadow-sm"
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1">Note for Barista</label>
                        <input
                          type="text" placeholder="Extra hot, etc..."
                          className="w-full bg-white border-stone-100 border-2 rounded-2xl p-4 text-xs font-medium outline-none focus:border-orange-600/30 shadow-sm"
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        />
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="p-8 pt-4 bg-white border-t border-stone-50 shrink-0">
                  <button
                    form="order-form" type="submit" disabled={loading || locating}
                    className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-between px-10 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-60"
                  >
                    <span>{loading ? "Placing Order..." : "Confirm Order"}</span>
                    <span className="text-orange-400 text-base font-serif italic">${totalPrice.toFixed(2)}</span>
                  </button>
                  <div className="flex justify-center gap-4 mt-5 opacity-30 text-[8px] font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1"><ShieldCheck size={10} /> Secure</span>
                    <span className="flex items-center gap-1"><CreditCard size={10} /> Payment on Delivery</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}