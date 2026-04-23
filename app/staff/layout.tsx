"use client";

import "../globals.css"; 
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper to highlight active links
  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-[#f6f5f3]">
      {/* --- STAFF SIDEBAR --- */}
      <aside className="w-64 bg-[#1c1917] hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 shadow-2xl">
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">☕</span>
            <div className="flex flex-col">
              <span className="font-serif italic text-white text-xl">Cozy Admin</span>
              <span className="text-[7px] text-orange-500 uppercase tracking-[0.4em] font-black">Staff Portal</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <Link 
            href="/staff/Products" 
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              isActive("/staff/Products") 
                ? "bg-orange-600 text-white shadow-lg shadow-orange-900/20" 
                : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            Manage Products
          </Link>

          <Link 
            href="/staff/orders" 
            className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              isActive("/staff/orders") 
                ? "bg-orange-600 text-white" 
                : "text-white/40 hover:bg-white/5 hover:text-white"
            }`}
          >
            Orders
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
           <Link href="/" className="text-white/20 hover:text-orange-400 text-[10px] uppercase tracking-widest font-bold px-4">
             ← Back to Shop
           </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 lg:pl-64">
        {/* Top Header for mobile or extra actions */}
        <header className="h-16 border-b border-black/5 bg-white/50 backdrop-blur-md flex items-center justify-end px-8 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Staff Mode</span>
              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xs text-orange-700 font-bold">
                 S
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