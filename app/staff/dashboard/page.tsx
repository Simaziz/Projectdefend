// app/staff/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StaffDashboard() {
  const session = await auth();
  if (!session || session.user?.role !== "staff") redirect("/login");

  const name = session.user?.name || "Staff";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen px-6 py-8" style={{
      background: "linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a0800 70%, #0d0400 100%)"
    }}>

      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center text-lg">
            ☕
          </div>
          <div>
            <p className="text-white font-medium">Cozy Cup</p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-orange-200/40">Staff Portal</p>
          </div>
        </div>
        {/* <form action="/api/auth/signout" method="POST">
          <button className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-white/60 text-xs uppercase tracking-widest">
            Sign out
          </button>
        </form> */}
      </div>

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-3xl font-medium text-white">{greeting}, {name}</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-orange-200/40 mt-1">
          Staff Dashboard · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Nav cards — links to your existing pages */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link href="/staff/orders"
          className="block bg-white/4 border border-white/8 rounded-2xl p-6 hover:bg-white/8 hover:border-orange-500/40 transition-all duration-200">
          <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-xl mb-4">
            🧾
          </div>
          <p className="text-white font-medium mb-1">Orders</p>
          <p className="text-xs text-white/35">View and manage incoming orders</p>
          <p className="text-orange-500/60 mt-4 text-lg">→</p>
        </Link>

        <Link href="/staff/Products"
          className="block bg-white/4 border border-white/8 rounded-2xl p-6 hover:bg-white/8 hover:border-orange-500/40 transition-all duration-200">
          <div className="w-11 h-11 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-xl mb-4">
            ☕
          </div>
          <p className="text-white font-medium mb-1">Products</p>
          <p className="text-xs text-white/35">Browse and update menu items</p>
          <p className="text-orange-500/60 mt-4 text-lg">→</p>
        </Link>
      </div>
    </div>
  );
}