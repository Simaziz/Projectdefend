// models/Order.ts
import mongoose, { Schema, models } from "mongoose";

// Each item inside an order
const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  name:      { type: String, required: true },
  image:     { type: String, default: "" },
  price:     { type: Number, required: true },  // unit price at time of purchase
  quantity:  { type: Number, required: true, default: 1 },
}, { _id: false });

// The full order — one document per customer checkout
const OrderSchema = new Schema(
  {
    userEmail:    { type: String, required: true },
    customerName: { type: String, default: "Guest" },
    items:        { type: [OrderItemSchema], required: true },
    totalPrice:   { type: Number, required: true },
    address:      { type: String, default: "" },
    phone:        { type: String, default: "" },
    note:         { type: String, default: "" },
    status:       {
      type:    String,
      enum:    ["pending", "preparing", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }  // adds createdAt + updatedAt automatically
);

const Order = models.Order || mongoose.model("Order", OrderSchema);
export default Order;