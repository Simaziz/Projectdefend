"use client"
import { useCartStore } from "@/app/store/cartStore"
import { ShoppingBag } from "lucide-react"
import { motion } from "framer-motion"

export default function CartFloat() {
  const { items, openCart, total } = useCartStore() // ✅ add total
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  if (totalItems === 0) return null

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={openCart}
      className="fixed bottom-8 right-8 z-[999] bg-stone-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 hover:bg-black transition-colors"
    >
      <ShoppingBag size={20} />
      <span className="font-black text-sm uppercase tracking-wider">Cart</span>
      <span className="bg-orange-500 text-white text-xs font-black rounded-full w-6 h-6 flex items-center justify-center">
        {totalItems}
      </span>
      {/* ✅ total price */}
      <span className="border-l border-white/20 pl-3 text-orange-400 font-serif italic text-base">
        ${total().toFixed(2)}
      </span>
    </motion.button>
  )
}