import React, { createRef } from "react";
import { createRoot } from "react-dom/client";
import InfoModal from "./InfoModal";
import type { InfoModalRef, InfoModalProps } from "./InfoModal";

// ref 创建
const modalRef = createRef<InfoModalRef>();

// 创建容器 DOM
const container = document.createElement("div");
document.body.appendChild(container);

// 渲染组件
const root = createRoot(container);
root.render(React.createElement(InfoModal, { ref: modalRef }));

// 封装控制函数
export const openInfoModal = (props: InfoModalProps) => {
  modalRef.current?.open(props);
};

export const closeInfoModal = () => {
  modalRef.current?.close();
};
