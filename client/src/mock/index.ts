import type { Permission } from "@/types";

export const mockReturnData: {
  token: string;
  user: {
    id: string;
    name: string;
    roles: string[];
  };
  permissions: Permission[];
} = {
  token: "xxxxx",
  user: {
    id: "u001",
    name: "Zihang Cheng",
    roles: ["admin"],
  },
  permissions: [
    { route: "/dashboard", actions: ["write"] },
    { route: "/projects", actions: ["read"] },
    { route: "/system-management/user", actions: ["write"] },
    { route: "/system-management/role", actions: ["write"] },
  ],
};

export const mockUserList = [
  {
    id: "1",
    username: "admin",
    role: "1",
    logintime: "2025-06-26 09:21:23",
  },
];
