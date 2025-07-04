import type { JSX } from "react";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { RouteGuard } from "./guard";

type RouteMeta = {
  public?: boolean;
  roles?: string[];
};

export interface AppRoute {
  path: string;
  element: JSX.Element;
  children?: AppRoute[];
  meta?: RouteMeta;
}

const Router = () => {
  const wrapRoutes = (routes: AppRoute[]): AppRoute[] => {
    return routes.map(({ path, element, meta, children, ...rest }) => {
      const isPublic = meta?.public;

      return {
        ...rest,
        path,
        element: isPublic ? (
          element
        ) : (
          <RouteGuard element={element} path={path} meta={meta} />
        ),
        children: children ? wrapRoutes(children) : undefined,
      };
    });
  };

  const processedRoutes = wrapRoutes(routes);
  return useRoutes(processedRoutes);
};

export default Router;
