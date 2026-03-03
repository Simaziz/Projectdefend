"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Loader2, X, Plus, Minus, Coffee, ShieldCheck, CreditCard, MessageSquareQuote } from "lucide-react";

export default function OrderButton({ coffee }: { coffee: any }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({ address: "", phone: "", note: "" });

  const totalPrice = coffee.price * quantity;

  // --- 1. THE MISSING FUNCTION DEFINITION ---
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
          toast.success("Location synced!");
        } catch (err) {
          toast.error("GPS active, but address failed.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("Location access denied.");
      },
      { enableHighAccuracy: true }
    );
  };

  // --- 2. SMOOTH WINDOWS FIX (Lock Scroll) ---
  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = "hidden"; // Prevents window twitching
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showForm]);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Sending to kitchen...");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          coffeeId: coffee._id,
          address: formData.address,
          phone: formData.phone,
          note: formData.note,
          quantity 
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Brewing started!", { id: loadingToast });
      setShowForm(false);
      setQuantity(1);
    } catch (error) {
      toast.error("Order failed.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <button
        onClick={() => setShowForm(true)}
        disabled={coffee.stock <= 0}
        className="w-full py-4 bg-orange-600 p-[2px] shadow-lg text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-orange-700 active:scale-95 disabled:bg-stone-200 transition-all shadow-xl"
      >
        {coffee.stock <= 0 ? "Out of Stock" : "Place Order"}
      </button> */}
 <button
  onClick={() => setShowForm(true)}
  disabled={coffee.stock <= 0}
  className="
    w-full
    py-4 px-6
    rounded-2xl
    font-black uppercase
    text-[11px] tracking-[0.25em]
    text-white
    bg-orange-600
    hover:bg-orange-700
    active:scale-95
    transition-all duration-200
    shadow-lg
    disabled:bg-stone-300
    disabled:text-stone-500
    disabled:shadow-none
    disabled:cursor-not-allowed
  "
>
  {coffee.stock <= 0 ? "Out of Stock" : "Place Order"}
</button>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-stone-950/40 backdrop-blur-md" 
            />

            <motion.div 
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
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

              {/* Scrollable Form Body */} 
              <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
                <form id="order-form" onSubmit={handleOrder} className="space-y-6">
                  {/* Summary Card */}
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

                  {/* Form Inputs */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1">Phone Number</label>
                      <input required type="tel" placeholder="+123 456 789" className="w-full bg-white border-stone-100 border-2 rounded-2xl p-4 text-sm font-bold outline-none focus:border-orange-600/30 transition-all shadow-sm" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between px-1">
                        <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest">Delivery Address</label>
                        <button type="button" onClick={fetchCurrentLocation} className="text-[9px] font-black text-orange-600 uppercase tracking-widest">{locating ? "..." : "Use GPS"}</button>
                      </div>
                      <textarea required value={formData.address} placeholder="Street, Floor..." className="w-full bg-white border-stone-100 border-2 rounded-2xl p-4 text-xs font-semibold h-24 resize-none outline-none focus:border-orange-600/30 transition-all shadow-sm" onChange={(e) => setFormData({...formData, address: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-stone-400 tracking-widest ml-1">Note for Barista</label>
                      <input type="text" placeholder="Extra hot, etc..." className="w-full bg-white border-stone-100 border-2 rounded-2xl p-4 text-xs font-medium outline-none focus:border-orange-600/30 shadow-sm" onChange={(e) => setFormData({...formData, note: e.target.value})} />
                    </div>
                  </div>
                </form>
              </div>

              {/* Fixed Bottom Footer */}
              <div className="p-8 pt-4 bg-white border-t border-stone-50 shrink-0">
                <button 
                  form="order-form"
                  type="submit"
                  disabled={loading || locating}
                  className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-between px-10 hover:bg-black transition-all active:scale-[0.98]"
                >
                  <span>Confirm Order</span>
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
      </AnimatePresence>
    </>
  );
}