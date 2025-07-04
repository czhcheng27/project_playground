import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { JSX } from "react";

interface RouteGuardProps {
  element: JSX.Element;
  path: string;
  meta?: { public?: boolean };
}

export const RouteGuard = ({ element, path, meta }: RouteGuardProps) => {
  const location = useLocation();
  const { isAuthenticated } = useUserStore();
  const { permissions } = useAuthStore();

  if (meta?.public) {
    // 公开路由直接放行
    return element;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowedRoutes = permissions.map((p) => p.route);
  if (!allowedRoutes.includes(path)) {
    return <Navigate to="/403" replace />;
  }

  return element;
};
