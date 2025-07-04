import { createElement } from "react";
import type { ReactNode } from "react";
import { TeamOutlined, DesktopOutlined } from "@ant-design/icons";
import type { MenuItem } from "@/types";

function getItem(
  label: string,
  key: string,
  icon?: ReactNode,
  children?: MenuItem[]
) {
  return {
    key,
    icon,
    children,
    label,
  };
}

export function getMenuConfig(t: (key: string) => string): MenuItem[] {
  return [
    getItem(
      t("menu.dashboard.main"),
      "/dashboard",
      createElement(DesktopOutlined)
    ),
    getItem(
      t("menu.projects.main"),
      "/projects",
      createElement(DesktopOutlined)
    ),
    getItem(
      t("menu.systemManagement.main"),
      "/system-management",
      createElement(TeamOutlined),
      [
        getItem(t("menu.systemManagement.user"), "/system-management/user"),
        getItem(t("menu.systemManagement.role"), "/system-management/role"),
      ]
    ),
  ];
}
