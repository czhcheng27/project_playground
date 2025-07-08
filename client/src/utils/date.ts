/**
 * 格式化 ISO 8601 字符串日期为本地时间字符串。
 * @param {string} isoString - 传入的 ISO 8601 格式的日期字符串，例如 "2025-07-08T15:32:09.257Z"。
 * @returns {string} 格式化后的日期时间字符串，例如 "2025-07-08 23:32:09"。
 */
export interface FormatDateTime {
  (isoString: string): string;
}

export const formatDateTime: FormatDateTime = function (
  isoString: string
): string {
  if (!isoString) {
    return ""; // 如果没有传入字符串，返回空
  }

  const date: Date = new Date(isoString);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    console.error("无效的日期字符串:", isoString);
    return ""; // 无效日期也返回空
  }

  const year: number = date.getFullYear();
  const month: string = (date.getMonth() + 1).toString().padStart(2, "0"); // 月份从0开始，所以要加1
  const day: string = date.getDate().toString().padStart(2, "0");
  const hours: string = date.getHours().toString().padStart(2, "0");
  const minutes: string = date.getMinutes().toString().padStart(2, "0");
  const seconds: string = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
