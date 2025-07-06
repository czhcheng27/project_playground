// src/seeds/initAdmin.js
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { hashPassword } from "../lib/hash.js";

async function init() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ username: "admin" });

    if (existing) {
      console.log("ℹ️ Admin already exists.");
    } else {
      const hashed = await hashPassword("admin");

      await User.create({
        username: "admin",
        password: hashed,
        email: "admin@email.com",
        roles: ["admin"],
        permissions: ["user:create", "user:update", "user:delete"],
      });

      console.log("✅ Admin user created: admin / admin");
    }
  } catch (err) {
    console.error("❌ Failed to initialize admin user:", err);
  }
}

await init();
