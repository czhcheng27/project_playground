"use client";
import { useState, useEffect } from "react";
import { Layout } from "antd";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import styles from "./layout.module.scss";

const COLLAPSED_WIDTH = 992;
const { Content, Footer, Sider } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const resizeHandler = () => {
    const rect: DOMRect = document.body.getBoundingClientRect();
    const value = rect.width - 1 < COLLAPSED_WIDTH;
    setCollapsed(value);
  };

  useEffect(() => {
    window.addEventListener("resize", resizeHandler, false);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <Layout style={{ height: "100vh" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Sidebar collapsed={collapsed} />
      </Sider>
      <Layout style={{ height: "100%" }}>
        <Header />
        <Content className={styles.content}>
          <div className={styles.content_wrapper}>{children}</div>
        </Content>
        <Footer style={{ textAlign: "center", padding: "0px 50px 16px 50px" }}>
          Develop By Michael Cheng
        </Footer>
      </Layout>
    </Layout>
  );
}
