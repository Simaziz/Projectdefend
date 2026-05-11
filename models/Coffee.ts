import mongoose, { Schema, model, models } from "mongoose";


const CoffeeSchema = new Schema({
  name: { 
    type: String, 
    required: [true, "Please provide a name for the coffee"] 
  },
  price: { 
    type: Number, 
    required: [true, "Please provide a price"] 
  },
  stock: { 
    type: Number, 
    required: [true, "Please provide stock amount"],
    default: 0 
  },
  image: { 
    type: String, 
    required: [true, "Please provide an image URL"] 
  },
  category: {
    type: String,
    enum: ["Hot", "Iced", "Bakery"],
    default: "Iced"
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});


const Coffee = models.Coffee || model("Coffee", CoffeeSchema);

export default Coffee;