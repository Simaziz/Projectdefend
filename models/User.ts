// import 'server-only'
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // hidden by default
    image: { type: String, default: "" },
    role: { type: String, enum: ['user', 'admin', 'staff'], default: 'user' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);