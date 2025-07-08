// 用户模型
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    roles: [String],
    permissions: [
      {
        route: { type: String, required: true },
        action: { type: [String], enum: ["read", "write"], default: [] },
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
