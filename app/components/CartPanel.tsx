"use client"
import { useCartStore } from "@/app/store/cartStore"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, Minus, Trash2, ShoppingBag, ShieldCheck, CreditCard } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function CartPanel() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, clearCart, total } = useCartStore()
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ address: "", phone: "", note: "" })

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      toast.error("Please login to place an order!")
      setTimeout(() => router.push("/login"), 1500)
      return
    }
    setLoading(true)
    const loadingToast = toast.loading("Sending to kitchen...")
    try {
      // Place one order per item
      await Promise.all(
        items.map((item) =>
          fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              coffeeId: item._id,
              quantity: item.quantity,
              address: formData.address,
              phone: formData.phone,
              note: formData.note,
            }),
          })
        )
      )
      clearCart()
      closeCart()
      toast.success("🎉 Order placed! We're brewing your drinks!", {
        id: loadingToast,
        duration: 4000,
        style: {
          background: "#1c1917",
          color: "#fafaf9",
          borderRadius: "1.25rem",
          fontSize: "14px",
          fontWeight: "700",
          border: "1px solid rgba(234,88,12,0.4)",
        },
        iconTheme: { primary: "#ea580c", secondary: "#fff" },
      })
    } catch {
      toast.error("Order failed.", { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-stone-950/40 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 w-full max-w-md h-full bg-[#fdfcfb] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-10 pb-6 border-b border-stone-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-3xl font-serif italic text-stone-900">Your Cart</h2>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-black mt-1">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
              </div>
              <button onClick={closeCart} className="bg-stone-100 p-3 rounded-2xl text-stone-400 hover:bg-stone-200 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-30">
                  <ShoppingBag size={48} />
                  <p className="text-sm font-black uppercase tracking-widest">Cart is empty</p>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 bg-white rounded-3xl p-3 border border-stone-100">
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-stone-800 truncate">{item.name}</p>
                        <p className="text-orange-600 font-black text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 p-1">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 text-stone-400 hover:text-stone-900 transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-black text-stone-900 min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, Math.min(item.stock, item.quantity + 1))} className="p-1 text-stone-400 hover:text-stone-900 transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item._id)} className="p-2 text-stone-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Delivery Form */}
                  <form id="cart-form" onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-stone-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Delivery Details</p>
                    <input
                      required
                      type="tel"
                      placeholder="Phone number"
                      className="w-full bg-white border-2 border-stone-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-orange-600/30 transition-all"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <textarea
                      required
                      placeholder="Delivery address"
                      className="w-full bg-white border-2 border-stone-100 rounded-2xl p-4 text-xs font-semibold h-20 resize-none outline-none focus:border-orange-600/30 transition-all"
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Note for barista (optional)"
                      className="w-full bg-white border-2 border-stone-100 rounded-2xl p-4 text-xs outline-none focus:border-orange-600/30 transition-all"
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                  </form>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 pt-4 border-t border-stone-100 shrink-0 bg-white">
                <button
                  form="cart-form"
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-between px-10 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <span>Confirm Order</span>
                  <span className="text-orange-400 text-base font-serif italic">${total().toFixed(2)}</span>
                </button>
                <div className="flex justify-center gap-4 mt-4 opacity-30 text-[8px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1"><ShieldCheck size={10} /> Secure</span>
                  <span className="flex items-center gap-1"><CreditCard size={10} /> Payment on Delivery</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}