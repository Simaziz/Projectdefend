import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["admin", "staff"].includes(role)) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-[#fcfaf8]">
      <nav className="bg-orange-500 text-white px-6 py-3 flex gap-6">
        <a href="/staff" className="font-bold">Staff Panel</a>
        <a href="/staff/orders">Orders</a>
        <a href="/staff/menu">Menu</a>
        <a href="/staff/analytics">Analytics</a>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}