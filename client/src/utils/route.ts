// 辅助函数：比较两个权限数组是否相同

import type { Permission } from "@/types";

// 检查 route 和 actions 的字符串内容。
export const arePermissionsEqual = (
  p1: Permission[],
  p2: Permission[]
): boolean => {
  if (p1.length !== p2.length) {
    return false;
  }
  // 为了确保顺序不影响比较结果，可以先对数组进行排序
  const sortedP1 = [...p1].sort((a, b) => a.route.localeCompare(b.route));
  const sortedP2 = [...p2].sort((a, b) => a.route.localeCompare(b.route));

  for (let i = 0; i < sortedP1.length; i++) {
    const perm1 = sortedP1[i];
    const perm2 = sortedP2[i];

    if (perm1.route !== perm2.route) {
      return false;
    }
    // 比较 actions 数组，也要排序后比较
    const actions1 = [...perm1.actions].sort().join(",");
    const actions2 = [...perm2.actions].sort().join(",");
    if (actions1 !== actions2) {
      return false;
    }
  }
  return true;
};
