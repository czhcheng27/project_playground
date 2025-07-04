// 请求去重 / 请求锁定
import axios from "axios";
import type { Canceler, AxiosRequestConfig } from "axios";
import i18n from "@/i18n";

const pendingRequest = new Map<string, Canceler>();
const lockingRequest = new Map<string, boolean>();

function generateReqKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config;
  return [
    method,
    url,
    typeof params === "object" ? JSON.stringify(params) : "",
    typeof data === "object" ? JSON.stringify(data) : "",
  ].join("&");
}

export function addPendingRequest(
  config: AxiosRequestConfig & { cancelable?: boolean }
) {
  if (!config.cancelable) return;

  const key = generateReqKey(config);
  config.cancelToken = new axios.CancelToken((cancel) => {
    if (!pendingRequest.has(key)) {
      pendingRequest.set(key, cancel);
    }
  });
}

export function removePendingRequest(config: AxiosRequestConfig) {
  const key = generateReqKey(config);
  if (pendingRequest.has(key)) {
    const cancel = pendingRequest.get(key)!;
    cancel(i18n.t("fetch.cancelText"));
    pendingRequest.delete(key);
  }
}

export function addLockingRequest(
  config: AxiosRequestConfig & { lockable?: boolean }
) {
  if (!config.lockable) return;
  const key = generateReqKey(config);
  if (!lockingRequest.has(key)) {
    lockingRequest.set(key, true);
  }
}

export function removeLockingRequest(config: AxiosRequestConfig) {
  const key = generateReqKey(config);
  lockingRequest.delete(key);
}

export function isRequestLocked(config: AxiosRequestConfig): boolean {
  const key = generateReqKey(config);
  return lockingRequest.has(key);
}
