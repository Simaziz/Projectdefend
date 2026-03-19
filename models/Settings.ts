// models/Setting.ts
import mongoose, { Schema, models } from "mongoose";

const SettingSchema = new Schema(
  {
    shopName:       { type: String, default: "Cozy Cup" },
    shopAddress:    { type: String, default: "" },
    shopPhone:      { type: String, default: "" },
    shopEmail:      { type: String, default: "" },
    openTime:       { type: String, default: "08:00" },
    closeTime:      { type: String, default: "20:00" },
    closedDays:     { type: [String], default: [] },
    lowStockAlert:  { type: Number, default: 10 },
    notifyNewOrder: { type: Boolean, default: true },
    notifyLowStock: { type: Boolean, default: true },
    isOpen:         { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Only ever one settings document — singleton pattern
const Setting = models.Setting || mongoose.model("Setting", SettingSchema);
export default Setting;