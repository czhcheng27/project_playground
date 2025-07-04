import { Spin } from "antd";
import clsx from "clsx";

const Loading = ({ fullPage = false }) => {
  return (
    <div
      className={clsx("flex items-center justify-center", {
        "h-screen": fullPage,
        "h-full": !fullPage,
      })}
    >
      <Spin />
    </div>
  );
};

export default Loading;
