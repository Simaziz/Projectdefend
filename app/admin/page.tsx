// app/admin/page.tsx
import { dbConnect } from "@/lib/mongodb";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Setting from "../../models/Settings";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./Admindashboard";

export const dynamic = "force-dynamic";

// Same normalize as in /api/admin/orders/route.ts — keeps both in sync
function normalize(order: any) {
  const status = (order.status ?? "pending").toLowerCase();

  let items = order.items;
  if (!items || items.length === 0) {
    items = [{
      productId: order.productId ?? null,
      name:      order.coffeeName ?? "Unknown",
      image:     order.image ?? "",
      price:     order.price ?? 0,
      quantity:  order.quantity ?? 1,
    }];
  }

  const totalPrice =
    order.totalPrice ??
    order.total ??
    items.reduce((sum: number, i: any) => sum + (i.price ?? 0) * (i.quantity ?? 1), 0);

  const customerName = order.customerName || order.userEmail || "Guest";

  return {
    _id:          order._id,
    userEmail:    order.userEmail,
    customerName,
    items,
    totalPrice,
    address:      order.address ?? "",
    phone:        order.phone ?? "",
    note:         order.note ?? "",
    status,
    createdAt:    order.createdAt,
    updatedAt:    order.updatedAt,
  };
}

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  await dbConnect();

  const [rawProducts, rawOrders, rawSettings] = await Promise.all([
    Product.find({}).sort({ name: 1 }).lean(),
    Order.find({}).sort({ createdAt: -1 }).lean(),
    Setting.findOneAndUpdate(
      {},
      { $setOnInsert: {} },
      { upsert: true, new: true }
    ).lean(),
  ]);

  const products = JSON.parse(JSON.stringify(rawProducts));
  const orders   = JSON.parse(JSON.stringify(rawOrders)).map(normalize);
  const settings = JSON.parse(JSON.stringify(rawSettings));

  return (
    <AdminDashboard
      initialProducts={products}
      initialOrders={orders}
      initialSettings={settings}
    />
  );
}