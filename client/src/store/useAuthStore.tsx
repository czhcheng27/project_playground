import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Permission } from "@/types";

interface AuthState {
  token: string;
  expired: number;
  permissions: Permission[];

  setAuth: (token: string, expired: number) => void;
  clearAuth: () => void;
  setPermissions: (data: Permission[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "",
      expired: 0,
      permissions: [],
      setAuth: (token, expired) => set({ token, expired }),
      clearAuth: () => set({ token: "", expired: 0 }),
      setPermissions: (permissions: Permission[]) => set({ permissions }),
    }),
    {
      name: "auth",
      partialize: (state) => ({
        token: state.token,
        expired: state.expired,
        permissions: state.permissions,
      }),
    }
  )
);
