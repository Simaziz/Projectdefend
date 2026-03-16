import { create } from "zustand"

export type CartItem = {
  _id: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  addItem: (item) => {
    const existing = get().items.find((i) => i._id === item._id)
    if (existing) {
      set({
        items: get().items.map((i) =>
          i._id === item._id
            ? { ...i, quantity: Math.min(i.stock, i.quantity + 1) }
            : i
        ),
      })
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] })
    }
  },
  removeItem: (id) => set({ items: get().items.filter((i) => i._id !== id) }),
  updateQuantity: (id, quantity) => {
    if (quantity < 1) return get().removeItem(id)
    set({
      items: get().items.map((i) =>
        i._id === id ? { ...i, quantity } : i
      ),
    })
  },
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))