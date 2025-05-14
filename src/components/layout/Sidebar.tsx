"use client";

import React from "react";
import { Menu } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { menuItems } from "@/config/menu.config";
import logo from "@/assets/logo.png";
import Image from "next/image";
import styles from "./Sidebar.module.scss";

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const pathname = usePathname();
  const router = useRouter();

  // 查找需要展开的子菜单（如果有）
  const openKey = menuItems?.find((obj) =>
    obj?.children?.find((cItem) => cItem?.key === pathname)
  );

  return (
    <div className={styles.left_nav}>
      <Link href="/" className={styles.left_nav_header}>
        <Image
          className="App-logo"
          src={logo}
          alt="logo"
          width={40}
          height={40}
        />
        {!collapsed && <h1>OA System</h1>}
      </Link>

      <Menu
        theme="dark"
        defaultOpenKeys={openKey ? [openKey.key as string] : []}
        selectedKeys={[pathname]}
        mode="inline"
        items={menuItems}
        onClick={(e) => {
          router.push(e.key);
        }}
      />
    </div>
  );
};

export default Sidebar;
