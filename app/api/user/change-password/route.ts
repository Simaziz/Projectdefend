import { auth } from "@/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/models/User"; // adjust path to your User model
import { dbConnect } from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { current, next } = await req.json();

    if (!current || !next) {
      return NextResponse.json({ error: "Both current and new password are required" }, { status: 400 });
    }

    if (next.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    await dbConnect();

    // Fetch user with password field (usually excluded by default)
    const user = await User.findById(session.user.id).select("+password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "This account uses social login and has no password to change" },
        { status: 400 }
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(current, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(next, 12);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/user/change-password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}