"use client";

import { useEffect, useState } from "react";
import { updateOrderStatus } from "../../actions/orders";
import {
  Coffee,
  Phone,
  MapPin,
  User,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface Order {
  _id: string;
  userEmail: string;
  phone: string;
  address: string;
  coffeeName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  note?: string;
}

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  const completeOrder = async (orderId: string) => {
    setLoadingId(orderId);

    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("status", "completed");

      await updateOrderStatus(formData);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "completed" } : o
        )
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f5f3] pb-20">

      {/* HEADER */}
      <div className="bg-[#1c1917] pt-16 pb-28 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-orange-400 text-xs tracking-[0.3em] uppercase mb-2">
              Staff Dashboard
            </p>
            <h1 className="text-5xl font-serif italic text-white">
              Order Queue
            </h1>
          </div>

          <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
            <p className="text-white/50 text-xs">Total Orders</p>
            <p className="text-3xl text-white font-serif">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto px-6 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {orders.map((order) => {
            const isDone = order.status === "completed";

            return (
              <div
                key={order._id}
                className={`rounded-3xl p-6 border transition-all duration-300 hover:-translate-y-1
                ${
                  isDone
                    ? "bg-white/70 border-stone-200 opacity-70"
                    : "bg-white border-stone-200 shadow-lg hover:shadow-2xl"
                }`}
              >

                {/* TOP USER */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center">
                      <User size={16} className="text-stone-500" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-stone-900">
                        {order.userEmail}
                      </p>
                      <p className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Phone size={10} />
                        {order.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  <Status status={order.status} />
                </div>

                {/* COFFEE */}
                <div className="flex items-center justify-between bg-orange-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Coffee className="text-orange-600" />
                    <div>
                      <p className="font-bold text-stone-800 text-sm">
                        {order.coffeeName}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Qty: {order.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="font-bold text-stone-900">
                    ${order.totalPrice}
                  </p>
                </div>

                {/* ADDRESS */}
                <div className="flex items-start gap-2 text-sm text-stone-600 mb-3">
                  <MapPin size={14} className="text-orange-500 mt-1" />
                  <p>{order.address || "Pickup"}</p>
                </div>

                {/* NOTE */}
                {order.note && (
                  <div className="bg-stone-50 p-3 rounded-xl text-xs text-stone-600 mb-4 italic">
                    “{order.note}”
                  </div>
                )}

                {/* BUTTON */}
                {!isDone && (
                  <button
                    onClick={() => completeOrder(order._id)}
                    disabled={loadingId === order._id}
                    className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition active:scale-95 disabled:opacity-50"
                  >
                    {loadingId === order._id ? "Processing..." : "Complete Order"}
                  </button>
                )}
              </div>
            );
          })}

        </div>

        {/* EMPTY */}
        {orders.length === 0 && (
          <div className="text-center mt-20 text-stone-400 italic">
            No orders yet...
          </div>
        )}
      </div>
    </main>
  );
}

/* STATUS BADGE */
function Status({ status }: { status: string }) {
  const isDone = status === "completed";

  return (
    <div
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1
      ${
        isDone
          ? "bg-emerald-50 text-emerald-600"
          : "bg-amber-50 text-amber-600"
      }`}
    >
      {isDone ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      {isDone ? "Done" : "Pending"}
    </div>
  );
}