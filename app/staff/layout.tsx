"use client";

import "../globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => pathname === path;

  const name = session?.user?.name ?? "Staff";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex min-h-screen bg-[#f6f5f3]">
      {/* --- STAFF SIDEBAR --- */}
      <aside className="w-64 bg-[#1c1917] hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div className="flex flex-col">
              <span className="font-serif italic text-white text-xl">Cozy Cup</span>
              <span className="text-[7px] text-orange-500 uppercase tracking-[0.4em] font-black">Staff Portal</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">

          {/* ✅ Dashboard link — goes to your StaffHomePage */}
          <Link
            href="/staff"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              isActive("/staff")
                ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-base">🏠</span>
            Profile
          </Link>

          <Link
            href="/staff/Products"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              isActive("/staff/Products")
                ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-base">☕</span>
            Manage Products
          </Link>

          <Link
            href="/staff/orders"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              isActive("/staff/orders")
                ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20"
                : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-base">🧾</span>
            Orders
          </Link>
        </nav>

        {/* ✅ Staff info + sign out at bottom */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-xs text-orange-300 font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-white/80 text-xs font-bold truncate">{name}</p>
              <p className="text-white/25 text-[10px] truncate">{session?.user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left text-white/20 hover:text-red-400 text-[10px] uppercase tracking-widest font-bold px-4 py-1 transition-colors"
          >
            ← Sign Out
          </button>

          <Link href="/" className="block text-white/20 hover:text-orange-400 text-[10px] uppercase tracking-widest font-bold px-4 transition-colors">
            ← Back to Shop
          </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 lg:pl-64">
        <header className="h-16 border-b border-black/5 bg-white/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            {pathname === "/staff" && "Dashboard"}
            {pathname === "/staff/Products" && "Manage Products"}
            {pathname === "/staff/orders" && "Orders"}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Staff Mode</span>
            <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xs text-orange-700 font-bold">
              {initials}
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}