"use client"; // Required to use usePathname

import { usePathname } from "next/navigation";
import { Providers } from "../app/components/Providers";
import Navbar from "../app/components/Navbar"; 
import "./globals.css";
import CartPanel from "./components/CartPanel";
import CartFloat from "./components/CartFloat";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Define which paths should NOT show the user-facing UI
  // This will hide them for /staff, /staff/Products, etc.
  const isStaffPage = pathname.startsWith("/staff");

  return (
    <html lang="en" className="light" style={{ colorScheme: 'light' }}>
      <body className="antialiased bg-white text-stone-900">
        <Providers>
          {/* Only show User UI if we are NOT on a staff page */}
          {!isStaffPage && <Navbar />}
          
          <main className="min-h-screen bg-white">
            {children}

            {/* Only show Cart UI if we are NOT on a staff page */}
            {!isStaffPage && (
              <>
                <CartPanel />   {/* ✅ slide-over panel */}
                <CartFloat />   {/* ✅ floating button */}
              </>
            )}
          </main>
        </Providers>
      </body>
    </html>
  );
}