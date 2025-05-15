"use client";
import { useEffect, useState, useCallback } from "react";
import styles from "./Header.module.scss";
import { usePathname } from "next/navigation";
export default function Header() {
  const pathname = usePathname();

  const [title, setTitle] = useState<string>("dashboard");

  const formatTitle = useCallback(() => {
    const str = pathname.split("/").slice(-1)[0];
    setTitle(str);
  }, [pathname]);

  useEffect(() => {
    formatTitle();
  }, [formatTitle]);

  return (
    <div style={{ background: "white" }} className={styles.header_wrapper}>
      {/* left title */}
      <span className={styles.header_title}>{title}</span>

      {/* right part */}
      <div className={styles.head_top}></div>
    </div>
  );
}
