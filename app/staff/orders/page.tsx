"use client";

import { useEffect, useState } from "react";
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

  // FETCH ORDERS
  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data));
  }, []);

  // COMPLETE ORDER (FIXED - NO SERVER ACTION BUG)
  const completeOrder = async (orderId: string) => {
    setLoadingId(orderId);

    try {
      const res = await fetch("/api/orders/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: "completed",
        }),
      });

      if (res.ok) {
        // instant UI update
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: "completed" } : o
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#fdfcfb] pb-20">

      {/* HEADER */}
      <div className="bg-[#1c1917] pt-16 pb-28 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-orange-400 text-xs tracking-[0.3em] uppercase mb-2">
              Staff Panel
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

      {/* ORDERS */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 space-y-6">

        {orders.map((order) => {
          const isDone = order.status === "completed";

          return (
            <div
              key={order._id}
              className={`rounded-[2.2rem] p-7 border transition-all
              ${
                isDone
                  ? "bg-stone-50 border-stone-100 opacity-70"
                  : "bg-white border-stone-200 shadow-lg hover:shadow-xl"
              }`}
            >

              {/* TOP ROW */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                {/* USER */}
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-stone-100 flex items-center justify-center">
                    <User size={18} className="text-stone-500" />
                  </div>

                  <div>
                    <p className="font-bold text-stone-900 text-sm">
                      {order.userEmail}
                    </p>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Phone size={12} />
                      {order.phone || "No phone"}
                    </p>
                  </div>
                </div>

                {/* COFFEE */}
                <div className="flex items-center gap-4">
                  <div className="relative p-3 rounded-2xl bg-orange-50 text-orange-600">
                    <Coffee size={18} />
                    <span className="absolute -top-2 -right-2 w-5 h-5 text-[10px] bg-stone-900 text-white rounded-full flex items-center justify-center">
                      {order.quantity}
                    </span>
                  </div>

                  <div>
                    <p className="font-bold text-stone-800 text-sm">
                      {order.coffeeName}
                    </p>
                    <p className="text-xs text-stone-400">
                      ${order.totalPrice}
                    </p>
                  </div>
                </div>

                {/* ACTION */}
                <div className="flex items-center gap-3">
                  <Status status={order.status} />

                  {!isDone && (
                    <button
                      onClick={() => completeOrder(order._id)}
                      disabled={loadingId === order._id}
                      className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black active:scale-95 transition disabled:opacity-50"
                    >
                      {loadingId === order._id ? "..." : "Complete"}
                    </button>
                  )}
                </div>
              </div>

              {/* BOTTOM */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* ADDRESS */}
                <div className="flex items-start gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <MapPin size={14} className="text-orange-500 mt-1" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-400">
                      Address
                    </p>
                    <p className="text-sm text-stone-700">
                      {order.address || "Pickup"}
                    </p>
                  </div>
                </div>

                {/* NOTE */}
                {order.note && (
                  <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <Clock size={14} className="text-orange-500 mt-1" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-orange-400">
                        Note
                      </p>
                      <p className="text-sm text-stone-800 italic">
                        “{order.note}”
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center border">
            <p className="text-gray-400 italic">No orders yet...</p>
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
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border
      ${
        isDone
          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
          : "bg-amber-50 text-amber-600 border-amber-100"
      }`}
    >
      {isDone ? (
        <CheckCircle2 size={12} />
      ) : (
        <Clock size={12} className="animate-pulse" />
      )}
      {isDone ? "Completed" : "Pending"}
    </div>
  );
}