// src/router/routes.tsx
import { lazy } from "react";
import LayoutPage from "@/pages/layout/LayoutPage";

const LoginPage = lazy(() => import("@/pages/login/LoginPage"));
const ForbiddenPage = lazy(() => import("@/pages/forbidden/ForbiddenPage"));
const NotFoundPage = lazy(() => import("@/pages/notfound/NotFoundPage"));

const DashboardPage = lazy(() => import("@/pages/dashboard"));
const ProjectsPage = lazy(() => import("@/pages/projects"));
const UserPage = lazy(() => import("@/pages/system-management/user"));
const RolePage = lazy(() => import("@/pages/system-management/role"));

// 示例：定义需要权限的路由结构
export const routes = [
  {
    path: "/403",
    element: (
      <LayoutPage>
        <ForbiddenPage />
      </LayoutPage>
    ),
    meta: { public: true },
  },
  {
    path: "*",
    element: (
      <LayoutPage>
        <NotFoundPage />
      </LayoutPage>
    ),
    meta: { public: true },
  },
  {
    path: "/",
    element: <LayoutPage />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/projects",
        element: <ProjectsPage />,
      },
      {
        path: "/system-management/user",
        element: <UserPage />,
      },
      {
        path: "/system-management/role",
        element: <RolePage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    meta: { public: true },
  },
];
