// 已在外部进行CI/CD设计，/scripts/initApp.ts进行了全部最新权限的录入及admin的初始化。但此文件先暂时保留
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Permission } from "../models/permission.model.js";
import { hashPassword } from "../lib/hash.js";

async function init() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ username: "admin" });
    // 获取全量权限
    const allPermissions = await Permission.find({}, { route: 1, actions: 1 });

    if (existing) {
      console.log("ℹ️ Admin already exists.");
    } else {
      const hashed = await hashPassword("admin");

      await User.create({
        username: "admin",
        password: hashed,
        email: "admin@email.com",
        roles: ["admin"],
        permissions: allPermissions,
      });

      console.log("✅ Admin user created: admin / admin");
    }
  } catch (err) {
    console.error("❌ Failed to initialize admin user:", err);
  }
}

await init();
