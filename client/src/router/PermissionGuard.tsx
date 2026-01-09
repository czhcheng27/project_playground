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
import { getErrorType, type ErrorTypes } from "@/utils/networkError";
import RetryPage, { type RetryPageProps } from "@/pages/retry";
import { routes } from "./routes";

const MAX_AUTO_RETRIES = 3; // 最大自动重试次数

type ErrorConfig = Omit<RetryPageProps, "retry" | "status"> & {
  autoRetrySeconds?: number;
};

type NonAuthErrorType = Exclude<ErrorTypes, "auth">;
const ErrorTypeObj: { [K in NonAuthErrorType]: ErrorConfig } = {
  timeout: {
    title: "Request Timeout",
    subTitle:
      "The server is taking too long to respond. Please check your connection and try again.",
    btnTxt: "Retry Now",
  },
  network: {
    title: "Network Error",
    subTitle:
      "Unable to connect to the server. Please check your network connection and try again.",
    btnTxt: "Retry Now",
  },
  business: {
    title: "System Error",
    subTitle: "Request failed due to a system error. Please try again later.",
    btnTxt: "Retry Now",
    allowAutoRetry: false,
  },
  unknown: {
    title: "System Error",
    subTitle: "Request failed due to a system error. Please try again later.",
    btnTxt: "Retry Now",
  },
};

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
  const [errorType, setErrorType] = useState<ErrorTypes | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
        setRetryCount(0);
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
      } else {
        // 如果是网络或超时错误，增加重试计数
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [isPublic, location.pathname, token]);

  useEffect(() => {
    check();
  }, [check]);

  // 计算当前是否还允许自动重试
  const canAutoRetry = retryCount < MAX_AUTO_RETRIES;
  const remaining = Math.max(0, MAX_AUTO_RETRIES - retryCount);

  // 1. 公共页面或未登录处理
  if (!token && !isPublic) return <Navigate to="/login" replace />;

  // 2. 加载中
  if (loading) return <Loading fullPage={false} />;

  // 3. 出错处理（非认证错误）
  if (Object.keys(ErrorTypeObj).includes(errorType || "")) {
    const errObj = ErrorTypeObj[errorType as NonAuthErrorType];
    return (
      <RetryPage
        title={errObj.title}
        subTitle={errObj.subTitle}
        btnTxt={errObj.btnTxt}
        retry={check}
        autoRetrySeconds={canAutoRetry ? errObj.autoRetrySeconds : undefined}
        allowAutoRetry={canAutoRetry && errObj.allowAutoRetry !== false}
        remainingAttempts={remaining} // 传递剩余次数
      />
    );
  }

  // 5. 校验通过，但确实没有权限
  if (!isAuthorized) return <Navigate to="/403" replace />;

  // 6. 最终通过
  return <>{children}</>;
};
