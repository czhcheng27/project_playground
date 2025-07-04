import { useAuthStore } from "@/store/useAuthStore";
import type { MenuItem, Permission } from "@/types";

// 设置token和过期时间
export const setToken = (token: string, expired: number) => {
  useAuthStore.getState().setAuth(token, expired);
};

// 获取token
export const getToken = () => useAuthStore.getState().token;

// 获取过期时间
export const getExpired = () => useAuthStore.getState().expired;

// 判断token是否过期
export const isTokenExpired = () =>
  Date.now() > useAuthStore.getState().expired;

// 清除token
export const clearToken = () => useAuthStore.getState().clearAuth();

// 菜单权限过滤
export const filterMenuByPermissions = (
  menu: MenuItem[],
  permissions: Permission[]
): MenuItem[] => {
  const permissionRoutes = new Set(permissions.map((p) => p.route));

  const filterRecursive = (items: MenuItem[]): MenuItem[] => {
    return items
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterRecursive(item.children);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
        }

        if (permissionRoutes.has(item.key)) {
          return { ...item, children: undefined };
        }

        return null;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  return filterRecursive(menu);
};
