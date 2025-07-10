import React, { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Space, Button, Drawer, message } from "antd";
import { useTranslation } from "react-i18next";

type DrawerOptions = {
  title?: string;
  width?: number | string;
  okText?: string;
  cancelText?: string;
  customizedBtns?: ReactNode | null;
  okCallback?: (val: any) => void;
  cancelCallback?: () => void;
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

  const onOk = async () => {
    if (!contentRef.current?.onConfirm) return;

    try {
      setConfirmLoading(true);
      const { code, data } = await contentRef.current.onConfirm();
      if (code === 200) {
        setVisible(false);
        options?.okCallback?.(data);
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    setAPI({ open, close });
  }, []);

  const translateIfString = (val?: string) =>
    typeof val === "string" ? t(val) : val;

  const defaultExtraBtns = (
    <Space>
      <Button onClick={close}>
        {translateIfString(options.okText) || t("button.cancel")}
      </Button>
      <Button type="primary" loading={confirmLoading} onClick={onOk}>
        {translateIfString(options.cancelText) || t("button.confirm")}
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
