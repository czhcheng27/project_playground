import React from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.scss"; // 放在最顶层，确保SSR时注入

export const metadata = {
  title: "Project Playground",
  icons: {
    icon: "/favicon.ico",
  },
};

const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <head>
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    </head>
    <body>
      <AntdRegistry>{children}</AntdRegistry>
    </body>
  </html>
);

export default RootLayout;
