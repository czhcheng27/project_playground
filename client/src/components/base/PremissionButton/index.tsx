// components/PermissionButton.tsx
import { Button, type ButtonProps } from "antd";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

type Action = "read" | "write";

interface PermissionButtonProps extends ButtonProps {
  action?: Action;
  route?: string; // 可选，支持特殊场景手动指定
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
  action,
  route,
  ...props
}) => {
  const location = useLocation();
  const permissions = useAuthStore((s) => s.permissions);

  // ① 优先使用手动传的 route
  // ② 否则使用当前页面 route
  const targetRoute = route ?? location.pathname;

  const hasPermission = permissions.some(
    (p) => p.route === targetRoute && p.actions.includes(action ?? "write")
  );

  if (!hasPermission) return null;

  return <Button {...props} />;
};
