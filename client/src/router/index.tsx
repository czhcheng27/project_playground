// src/router/index.tsx
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";

const Router = () => {
  // 直接渲染路由树，不要在这里做权限接口调用
  return useRoutes(routes);
};

export default Router;
