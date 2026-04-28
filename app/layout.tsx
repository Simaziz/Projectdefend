"use client";

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

  const isStaffPage = pathname.startsWith("/staff");
  const isAdminPage = pathname.startsWith("/admin");
  const hideUserUI = isStaffPage || isAdminPage;

  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className="antialiased bg-white text-stone-900">
        <Providers>
          {!hideUserUI && <Navbar />}

          <main className="min-h-screen bg-white">
            {children}

            {!hideUserUI && (
              <>
                <CartPanel />
                <CartFloat />
              </>
            )}
          </main>
        </Providers>
      </body>
    </html>
  );
}