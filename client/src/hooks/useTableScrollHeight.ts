import { useEffect, useRef, useState } from "react";

/**
 * 自动根据容器计算 scroll.y 高度
 * @param extraHeight 需要从容器高度中减去的额外高度（例如顶部按钮、分页器等）默认 55px 是表头高度
 */
export function useTableScrollHeight(extraHeight = 55) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(400); // 默认值防止初始 undefined

  useEffect(() => {
    const updateScrollY = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setScrollY(height - extraHeight);
      }
    };

    updateScrollY();
    window.addEventListener("resize", updateScrollY);
    return () => window.removeEventListener("resize", updateScrollY);
  }, [extraHeight]);

  return { containerRef, scrollY };
}
