// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/auth";
import Pusher from "pusher";

export const dynamic = "force-dynamic";

const pusher = new Pusher({
  appId:   process.env.PUSHER_APP_ID!,
  key:     process.env.PUSHER_KEY!,
  secret:  process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS:  true,
});

// ─── Normalize for GET ─────────────────────────────────────────────────────────
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

  return {
    _id:          order._id,
    userEmail:    order.userEmail,
    customerName: order.customerName || order.userEmail || "Guest",
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

// ─── GET — fetch all orders for admin dashboard ────────────────────────────────
export async function GET() {
  try {
    await dbConnect();
    const raw    = await Order.find({}).sort({ createdAt: -1 }).lean();
    const orders = JSON.parse(JSON.stringify(raw)).map(normalize);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// ─── POST — create a new order ─────────────────────────────────────────────────
export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await req.json();
    const { items, address, phone, note, customerName } = data;

    let orderItems: any[] = [];

    if (items && Array.isArray(items) && items.length > 0) {
      // ── New format: items[] array ───────────────────────────────────────────
      for (const item of items) {
        const { coffeeId, quantity = 1 } = item;

        const product = await Product.findOneAndUpdate(
          { _id: coffeeId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true }
        );

        if (!product) {
          return NextResponse.json(
            { error: `"${coffeeId}" is out of stock or not found` },
            { status: 400 }
          );
        }

        orderItems.push({
          productId: product._id,
          name:      product.name,
          image:     product.image ?? "",
          price:     product.price,
          quantity,
        });
      }
    } else if (data.coffeeId) {
      // ── Old format: single coffeeId (backwards compat) ─────────────────────
      const { coffeeId, quantity = 1 } = data;

      const product = await Product.findOneAndUpdate(
        { _id: coffeeId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!product) {
        return NextResponse.json(
          { error: "Product not found or insufficient stock" },
          { status: 400 }
        );
      }

      orderItems.push({
        productId: product._id,
        name:      product.name,
        image:     product.image ?? "",
        price:     product.price,
        quantity,
      });
    } else {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    const totalPrice = orderItems.reduce(
      (sum, i) => sum + i.price * i.quantity, 0
    );

    const newOrder = await Order.create({
      userEmail:    session.user.email,
      customerName: customerName || session.user.name || "Guest",
      items:        orderItems,
      totalPrice,
      address:      address ?? "",
      phone:        phone ?? "",
      note:         note ?? "",
      status:       "pending",
    });

    // ── Pusher real-time alert to admin ────────────────────────────────────────
    try {
      await pusher.trigger("admin-orders", "new-order", {
        orderId:   String(newOrder._id),
        customer:  customerName || session.user.name || session.user.email,
        itemCount: orderItems.length,
        items:     orderItems.map((i) => `${i.quantity}× ${i.name}`).join(", "),
        total:     totalPrice.toFixed(2),
      });
    } catch (pusherErr) {
      // Order still saved — Pusher failure is non-fatal
      console.warn("Pusher trigger failed:", pusherErr);
    }

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error("POST order error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}