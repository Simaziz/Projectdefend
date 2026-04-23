"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import CartPanel from "./CartPanel";
import CartFloat from "./CartFloat";

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffPage = pathname.startsWith("/staff");

  return (
    <>
      {!isStaffPage && <Navbar />}
      <main className="min-h-screen bg-white">
        {children}
        {!isStaffPage && (
          <>
            <CartPanel />
            <CartFloat />
          </>
        )}
      </main>
    </>
  );
}