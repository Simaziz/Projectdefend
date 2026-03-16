"use client"
import { useCartStore } from "@/app/store/cartStore"
import { ShoppingBag, Check } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"

export default function AddToCartButton({ coffee }: { coffee: any }) {
  const { addItem, openCart, items } = useCartStore()
  const [added, setAdded] = useState(false)
  const inCart = items.find((i) => i._id === coffee._id)

  const handleAdd = () => {
    if (coffee.stock <= 0) return
    addItem({
      _id: coffee._id,
      name: coffee.name,
      price: coffee.price,
      image: coffee.image || "/images/coffee-placeholder.jpg",
      stock: coffee.stock,
    })
    setAdded(true)
    toast.success(`${coffee.name} added!`, {
      style: {
        background: "#1c1917",
        color: "#fafaf9",
        borderRadius: "1.25rem",
        fontSize: "13px",
        fontWeight: "700",
        border: "1px solid rgba(234,88,12,0.4)",
      },
      iconTheme: { primary: "#ea580c", secondary: "#fff" },
    })
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      disabled={coffee.stock <= 0}
      className={`
        w-full py-2 sm:py-4 px-3 sm:px-6 rounded-2xl font-black uppercase
        text-[9px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.25em]
        text-white transition-all duration-300 shadow-lg active:scale-95
        disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed
        ${added ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-600 hover:bg-orange-700"}
      `}
    >
      {coffee.stock <= 0 ? (
        "Out of Stock"
      ) : added ? (
        <span className="flex items-center justify-center gap-1">
          <Check size={12} /> Added
        </span>
      ) : (
        <span className="flex items-center justify-center gap-1">
          <ShoppingBag size={12} />
          {inCart ? `In Cart (${inCart.quantity})` : "Add to Cart"}
        </span>
      )}
    </button>
  )
}