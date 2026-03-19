// app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Setting from "@/models/Settings";

export const dynamic = "force-dynamic";

// GET — fetch the single settings document (create default if none exists)
export async function GET() {
  await dbConnect();
  // findOneAndUpdate with upsert ensures a document always exists
  const settings = await Setting.findOneAndUpdate(
    {},
    { $setOnInsert: {} },
    { upsert: true, new: true }
  );
  return NextResponse.json(JSON.parse(JSON.stringify(settings)));
}

// PUT — update settings
export async function PUT(req: Request) {
  await dbConnect();
  const body = await req.json();

  const settings = await Setting.findOneAndUpdate(
    {},
    { $set: body },
    { upsert: true, new: true }
  );
  return NextResponse.json(JSON.parse(JSON.stringify(settings)));
}