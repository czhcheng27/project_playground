// src/router/PermissionGuard.tsx
import { useEffect, useState, useRef, useMemo } from "react";
import {
  useLocation,
  Navigate,
  useNavigate,
  matchRoutes,
} from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import Loading from "@/components/Loading";
import { apiLatestPermissions } from "@/api/common";
import { routes } from "./routes"; // 引入路由配置

export const PermissionGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setPermissions, clearAuth } = useAuthStore();

  // 1. 【核心逻辑】匹配当前路由，获取其 meta 信息
  const isPublic = useMemo(() => {
    const matches = matchRoutes(routes, location.pathname);
    // 找到当前匹配的路由项（最后一个通常是具体的子路由）
    const currentRoute = matches?.[matches.length - 1]?.route as any;
    return currentRoute?.meta?.public === true;
  }, [location.pathname]);

  // 如果是公共页面，初始 Loading 直接设为 false
  const [loading, setLoading] = useState(!isPublic);
  const [isAuthorized, setIsAuthorized] = useState(isPublic);

  // 防止 React 18 严格模式下重复请求的 ref
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // 2. 如果是公共页面，直接跳过请求逻辑
    if (isPublic) return;

    check();
    // 注意：这里的依赖项其实只需要 token，
    // 因为 location 变化会导致整个组件通过 key 重新挂载，从而重新触发此 Effect
  }, [token, isPublic, location.pathname]);

  const check = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    try {
      const res = await apiLatestPermissions();
      if (res.code === 200) {
        const perms = res.data.permissions || [];
        setPermissions(perms);

        const allowedRoutes = perms.map((p: any) => p.route);
        const hasAccess =
          allowedRoutes.includes(location.pathname) ||
          location.pathname === "/";

        setIsAuthorized(hasAccess);
      } else {
        clearAuth();
        navigate("/login");
      }
    } catch (err) {
      console.error("Permission check failed", err);
    } finally {
      setLoading(false);
    }
  };

  // 3. 渲染逻辑
  if (!token) return <Navigate to="/login" replace />;

  // 只要 loading 为 true，Outlet 就不会渲染，RolePage 的 useEffect 绝不会触发
  if (loading) {
    return <Loading />;
  }

  if (!isAuthorized) return <Navigate to="/403" replace />;

  return <>{children}</>;
};
