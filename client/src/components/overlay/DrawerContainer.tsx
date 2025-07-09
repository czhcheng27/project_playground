import React, { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Space, Button, Drawer } from "antd";
import { useTranslation } from "react-i18next";

type DrawerOptions = {
  title?: string;
  width?: number;
  customizedBtns?: ReactNode | null;
};

type ConfirmResult = {
  code: number;
  data: any;
};

type ContentRefType = {
  onConfirm?: () => Promise<ConfirmResult>;
};

const DrawerContainer = ({ setAPI }: { setAPI: (api: any) => void }) => {
  const { t } = useTranslation();
  const contentRef = useRef<ContentRefType>(null);

  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<DrawerOptions>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  const open = (node: ReactNode, opts: any = {}) => {
    setContent(node);
    setOptions(opts);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  useEffect(() => {
    setAPI({ open, close });
  }, []);

  const translateIfString = (val?: string) =>
    typeof val === "string" ? t(val) : val;

  const defaultExtraBtns = (
    <Space>
      <Button onClick={close}>{t("button.cancel")}</Button>
      <Button type="primary" onClick={close}>
        OK
      </Button>
    </Space>
  );

  return (
    <Drawer
      open={visible}
      title={translateIfString(options.title) || ""}
      width={options.width || 500}
      closable={false}
      onClose={close}
      destroyOnHidden
      extra={options.customizedBtns ?? defaultExtraBtns}
    >
      {React.isValidElement(content)
        ? React.cloneElement(content as any, {
            ref: contentRef,
          })
        : content}
    </Drawer>
  );
};

export default DrawerContainer;
