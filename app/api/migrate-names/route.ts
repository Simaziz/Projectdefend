import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  await dbConnect();

  // Use lean() + direct MongoDB query to bypass Mongoose defaults
  // This finds ALL users and updates ones with missing/empty names
  const allUsers = await User.find({}).lean();

  const usersToUpdate = allUsers.filter(
    (u: any) => !u.name || u.name.trim() === ""
  );

  if (usersToUpdate.length === 0) {
    return NextResponse.json({ message: "No users need updating." });
  }

  const updates = await Promise.all(
    usersToUpdate.map((user: any) => {
      const nameFromEmail = user.email.split("@")[0];
      return User.findByIdAndUpdate(
        user._id,
        { $set: { name: nameFromEmail } }, // $set forces the field to be written
        { new: true }
      );
    })
  );

  return NextResponse.json({
    message: `Updated ${updates.length} users.`,
    users: usersToUpdate.map((u: any) => ({
      email: u.email,
      newName: u.email.split("@")[0],
    })),
  });
}