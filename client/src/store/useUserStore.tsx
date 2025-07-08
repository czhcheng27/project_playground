import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearToken, setToken } from "@/utils/auth";
import { apiLogin, apiLogout } from "@/api/common";
import { useAuthStore } from "./useAuthStore";

type UserInfo = {
  username: string;
  role: "Admin" | "user" | ""; // 你也可以改成 string[]
};

interface LoginFormValues {
  identifier: string;
  password: string;
}

type UserState = {
  isAuthenticated: boolean;
  userInfo: UserInfo;
  isLoggingIn: boolean;

  setUser: (user: UserInfo) => void;
  login: (values: LoginFormValues) => Promise<boolean> | undefined;
  logout: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userInfo: { username: "", role: "" },
      isLoggingIn: false,

      setUser: (user) =>
        set({
          userInfo: user,
          isAuthenticated: true,
        }),

      login: async (values: LoginFormValues) => {
        set({ isLoggingIn: true });
        try {
          const res = await apiLogin(values);
          if (!res.success) return false;
          const { expired, token, user } = res.data;
          const { roles, permissions, username } = user;
          const userInfo = { username: username, role: roles[0] };
          set({ isAuthenticated: true, userInfo });
          useAuthStore.getState().setPermissions(permissions);
          setToken(token, expired);
          return true;
        } catch (err) {
          console.error("登录失败", err);
          return false;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          const res = await apiLogout();
          if (res.success) {
            set({
              userInfo: { username: "", role: "" },
              isAuthenticated: false,
            });
            clearToken();
          }
        } catch (e) {
          console.error("登出失败", e);
        }
      },
    }),
    {
      name: "user", // localStorage 的 key
      partialize: (state) => ({
        userInfo: state.userInfo,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
