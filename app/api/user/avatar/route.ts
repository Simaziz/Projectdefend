import { auth } from "@/auth";
import { NextResponse } from "next/server";
import User from "@/models/User"; // adjust path to your User model
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 400 });
    }

    // Convert to base64 to store directly in MongoDB
    // If you use Cloudinary/S3, replace this block with your upload logic
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const imageUrl = `data:${file.type};base64,${base64}`;

    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { image: imageUrl },
      { new: true }
    ).select("name email image");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, image: updated.image });
  } catch (error) {
    console.error("POST /api/user/avatar error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}