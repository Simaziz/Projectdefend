'use server';

import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import cloudinary from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─── ADD COFFEE ────────────────────────────────────────────────────────────────
export async function addCoffee(prevState: any, formData: FormData) {
  await dbConnect();

  const name      = formData.get("name") as string;
  const price     = parseFloat(formData.get("price") as string);
  const stock     = Number(formData.get("stock"));
  const discount  = Number(formData.get("discount")) || 0;
  const isTopDrink = formData.get("isTopDrink") === "on";

  if (!name)  return { error: "Drink name is required." };
  if (!price) return { error: "Price is required." };

  const file = formData.get("image") as File;
  if (!file || file.size === 0) return { error: "Please upload an image." };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "cozy-cup", transformation: [{ width: 600, height: 600, crop: "fill" }] },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(buffer);
    });

    await Product.create({
      name,
      price,
      stock,
      discount,
      isTopDrink,
      image: uploadResponse.secure_url,
    });

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/products");

    return { success: true, error: null };

  } catch (error) {
    console.error("Add Error:", error);
    return { success: false, error: "Failed to add product. Please try again." };
  }
}

// ─── UPDATE COFFEE ─────────────────────────────────────────────────────────────
export async function updateCoffee(prevState: any, formData: FormData) {
  await dbConnect();

  const id        = formData.get("id") as string;
  const name      = formData.get("name") as string;
  const rawPrice  = parseFloat(formData.get("price") as string);
  const price     = Math.round(rawPrice * 100) / 100;
  const stock     = Number(formData.get("stock"));
  const discount  = Number(formData.get("discount")) || 0;
  const isTopDrink = formData.get("isTopDrink") === "on";
  const file      = formData.get("image") as File;
  let   imageUrl  = formData.get("existingImage") as string;

  if (!id)   return { error: "Product ID is missing." };
  if (!name) return { error: "Drink name is required." };

  try {
    // Only upload a new image if a new file was selected
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResponse: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "cozy-cup", transformation: [{ width: 600, height: 600, crop: "fill" }] },
          (error, result) => (error ? reject(error) : resolve(result))
        ).end(buffer);
      });

      imageUrl = uploadResponse.secure_url;
    }

    await Product.findByIdAndUpdate(id, {
      name,
      price,
      stock,
      discount,
      isTopDrink,
      image: imageUrl,
    });

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/products");

    return { success: true, error: null };

  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update product." };
  }
}

// ─── DELETE COFFEE ─────────────────────────────────────────────────────────────
export async function deleteCoffee(formData: FormData): Promise<{ success: boolean; error?: string }> {
  await dbConnect();

  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "Product ID is missing." };

  try {
    await Product.findByIdAndDelete(id);

    revalidatePath("/");
    revalidatePath("/menu");
    revalidatePath("/admin");
    revalidatePath("/admin/products");

    return { success: true };

  } catch (error) {
    console.error("Delete Error:", error);
    return { success: false, error: "Failed to delete product." };
  }
}

// ─── UPDATE ORDER STATUS ───────────────────────────────────────────────────────
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const orderId  = formData.get("orderId");
  const newStatus = formData.get("status") || "completed";

  if (!orderId) return;

  try {
    await dbConnect();

    await Order.findByIdAndUpdate(orderId, { status: newStatus });

    revalidatePath("/admin/order");
    revalidatePath("/admin");
    revalidatePath("/order");

  } catch (error) {
    console.error("Failed to update order:", error);
    throw new Error("Update failed.");
  }
}