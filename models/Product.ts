import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true },
  discount: { type: Number, default: 0 },      // must exist
  isTopDrink: { type: Boolean, default: false }, // must exist
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);