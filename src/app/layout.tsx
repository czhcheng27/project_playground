import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.scss"; // 放在最顶层，确保SSR时注入

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <AntdRegistry>{children}</AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
