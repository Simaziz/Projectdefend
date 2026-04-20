"use client";

import { useEffect, useState } from "react";
import { updateOrderStatus } from "../../actions/orders";

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

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => setOrders(data));
  }, []);

  return (
    <main className="min-h-screen bg-[#fdfcfb] pb-20">

      {/* 🔥 PREMIUM HEADER */}
      <div className="bg-[#1c1917] pt-16 pb-32 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-end">
          <div>
            <p className="text-orange-500 text-xs tracking-[0.3em] uppercase mb-2">
              Live Operations
            </p>
            <h1 className="text-5xl font-serif italic text-white">
              Order Dispatch
            </h1>
          </div>

          <div className="bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl border border-white/10">
            <p className="text-white/50 text-xs">Queue</p>
            <p className="text-2xl text-white font-serif">
              {orders.length}
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 FLOATING CARDS */}
      <div className="max-w-6xl mx-auto px-6 -mt-24 space-y-6">

        {orders.map(order => (
          <OrderCard key={order._id} order={order} />
        ))}

        {orders.length === 0 && (
          <div className="bg-white rounded-3xl p-16 text-center border">
            <p className="text-gray-400 italic">
              No orders yet...
            </p>
          </div>
        )}

      </div>

    </main>
  );
}

// ================= CARD =================

function OrderCard({ order }: { order: Order }) {
  const isDone = order.status === "completed";

  return (
    <div className={`rounded-3xl p-6 transition-all border ${
      isDone 
        ? "bg-gray-50 border-gray-100 opacity-70"
        : "bg-white border-gray-200 shadow-xl hover:shadow-2xl"
    }`}>

      {/* TOP */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="font-bold text-gray-900">{order.userEmail}</p>
          <p className="text-xs text-gray-400">
            {order.phone || "No phone"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Status status={order.status} />

          {!isDone && (
            <form action={updateOrderStatus}>
              <input type="hidden" name="orderId" value={order._id} />
              <input type="hidden" name="status" value="completed" />

              <button className="bg-black text-white px-6 py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-gray-900 transition">
                Complete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* PRODUCT */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="font-semibold text-gray-800">
            {order.coffeeName}
          </p>
          <p className="text-xs text-gray-400">
            Qty: {order.quantity}
          </p>
        </div>

        <p className="font-bold text-lg">
          ${order.totalPrice}
        </p>
      </div>

      {/* ADDRESS */}
      <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 mb-3">
        {order.address || "Pickup"}
      </div>

      {/* NOTE */}
      {order.note && (
        <div className="bg-orange-50 p-4 rounded-xl text-sm text-gray-700">
          “{order.note}”
        </div>
      )}

    </div>
  );
}

// ================= STATUS =================

function Status({ status }: { status: string }) {
  const isDone = status === "completed";

  return (
    <span className={`px-4 py-1 rounded-full text-xs font-bold ${
      isDone 
        ? "bg-green-100 text-green-600"
        : "bg-orange-100 text-orange-600"
    }`}>
      {isDone ? "Completed" : "Pending"}
    </span>
  );
}