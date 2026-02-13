import React, { Suspense, useState, type ReactNode } from "react";
import { Button, Layout, Menu, Spin, theme, Avatar, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { getMenuConfig } from "@/config/menuConfig";
import SwitchLang from "@/components/SwitchLang";
import { useOverlay } from "@/components/overlay/OverlayProvider";
import { PermissionGuard } from "@/router/PermissionGuard";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
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
  const { modal } = useOverlay();

  const [collapsed, setCollapsed] = useState(false);

  const { permissions } = useAuthStore();
  const { userInfo, logout } = useUserStore();
  const menuConfig = filterMenuByPermissions(getMenuConfig(t), permissions);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const openKey = menuConfig?.find((obj) =>
    obj.children?.find((cItem) => cItem.key === location.pathname),
  );

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const openLogoutModal = () => {
    modal.open(<div>{t("settings.logoutConfirm")}</div>, {
      title: t("settings.logout"),
      width: 400,
      showCancel: false,
      onOk: async () => {
        await logout();
      },
      okCallback: () => {
        navigate("/login");
      },
    });
  };

  return (
    <Layout className="h-screen w-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} width={256}>
        <Link
          to="/"
          className={`h-15 w-full flex items-center transition-all duration-300 ease-in-out ${collapsed ? "justify-center" : "justify-evenly pl-2 pr-4"
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
        <Header
          className="!bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between !px-6 sticky top-0 z-10 transition-all duration-300"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapsed}
            style={{
              fontSize: "16px",
              width: 48,
              height: 48,
            }}
            className="hover:bg-slate-100 text-slate-500"
          />
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-slate-50 transition-all duration-300 cursor-default group select-none border border-transparent hover:border-slate-100">
              <Avatar
                size="small"
                className="bg-gradient-to-tr from-blue-500 to-indigo-500 shadow-sm group-hover:shadow-md transition-all duration-300"
                icon={<UserOutlined />}
              >
                {userInfo?.username?.[0]?.toUpperCase()}
              </Avatar>
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-semibold text-slate-700 leading-none group-hover:text-blue-600 transition-colors">
                  {userInfo?.username}
                </span>
                <span className="text-[10px] text-slate-400 leading-none mt-1 uppercase tracking-wide">
                  {userInfo?.role || "User"}
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            <SwitchLang />

            <Tooltip title={t("settings.logout")}>
              <Button
                type="text"
                shape="circle"
                icon={<LogoutOutlined />}
                onClick={openLogoutModal}
                className="!text-slate-400 hover:!text-red-500 hover:!bg-red-50 transition-all duration-300"
              />
            </Tooltip>
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
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="flex-1 flex flex-col">
            <Suspense
              fallback={
                <div className="flex-1 flex items-center justify-center">
                  <Spin />
                </div>
              }
            >
              {children || (
                <PermissionGuard key={location.pathname}>
                  <Outlet />
                </PermissionGuard>
              )}
            </Suspense>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutPage;
