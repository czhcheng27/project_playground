// client/src/utils/networkError.ts
import type { AxiosError } from "axios";

/**
 * 判断是否为超时错误
 */
export const isTimeoutError = (error: any): boolean => {
  return error?.isAxiosError && error.code === "ECONNABORTED";
};

/**
 * 判断是否为网络错误（非认证错误）
 */
export const isNetworkError = (error: any): boolean => {
  // 没有网络连接
  if (!navigator.onLine) {
    return true;
  }

  // Axios 错误
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;

    // 请求超时
    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.code === "ERR_NETWORK"
    ) {
      return true;
    }

    // 请求被取消
    if (axiosError.code === "ERR_CANCELED") {
      return true;
    }

    // 没有响应（服务器无法连接）
    if (!axiosError.response) {
      return true;
    }

    // 5xx 服务器错误
    const status = axiosError.response.status;
    if (status >= 500 && status < 600) {
      return true;
    }
  }

  return false;
};

/**
 * 判断是否为认证错误
 */
export const isAuthError = (error: any): boolean => {
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;

    // 401 Unauthorized 或 403 Forbidden
    // 后端在认证失败时返回这些状态码
    if (status === 401 || status === 403) {
      return true;
    }

    // 检查响应体中的 code 字段（后端的 sendError 会将状态码也放在 response.data.code）
    const data = axiosError.response?.data as any;
    if (data?.code === 401 || data?.code === 403) {
      return true;
    }
  }

  return false;
};

/**
 * 获取错误类型
 */
export type ErrorTypes =
  | "auth"
  | "network"
  | "timeout"
  | "business"
  | "unknown";
export const getErrorType = (error: any): ErrorTypes => {
  if (isAuthError(error)) return "auth";

  // 优先判断超时
  if (isTimeoutError(error)) return "timeout";

  // 再判断其他网络错误（如断网、DNS 错误等）
  if (isNetworkError(error)) return "network";

  if (error.isAxiosError && error.response) {
    return "business";
  }

  return "unknown";
};
