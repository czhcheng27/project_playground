import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Permission } from "@/types";
import { mockReturnData } from "@/mock";

interface AuthState {
  token: string;
  expired: number;
  permissions: Permission[];
  setAuth: (token: string, expired: number) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: "",
      expired: 0,
      // permissions: [],
      permissions: mockReturnData.permissions,
      setAuth: (token, expired) => set({ token, expired }),
      clearAuth: () => set({ token: "", expired: 0 }),
    }),
    {
      name: "auth",
    }
  )
);
