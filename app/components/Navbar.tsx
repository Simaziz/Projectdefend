import Link from "next/link";
import { auth } from "@/auth";
import UserMenu from "./UserMenu";
import MenuLink from "./MenuLink"; // ✅ import it

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-[100] transition-all duration-300 backdrop-blur-xl bg-orange-950/80 text-white border-b border-white/10 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex justify-between items-center">
        
        {/* Brand */}
        <Link href="/" className="relative flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-orange-600 transition-all duration-500 group-hover:rotate-[10deg]">
            <span className="text-xl">☕</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif italic text-xl md:text-2xl tracking-tighter leading-none">Cozy Cup</span>
            <span className="text-[8px] uppercase tracking-[0.4em] opacity-50 font-black">Est. 2026</span>
          </div>
        </Link>

        <div className="flex gap-6 md:gap-10 items-center">

          {/* ✅ Replace the old pathname block with this */}
          <MenuLink />

          {session?.user?.role === "admin" && (
            <div className="hidden md:flex items-center gap-8 border-l border-white/10 pl-8">
              <Link href="/admin/products" className="relative group text-[10px] font-black uppercase tracking-[0.2em] text-orange-200">
                Inventory
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-orange-200 transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="/admin" className="relative group text-[10px] font-black uppercase tracking-[0.2em] text-orange-200">
                Orders
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-orange-200 transition-all duration-300 group-hover:w-full" />
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4">
            {session ? (
              <div className="pl-4 border-l border-white/10">
                <UserMenu user={session.user} />
              </div>
            ) : (
              <Link href="/login" className="relative overflow-hidden bg-white text-stone-950 px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-xl active:scale-95">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}