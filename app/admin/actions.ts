'use server';

import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import cloudinary from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// --- ADD COFFEE ACTION ---
export async function addCoffee(prevState: any, formData: FormData) {
  await dbConnect();

  const name = formData.get("name") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = Number(formData.get("stock"));
  const discount = Number(formData.get("discount")) || 0; // read discount
  const isTopDrink = formData.get("isTopDrink") === "on" ? true : false; //  read checkbox

  // Upload image...
  const file = formData.get("image") as File;
  if (!file) return { error: "Please upload image" };
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadResponse: any = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "cozy-cup" },
      (error, result) => (error ? reject(error) : resolve(result))
    ).end(buffer);
  });

  await Product.create({
    name,
    price,
    stock,
    discount,       // 🔥 save discount
    isTopDrink,     // 🔥 save top drink
    image: uploadResponse.secure_url,
  });
  revalidatePath("/");
  revalidatePath("/menu");
  
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  redirect("/admin/products");
}
// --- DELETE COFFEE ACTION ---
export async function deleteCoffee(formData: FormData): Promise<void> {
  await dbConnect();
  const id = formData.get('id');

  try {
    await Product.findByIdAndDelete(id);
    
    revalidatePath('/menu');
    revalidatePath('/admin/products');
    revalidatePath('/admin');
  } catch (error) {
    console.error("Delete Error:", error);
  }
}

// --- UPDATE COFFEE ACTION (FIXED FOR useActionState) ---
export async function updateCoffee(prevState: any, formData: FormData) {
  await dbConnect();
  
  const id = formData.get('id');
  const name = formData.get('name');
  
  // parseFloat ensures decimal support for updates
  const rawPrice = parseFloat(formData.get('price') as string);
  const formattedPrice = Math.round(rawPrice * 100) / 100; 
  
  const stock = Number(formData.get('stock'));
  const file = formData.get('image') as File;

  let imageUrl = formData.get('existingImage') as string;

  try {
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadResponse: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'cozy-cup', transformation: [{ width: 600, height: 600, crop: 'fill' }] },
          (error, result) => (error ? reject(error) : resolve(result))
        ).end(buffer);
      });
      imageUrl = uploadResponse.secure_url;
    }

    await Product.findByIdAndUpdate(id, {
      name,
      price: formattedPrice,
      stock,
      image: imageUrl,
    });

    revalidatePath('/menu');
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    
    // Return success state for the hook
    return { success: true, error: null };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update product." };
  }
  // The redirect must happen AFTER the try/catch or inside the success flow
  redirect('/admin/products');
}

// --- UPDATE ORDER STATUS ---
export async function updateOrderStatus(formData: FormData): Promise<void> {
  const orderId = formData.get("orderId");
  const newStatus = formData.get("status") || "completed";

  if (!orderId) return;

  try {
    await dbConnect();
    
    await Order.findByIdAndUpdate(orderId, { 
      status: newStatus 
    });

    revalidatePath("/admin/order"); 
    revalidatePath("/admin"); 
    revalidatePath("/order");       
    
  } catch (error) {
    console.error("Failed to update order:", error);
    throw new Error("Update failed.");
  }
}