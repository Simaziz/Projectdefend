// app/api/order/route.ts
import { dbConnect } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// POST — create one order containing ALL items the customer selected
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await req.json();

    // Expected body:
    // {
    //   items: [{ coffeeId: "...", quantity: 2 }, { coffeeId: "...", quantity: 1 }],
    //   address: "123 Street",
    //   phone: "081-234-5678",
    //   note: "Less ice please",
    //   customerName: "John"   ← from session or form
    // }
    const { items, address, phone, note, customerName } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    // ── Process each item: check stock + deduct ───────────────────────────────
    const orderItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const { coffeeId, quantity = 1 } = item;

      // Find product and deduct stock atomically (prevents overselling)
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

      const itemTotal = product.price * quantity;
      totalPrice += itemTotal;

      orderItems.push({
        productId: product._id,
        name:      product.name,
        image:     product.image,
        price:     product.price,   // unit price at time of purchase
        quantity,
      });
    }

    // ── Create ONE order with all items ───────────────────────────────────────
    const newOrder = await Order.create({
      userEmail:    session.user.email,
      customerName: customerName || session.user.name || "Guest",
      items:        orderItems,      // array of all products
      totalPrice,                    // grand total
      address,
      phone,
      note: note || "",
      status: "pending",
    });

    // ── Pusher: notify admin dashboard in real-time ───────────────────────────
    await pusher.trigger("admin-orders", "new-order", {
      orderId:      newOrder._id,
      customer:     customerName || session.user.name || session.user.email,
      itemCount:    orderItems.length,
      items:        orderItems.map((i) => `${i.quantity}× ${i.name}`).join(", "),
      total:        totalPrice.toFixed(2),
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error) {
    console.error("ORDER CREATION ERROR:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}