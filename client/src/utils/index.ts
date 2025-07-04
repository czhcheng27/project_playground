import { notification } from "antd";
import i18n from "@/i18n";

// 函数的 防抖 和 节流，使用 lodash 工具函数
export { debounce, throttle, round, cloneDeep, merge } from "lodash";

/**
 * @description 生成 uuid
 * @param {string} prefix 前缀标识
 * @returns {boolean} 生成的 uuid 字符串
 */
export const createUidKey = (prefix = ""): string => {
  let d = new Date().getTime();
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return prefix + uuid;
};

/**
 * @description Notification 通知提示
 * @param {string} msg 提示的文本
 * @param {string} type 提示类型
 * @param {number} delay 延迟的时间，单位 秒，如果值是 0，为手动关闭模式
 * @returns
 */
export const Notification = (
  msg = "",
  type: "success" | "warning" | "info" | "error" = "success",
  delay = 4.5
): void => {
  notification[type]({
    message: i18n.t("information.title"),
    description: msg,
    duration: delay,
  });
};
