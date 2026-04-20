"use client";

import { motion, Variants } from "framer-motion";
import { updateOrderStatus } from "../../admin/actions";
import { Phone, MapPin, Coffee, CheckCircle2, Clock, User } from "lucide-react";

interface OrderClientWrapperProps {
  initialOrders: any[];
}

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const card: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function OrderClientWrapper({ initialOrders }: OrderClientWrapperProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {initialOrders.map((order) => (
        <motion.div key={order._id.toString()} variants={card}>
          <OrderCard order={order} />
        </motion.div>
      ))}

      {initialOrders.length === 0 && (
        <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-stone-200">
          <p className="text-stone-400 italic">No orders in queue</p>
        </div>
      )}
    </motion.div>
  );
}

/* ================= CARD ================= */

function OrderCard({ order }: { order: any }) {
  const isDone = order.status === "completed";

  return (
    <div
      className={`relative rounded-3xl p-7 transition-all border
      ${
        isDone
          ? "bg-stone-50 border-stone-100 opacity-70"
          : "bg-white border-stone-200 shadow-sm hover:shadow-xl"
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

            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <Phone size={12} />
              {order.phone || "No contact"}
            </div>
          </div>
        </div>

        {/* COFFEE */}
        <div className="flex items-center gap-3">
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
            <p className="text-[11px] text-stone-400">
              ${order.totalPrice}
            </p>
          </div>
        </div>

        {/* ACTION */}
        <div className="flex items-center gap-3">
          <Status status={order.status} />

          {!isDone && (
            <form action={updateOrderStatus}>
              <input type="hidden" name="orderId" value={order._id} />
              <input type="hidden" name="status" value="completed" />

              <button className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black active:scale-95 transition">
                Complete
              </button>
            </form>
          )}
        </div>
      </div>

      {/* BOTTOM INFO */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ADDRESS */}
        <div className="flex items-start gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
          <MapPin size={14} className="text-orange-500 mt-1" />
          <div>
            <p className="text-[10px] font-bold uppercase text-stone-400">
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
              <p className="text-[10px] font-bold uppercase text-orange-400">
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
}

/* ================= STATUS ================= */

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
      {isDone ? "Done" : "Pending"}
    </div>
  );
}