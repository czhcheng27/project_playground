// 登录业务逻辑
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { comparePassword } from "../lib/hash.js";
import { signToken } from "../lib/jwt.js";
import { sendSuccess, sendError } from "../utils/response.js";

export const login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) return sendError(res, "User not found", 401);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return sendError(res, "Invalid password", 401);

    const token = signToken({ userId: user._id, roles: user.roles });
    const decoded = jwt.decode(token); // 解码获取过期时间
    const expired = decoded.exp; // exp 是秒级 UNIX 时间戳

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return sendSuccess(
      res,
      {
        token,
        expired,
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
        },
      },
      "Login successful",
      200
    );
  } catch (err) {
    console.error("Login Error:", err);
    return sendError(res, "Server error", 500);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return sendSuccess(res, null, "Logout successful");
};
