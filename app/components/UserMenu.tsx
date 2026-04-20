"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

type UserMenuProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    id?: string;
  };
};

export default function UserMenu({ user: propUser }: UserMenuProps = {}) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Use prop if passed (from server component), fallback to client session
  // const user = propUser ?? session?.user;
  const user = session?.user ?? propUser;

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white/20 hover:border-orange-400 transition-all duration-200 bg-white/10 flex items-center justify-center"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt="avatar"
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-base">👤</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-56 rounded-2xl border border-white/10 bg-orange-950/95 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] overflow-hidden z-[300]">
          {/* User info */}
          <div className="px-4 py-3.5 border-b border-white/10">
            {/* <p className="text-sm font-semibold text-white truncate">{user?.name ?? "User"}</p>
            <p className="text-[10px] text-orange-200/40 truncate mt-0.5">{user?.email}</p> */}
            {user?.name && (
  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
)}
<p className="text-[10px] text-orange-200/40 truncate mt-0.5">{user?.email}</p>
          </div>

          {/* Links */}
          <div className="py-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              <span>✏️</span>
              <span>Edit Profile</span>
            </Link>
            <Link
              href="/profile?tab=password"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              <span>🔒</span>
              <span>Change Password</span>
            </Link>
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all duration-150"
            >
              <span>📦</span>
              <span>My Orders</span>
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-white/10 py-1.5">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all duration-150"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}