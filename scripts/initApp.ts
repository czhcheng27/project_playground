import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import axios from "axios";
import { User } from "../server/src/models/user.model.js"; // 确保路径正确
import { Role } from "../server/src/models/role.model.js";
import { Permission } from "../server/src/models/permission.model.js"; // 确保路径正确
import { hashPassword } from "../server/src/lib/hash.js"; // 确保路径正确
import { routeConfig } from "../client/src/config/route.config"; // 确保路径正确

// ✅ 设置后端接口地址（开发时用本地地址）
const BASE_URL = "http://localhost:5001";

// 核心修复：先 trim() 移除所有首尾空白，再 replace() 移除可能存在的首尾引号
const rawMongoUrl = process.env.MONGO_URL;
const MONGO_URL = rawMongoUrl
  ? rawMongoUrl.trim().replace(/^"|"$/g, "") // <-- 关键改动：先 trim() 再 replace()
  : "mongodb://localhost:27017/your_database_name";

async function initApp() {
  try {
    // 1. 连接 MongoDB
    if (mongoose.connection.readyState === 0) {
      // 检查是否已连接
      await mongoose.connect(MONGO_URL);
      console.log("✅ Connected to MongoDB");
    }

    // 2. 同步全量权限到后端服务（并写入数据库）
    console.log("ℹ️ Starting to sync permissions to backend...");
    const syncRes = await axios.post(`${BASE_URL}/api/permission/sync`, {
      permissions: routeConfig,
    });
    console.log("✅ Permissions synced to backend:", syncRes.data.message);

    // 3. 获取刚刚同步到数据库的全量权限数据
    // 注意：这里的 Permission.find() 是直接从 MongoDB 获取数据，确保后端已经成功写入
    const allPermissions = await Permission.find(
      {},
      { route: 1, actions: 1, _id: 0 } // 只获取需要的字段
    ).lean(); // 使用 .lean() 获取纯粹的 JS 对象，性能更好

    if (!allPermissions || allPermissions.length === 0) {
      console.warn(
        "⚠️ No permissions found in DB after sync. Admin may not get all permissions."
      );
    }

    // 4. 创建或更新 Admin 角色并赋予所有权限
    const adminRoleName = "admin"; // 使用小写 'admin' 与用户角色保持一致
    let adminRole = await Role.findOne({ roleName: adminRoleName });

    if (!adminRole) {
      console.log(`ℹ️ Creating '${adminRoleName}' role...`);
      adminRole = new Role({
        roleName: adminRoleName,
        description: "系统最高管理员角色，拥有所有应用路由的读写权限。",
        permissions: allPermissions, // 将所有权限赋予 Admin 角色
      });
      await adminRole.save();
      console.log(`✅ '${adminRoleName}' role created successfully.`);
    } else {
      console.log(
        `ℹ️ '${adminRoleName}' role already exists. Checking for permission updates...`
      );
      // 简单更新逻辑：确保 Admin 角色拥有所有当前权限
      // 遍历所有权限，如果角色中没有，就添加
      let needsUpdate = false;
      const currentRolePermissionsMap = new Map(
        adminRole.permissions.map(
          (p) => [p.route, p.actions] as [string, string[]]
        )
      );

      for (const newPerm of allPermissions) {
        const existingAction = currentRolePermissionsMap.get(newPerm.route);
        // 如果路由不存在，或者存在的 actions 不完全匹配 (例如，不是 read/write)
        if (
          !existingAction ||
          existingAction.length !== newPerm.actions.length ||
          !existingAction.every((actions) => newPerm.actions.includes(actions))
        ) {
          // 找到并更新，或者添加新权限
          const index = adminRole.permissions.findIndex(
            (p) => p.route === newPerm.route
          );
          if (index > -1) {
            adminRole.permissions[index].actions = newPerm.actions; // 更新 actions
          } else {
            adminRole.permissions.push(newPerm); // 添加新路由权限
          }
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await adminRole.save();
        console.log(`✅ '${adminRoleName}' role permissions updated.`);
      } else {
        console.log(`ℹ️ '${adminRoleName}' role permissions are up to date.`);
      }
    }

    // 5. 创建或更新 Admin 用户
    const adminUsername = "admin";
    const adminPassword = "admin"; // 初始密码
    const adminEmail = "admin";

    let adminUser: any = await User.findOne({ username: adminUsername });
    const hashed = await hashPassword(adminPassword);

    if (adminUser) {
      // 如果 Admin 存在，只更新其权限
      adminUser.permissions = allPermissions;
      await adminUser.save();
      console.log("ℹ️ Admin user already exists, permissions updated.");
    } else {
      // 如果 Admin 不存在，则创建新用户
      await User.create({
        username: adminUsername,
        password: hashed,
        email: adminEmail,
        roles: ["admin"],
        permissions: allPermissions,
      });
      console.log(`✅ Admin user created: ${adminUsername} / ${adminPassword}`);
    }
  } catch (err: any) {
    console.error(
      "❌ Failed to initialize app (permissions sync or admin creation):",
      err
    );
    if (axios.isAxiosError(err) && err.response) {
      console.error("Axios Response Error Status:", err.response.status);
      console.error("Axios Response Error Data:", err.response.data);
    } else if (axios.isAxiosError(err) && err.request) {
      console.error("Axios Request Error (No response received):", err.request);
    } else {
      console.error("Generic Error:", err.message);
    }
  }
}

// 执行初始化函数
initApp();
