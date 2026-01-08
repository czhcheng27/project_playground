import { useEffect, useState, useRef } from "react";
import type { JSX } from "react";
import { useRoutes, useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { useAuthStore } from "@/store/useAuthStore";
import Loading from "@/components/Loading";
import { arePermissionsEqual } from "@/utils/route";
import { apiLatestPermissions } from "@/api/common";
import { isNetworkError, isAuthError } from "@/utils/networkError";
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
  const [isOffline, setIsOffline] = useState(false);

  // 使用 ref 防止重复请求
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const FETCH_INTERVAL = 1000; // 最小请求间隔 1 秒
  const MAX_RETRY_COUNT = 3; // 最大重试次数
  const RETRY_DELAY = 3000; // 重试延迟 3 秒

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      message.success("网络已恢复，正在同步最新权限...");
      retryCountRef.current = 0; // 重置重试计数
      // 网络恢复后立即尝试获取最新权限
      lastFetchTimeRef.current = 0;
    };

    const handleOffline = () => {
      setIsOffline(true);
      message.warning("网络连接已断开，正在使用缓存数据");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 初始检查
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchAndUpdatePermissions = async () => {
      // 没有 token 则直接返回
      if (!token) return;

      // 防止重复请求
      const now = Date.now();
      if (
        isFetchingRef.current ||
        now - lastFetchTimeRef.current < FETCH_INTERVAL
      ) {
        return;
      }

      // 如果是离线状态，直接使用 Zustand 持久化的权限（localStorage 的 auth）
      if (!navigator.onLine) {
        // permissions 已经从 localStorage 自动恢复，无需手动处理
        return;
      }

      // 第一次加载时显示加载动画
      if (permissions.length === 0) {
        setIsLoadingPermissions(true);
      }

      try {
        isFetchingRef.current = true;
        lastFetchTimeRef.current = now;

        // 调用后端 API 获取最新权限数据
        const res = await apiLatestPermissions();

        if (res.code === 200 && res.data && res.data.permissions) {
          const latestPermissions = res.data.permissions;

          // 比较最新权限和当前权限，只有不同时才更新
          // setPermissions 会自动通过 Zustand persist 保存到 localStorage
          if (!arePermissionsEqual(permissions, latestPermissions)) {
            setPermissions(latestPermissions);
          }

          // 重置重试计数
          retryCountRef.current = 0;

          // 清除离线状态
          if (isOffline) {
            setIsOffline(false);
          }
        } else {
          // API 返回非成功状态，视为认证失败
          console.error("获取最新用户权限失败:", res.message || "未知错误");
          clearAuth();
          navigate("/login");
        }
      } catch (error: any) {
        console.error("获取最新用户权限请求错误:", error);

        // 判断错误类型
        if (isAuthError(error)) {
          // 认证错误 - 直接登出
          clearAuth();
          navigate("/login");
        } else if (isNetworkError(error) || error.isNetworkError) {
          // 网络错误 - 使用 Zustand 持久化的权限并尝试重试

          if (permissions && permissions.length > 0) {
            // 有缓存权限（从 localStorage 恢复的）
            // 显示提示（仅首次）
            if (retryCountRef.current === 0) {
              message.warning("网络异常，已使用本地缓存权限数据");
            }

            // 尝试重试
            if (retryCountRef.current < MAX_RETRY_COUNT) {
              retryCountRef.current++;
              console.log(
                `将在 ${RETRY_DELAY / 1000} 秒后进行第 ${
                  retryCountRef.current
                } 次重试...`
              );

              retryTimerRef.current = setTimeout(() => {
                lastFetchTimeRef.current = 0; // 重置时间限制
                isFetchingRef.current = false; // 允许重新请求
              }, RETRY_DELAY * retryCountRef.current); // 指数退避
            } else {
              message.error("网络持续异常，请检查网络连接后刷新页面");
            }
          } else {
            // 没有缓存权限 - 显示错误但不登出
            message.error("网络连接失败，请检查网络后重试");
            retryCountRef.current = 0;
          }
        } else {
          // 其他未知错误 - 保守处理，不直接登出
          console.error("未知错误:", error);
          message.error("获取权限失败，请稍后重试");
        }
      } finally {
        setIsLoadingPermissions(false);
        isFetchingRef.current = false;
      }
    };

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

  return (
    <>
      {/* 离线状态提示 */}
      {isOffline && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "#ff9800",
            color: "#fff",
            padding: "8px 16px",
            textAlign: "center",
            zIndex: 9999,
            fontSize: "14px",
          }}
        >
          ⚠️ Network is offline, is using cached data
        </div>
      )}
      {useRoutes(processedRoutes)}
    </>
  );
};

export default Router;
