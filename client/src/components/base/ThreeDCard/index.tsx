import { type CSSProperties } from "react";
import "./index.module..less";

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

const ThreeDCard = ({
  children,
  className = "",
  style = {},
  onClick,
}: ThreeDCardProps) => {
  return (
    <div className="hover-3d" style={style} onClick={onClick}>
      <div className={className}>{children}</div>
      {/* 8个透明的hover区域 (3x3网格，跳过中心)，用于检测鼠标位置 */}
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

export default ThreeDCard;
