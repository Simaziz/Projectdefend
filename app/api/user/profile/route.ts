import { auth } from "@/auth";
import { NextResponse } from "next/server";
import User from "@/models/User"; // adjust path to your User model
import { dbConnect } from "@/lib/mongodb";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await dbConnect();

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      { name: name.trim() },
      { new: true }
    ).select("name email image");

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}