import type { ReactNode } from "react";
import {
  FundProjectionScreenOutlined,
  AreaChartOutlined,
  MergeCellsOutlined,
} from "@ant-design/icons";

// 为菜单项定义类型
interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
}

function getItem(
  label: string,
  key: string,
  icon?: ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    label,
    key: "/admin" + key,
    icon,
    children,
  };
}

export const menuItems: MenuItem[] = [
  getItem("Dashboard", "/dashboard", <FundProjectionScreenOutlined />),
  getItem("Large Screen", "/large-screen", <AreaChartOutlined />),
  getItem("Online Editor", "/online-editor", <MergeCellsOutlined />),
];
