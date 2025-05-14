"use client";
import { useEffect, useState } from "react";
import styles from "./Header.module.scss";
import { usePathname } from "next/navigation";
export default function Header() {
  const pathname = usePathname();

  const [title, setTitle] = useState<string>("dashboard");

  useEffect(() => {
    formatTitle();
  }, [pathname]);

  const formatTitle = () => {
    const str = pathname.split("/").slice(-1)[0];
    setTitle(str);
  };

  return (
    <div style={{ background: "white" }} className={styles.header_wrapper}>
      {/* left title */}
      <span className={styles.header_title}>{title}</span>

      {/* right part */}
      <div className={styles.head_top}></div>
    </div>
  );
}
