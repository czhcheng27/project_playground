import React, { useState, type ReactNode } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { useTranslation } from "react-i18next";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { getMenuConfig } from "@/config/menuConfig";
import { useUserStore } from "@/store/useUserStore";
import SwitchLang from "@/components/SwitchLang";
import { useAuthStore } from "@/store/useAuthStore";
import { filterMenuByPermissions } from "@/utils/auth";
import LogoImg from "@/assets/react.svg";

const { Sider, Content, Header } = Layout;

interface LayoutProps {
  children?: ReactNode;
}

const LayoutPage: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [collapsed, setCollapsed] = useState(false);

  const { permissions } = useAuthStore();
  // const { logout } = useUserStore();
  const menuConfig = filterMenuByPermissions(getMenuConfig(t), permissions);

  console.log(`menuConfig`, menuConfig);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const openKey = menuConfig?.find((obj) =>
    obj.children?.find((cItem) => cItem.key === location.pathname)
  );

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const logoutFunc = async () => {
    // logout();
    navigate("/login");
  };

  return (
    <Layout className="h-screen w-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} width={256}>
        <Link
          to="/"
          className={`h-15 w-full flex items-center transition-all duration-300 ease-in-out ${
            collapsed ? "justify-center" : "justify-evenly pl-2 pr-4"
          }`}
        >
          <img src={LogoImg} className="w-8 h-8" alt="logo" />

          {!collapsed && (
            <span className="ml-2 text-white font-bold text-xl whitespace-nowrap">
              Admin System
            </span>
          )}
        </Link>

        <Menu
          theme="dark"
          mode="inline"
          defaultOpenKeys={[openKey?.key as string]}
          selectedKeys={[location.pathname]}
          items={menuConfig}
          onClick={(e) => {
            navigate(e.key);
          }}
        />
      </Sider>
      <Layout>
        <Header className="!bg-white !pl-0 !pr-4 flex items-center justify-between px-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <div className="flex items-center gap-4">
            <Button type="link">devtesting</Button>
            <SwitchLang />
            <Button type="link" onClick={logoutFunc} style={{ width: 88 }}>
              {t("settings.logout")}
            </Button>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 12,
            minHeight: 280,
            overflow: "auto",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children || <Outlet />}
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
