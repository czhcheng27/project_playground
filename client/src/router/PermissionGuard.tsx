// src/router/PermissionGuard.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  useLocation,
  Navigate,
  useNavigate,
  matchRoutes,
} from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { apiLatestPermissions } from "@/api/common";
import Loading from "@/components/Loading";
import { getErrorType } from "@/utils/networkError"; // 引入你的工具类
import RetryPage from "@/pages/retry";
import { routes } from "./routes";

export const PermissionGuard = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setPermissions, clearAuth } = useAuthStore();

  const isPublic = useMemo(() => {
    const matches = matchRoutes(routes, location.pathname);
    const currentRoute = matches?.[matches.length - 1]?.route as any;
    return currentRoute?.meta?.public === true;
  }, [location.pathname]);

  const [loading, setLoading] = useState(!isPublic);
  const [isAuthorized, setIsAuthorized] = useState(isPublic);
  // 新增：记录错误类型
  const [errorType, setErrorType] = useState<
    "auth" | "network" | "timeout" | "business" | "unknown" | null
  >(null);

  const check = useCallback(async () => {
    if (isPublic) return;

    setLoading(true);
    setErrorType(null); // 开始检查前重置错误

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
        // 即使 code 不是 200，也可能是业务层面的无权限
        setIsAuthorized(false);
      }
    } catch (err: any) {
      const type = getErrorType(err);
      setErrorType(type);

      // 如果是认证错误（401/403），清理并跳去登录
      if (type === "auth") {
        clearAuth();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [isPublic, location.pathname, token, navigate, setPermissions, clearAuth]);

  useEffect(() => {
    check();
  }, [check]);

  // 1. 公共页面或未登录处理
  if (!token && !isPublic) return <Navigate to="/login" replace />;

  // 2. 加载中
  if (loading) return <Loading fullPage={false} />;

  // 3. 处理超时错误 (Timeout Error UI)
  if (errorType === "timeout") {
    return (
      <RetryPage
        title="Request Timeout"
        subTitle="The server is taking too long to respond. Please check your connection and try again."
        btnTxt="Retry Now"
        retry={check}
      />
    );
  }

  // 4. 处理普通网络错误 (断网等)
  if (errorType === "network") {
    return (
      <RetryPage
        title="Network Error"
        subTitle="Unable to connect to the server. Please check your network connection and try again."
        retry={check}
      />
    );
  }

  // 5. 处理业务错误或系统崩溃
  if (errorType === "business" || errorType === "unknown") {
    return (
      <RetryPage
        title="System Error"
        subTitle="Request failed due to a system error. Please try again later."
        retry={check}
      />
    );
  }

  // 5. 校验通过，但确实没有权限
  if (!isAuthorized) return <Navigate to="/403" replace />;

  // 6. 最终通过
  return <>{children}</>;
};
