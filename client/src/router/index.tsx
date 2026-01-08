import { useEffect, useState, useRef } from "react";
import type { JSX } from "react";
import { useRoutes, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import Loading from "@/components/Loading";
import { arePermissionsEqual } from "@/utils/route";
import { apiLatestPermissions } from "@/api/common";
import { routes } from "./routes";
import { RouteGuard } from "./guard";

type RouteMeta = {
  public?: boolean;
  roles?: string[];
};

export interface AppRoute {
  path: string;
  element: JSX.Element;
  children?: AppRoute[];
  meta?: RouteMeta;
}

const Router = () => {
  const { token, permissions, setPermissions, clearAuth } = useAuthStore();

  const navigate = useNavigate();
  const location = useLocation();

  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);

  // 使用 ref 防止重复请求
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const FETCH_INTERVAL = 1000; // 最小请求间隔 1 秒

  useEffect(() => {
    const fetchAndUpdatePermissions = async () => {
      // 没有 token 则直接返回
      if (!token) return;

      // 防止重复请求：如果正在请求中，或距离上次请求时间太短，则跳过
      const now = Date.now();
      if (
        isFetchingRef.current ||
        now - lastFetchTimeRef.current < FETCH_INTERVAL
      ) {
        return;
      }

      // 只有当有 token 时才尝试获取最新权限
      // 第一次加载时显示加载动画，或者 token 刚设置时
      if (permissions.length === 0) {
        setIsLoadingPermissions(true);
      }

      try {
        isFetchingRef.current = true; // 标记正在请求
        lastFetchTimeRef.current = now; // 记录请求时间

        // 调用后端 API 获取最新权限数据
        const res = await apiLatestPermissions();
        if (res.code === 200 && res.data && res.data.permissions) {
          const latestPermissions = res.data.permissions;

          // ★★★ 关键：比较最新权限和当前权限，只有不同时才更新 ★★★
          if (!arePermissionsEqual(permissions, latestPermissions)) {
            setPermissions(latestPermissions); // 更新 Zustand store，这会触发依赖组件的重新渲染
          }
        } else {
          // 如果 API 返回非成功状态，或数据不符，视为 Token 无效或权限获取失败
          console.error("获取最新用户权限失败:", res.message || "未知错误");
          clearAuth(); // 清除认证信息
          navigate("/login"); // 跳转到登录页
        }
      } catch (error) {
        console.error("获取最新用户权限请求错误:", error);
        // 网络错误或服务器错误，也强制登出
        clearAuth();
        navigate("/login");
      } finally {
        setIsLoadingPermissions(false); // 无论成功失败，都结束加载
        isFetchingRef.current = false; // 请求完成，解除标记
      }
    };

    // ★★★ 关键修复：只在 token 或路由变化时执行，移除 permissions 依赖 ★★★
    fetchAndUpdatePermissions();
  }, [token, location.pathname]); // 移除了 permissions 依赖，避免循环触发

  const wrapRoutes = (routes: AppRoute[]): AppRoute[] => {
    return routes.map(({ path, element, meta, children, ...rest }) => {
      const isPublic = meta?.public;

      return {
        ...rest,
        path,
        element: isPublic ? (
          element
        ) : (
          <RouteGuard element={element} path={path} meta={meta} />
        ),
        children: children ? wrapRoutes(children) : undefined,
      };
    });
  };

  const processedRoutes = wrapRoutes(routes);

  // 确保在权限加载完成之前不渲染实际路由，避免闪烁或错误权限判断
  if (isLoadingPermissions && token) {
    return <Loading fullPage />;
  }

  return useRoutes(processedRoutes);
};

export default Router;
