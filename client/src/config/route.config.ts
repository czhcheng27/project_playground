export const routeConfig = [
  {
    route: "/dashboard",
    actions: ["read", "write"],
    defaultRoles: ["admin", "manager", "advisor", "employee"],
  },
  {
    route: "/projects",
    actions: ["read", "write"],
    defaultRoles: ["admin", "manager", "advisor", "employee"],
  },
  {
    route: "/system-management/user",
    actions: ["read", "write"],
    defaultRoles: ["admin"],
  },
  {
    route: "/system-management/role",
    actions: ["read", "write"],
    defaultRoles: ["admin", "manager"],
  },
];
