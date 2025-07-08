// Express 应用初始化（中间件、router注册等）
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import permissionRoutes from "./routes/permission.route.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://czhcheng27.github.io",
  "https://chat-app-244z.onrender.com",
];

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked:", origin);
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// 路由注册
app.use("/api/auth", authRoutes);
app.use("/api/permission", permissionRoutes);

// 其他后续路由，如 /api/users、/api/ai 等都可以在这里继续添加

export default app;
