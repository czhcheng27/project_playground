// 启动服务器并连接数据库
import dotenv from "dotenv";
dotenv.config();
import http from "http";
import app from "./app.js";
import { connectDB } from "./lib/db.js";

const PORT = process.env.PORT || 5001;
console.log("JWT_SECRET:", process.env.JWT_SECRET);

async function startServer() {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    // // 先执行初始化脚本
    // await import("./seeds/initAdmin.js");

    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log("✅ Server is running on PORT:", PORT);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB", err);
    process.exit(1); // 退出进程，避免继续启动服务
  }
}

startServer();

// import("./seeds/initAdmin.js");
