"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MenuLink from "./MenuLink";

export default function AdminLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");

  if (isAdmin && isAdminPage) {
    // On admin pages: show only Dashboard link
    return (
      <div className="hidden md:flex items-center gap-8 border-l border-white/10 pl-8">
        <Link
          href="/admin"
          className="relative group text-[10px] font-black uppercase tracking-[0.2em] text-orange-200"
        >
          Dashboard
          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-orange-200 transition-all duration-300 group-hover:w-full" />
        </Link>
      </div>
    );
  }

  // On normal pages: show regular menu + admin links if admin
  return (
    <>
      <MenuLink />
      {isAdmin && (
        <div className="hidden md:flex items-center gap-8 border-l border-white/10 pl-8">
          <Link
            href="/admin/products"
            className="relative group text-[10px] font-black uppercase tracking-[0.2em] text-orange-200"
          >
            Inventory
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-orange-200 transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link
            href="/admin"
            className="relative group text-[10px] font-black uppercase tracking-[0.2em] text-orange-200"
          >
            Orders
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-orange-200 transition-all duration-300 group-hover:w-full" />
          </Link>
        </div>
      )}
    </>
  );
}