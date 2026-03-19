// app/api/shop/settings/route.ts
// Public endpoint — no auth required, customers can read shop status
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Setting from "../../../../../models/Settings";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  const settings = await Setting.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, new: true }
  ).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(settings)));
}