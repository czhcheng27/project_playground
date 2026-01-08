import axios, { AxiosError } from "axios";
import type { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import i18n from "@/i18n";
import { clearToken, getToken, isTokenExpired, setToken } from "@/utils/auth";
import {
  isRefreshing,
  setRefreshing,
  addPendingRequest as addTokenPending,
  runPendingRequest,
} from "@/utils/requestQueue";
import {
  addPendingRequest,
  removePendingRequest,
  addLockingRequest,
  removeLockingRequest,
  isRequestLocked,
} from "@/utils/requestControl";
import { Notification } from "@/utils";
import {
  isNetworkError,
  isAuthError,
  getErrorType,
} from "@/utils/networkError";

type IRequestConfig = AxiosRequestConfig & {
  cancelable?: boolean;
  lockable?: boolean;
};

export type AjaxResponse<T = any> = {
  code: number;
  data: T;
  message: string;
  success: boolean;
};

type IAxiosInstance = Omit<
  AxiosInstance,
  "get" | "post" | "put" | "delete" | "patch"
> & {
  get<T = any, R = AjaxResponse<T>>(
    url: string,
    config?: IRequestConfig
  ): Promise<R>;
  post<T = any, R = AjaxResponse<T>>(
    url: string,
    data?: any,
    config?: IRequestConfig
  ): Promise<R>;
  delete<T = any, R = AjaxResponse<T>>(
    url: string,
    config?: IRequestConfig
  ): Promise<R>;
  put<T = any, R = AjaxResponse<T>>(
    url: string,
    data?: any,
    config?: IRequestConfig
  ): Promise<R>;
  patch<T = any, R = AjaxResponse<T>>(
    url: string,
    data?: any,
    config?: IRequestConfig
  ): Promise<R>;
};

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 1000 * 20,
  withCredentials: false,
  paramsSerializer: (params) => new URLSearchParams(params).toString(),
}) as IAxiosInstance;

const getErrorText = (code?: number): string => {
  const statusCode = [
    200, 201, 202, 204, 400, 401, 403, 404, 406, 410, 412, 422, 500, 502, 503,
    504,
  ];
  if (!statusCode.includes(code as number)) {
    return "";
  }
  return i18n.t(`fetch.errorCode.${code}`) || i18n.t("fetch.errorText");
};

// 请求拦截器
instance.interceptors.request.use(async (config) => {
  // 请求锁定：若已存在相同请求，阻止
  if (isRequestLocked(config)) {
    return Promise.reject(new Error(i18n.t("fetch.lockText")));
  }

  removePendingRequest(config); // 清除前一个同类请求（用于防重复）
  addPendingRequest(config); // 添加当前请求
  addLockingRequest(config); // 添加锁

  // 添加 token
  if (config.headers && typeof config.headers.set === "function") {
    config.headers.set("Authorization", `Bearer ${getToken()}`);
  }

  // token 过期处理
  // if (isTokenExpired()) {
  //   if (!isRefreshing()) {
  //     setRefreshing(true);
  //     try {
  //       const res = await axios.post("/auth/refresh", { token: getToken() });
  //       const { token, expired } = res.data;
  //       setToken(token, expired);
  //       runPendingRequest(token);
  //     } catch (e) {
  //       clearToken();
  //       window.location.href = "/login";
  //     } finally {
  //       setRefreshing(false);
  //     }
  //   }

  //   return new Promise((resolve) => {
  //     addTokenPending((newToken: string) => {
  //       if (config.headers && typeof config.headers.set === "function") {
  //         config.headers.set("Authorization", `Bearer ${newToken}`);
  //       }
  //       resolve(config);
  //     });
  //   });
  // }

  return config;
});

// 异常处理程序
const errorHandler = (error: AxiosError): Promise<AxiosError> => {
  const { config = {}, response = {} } = error;
  removePendingRequest(config);
  removeLockingRequest(config);

  const errorType = getErrorType(error);
  const { status, statusText = "" } = response as AxiosResponse;

  // 认证错误 - 直接登出
  if (errorType === "auth") {
    clearToken();
    window.location.href = "/login";
    Notification(i18n.t("fetch.errorCode.401"), "error", 5);
    return Promise.reject(error);
  }

  // 网络错误 - 不显示通知，由调用方处理
  if (errorType === "network") {
    // 静默处理，让调用方使用缓存
    console.warn("网络错误:", error.message);
    return Promise.reject({ ...error, isNetworkError: true });
  }

  // 其他错误 - 显示错误提示
  const errortext =
    getErrorText(status) || statusText || i18n.t("fetch.errorText");
  if (error.code !== "ERR_CANCELED") {
    Notification(errortext || error.message, "error", 5);
  }

  return Promise.reject(error);
};

// 响应拦截器
instance.interceptors.response.use((response: AxiosResponse) => {
  const { config, data } = response;

  removePendingRequest(config);
  removeLockingRequest(config);

  // blob 类型文件直接放行
  if (config.responseType === "blob") {
    return response;
  }

  // 后端业务状态码判断
  if (data.code !== 200 && data.code !== 201) {
    if (data.code === 55001 || data.code === 55002) {
      clearToken();
      window.location.href = "/login";
    }

    Notification(getErrorText(data.code) || data.message, "error", 5);
  }

  return data;
}, errorHandler);

export default instance;
