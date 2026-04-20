'use server';

import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(formData: FormData) {
  await dbConnect();

  const orderId = formData.get("orderId")?.toString();
  const status = formData.get("status")?.toString();

  if (!orderId) throw new Error("Missing orderId");

  try {
    await Order.findByIdAndUpdate(orderId, {
      status: status || "completed",
    });

    // 🔥 IMPORTANT: refresh BOTH dashboards
    revalidatePath("/staff/orders");
    revalidatePath("/admin/order");
    revalidatePath("/admin");

  } catch (err) {
    console.error(err);
    throw new Error("Failed to update order");
  }
}