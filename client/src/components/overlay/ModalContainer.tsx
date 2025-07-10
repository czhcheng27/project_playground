import React, { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { message, Modal } from "antd";
import { useTranslation } from "react-i18next";

type ModalOptions = {
  title?: string;
  width?: number | string;
  okText?: string;
  cancelText?: string;
  footer?: React.ReactNode | null;
  props?: object;
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

const ModalContainer = ({ setAPI }: { setAPI: (api: any) => void }) => {
  const { t } = useTranslation();
  const contentRef = useRef<ContentRefType>(null);

  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<ModalOptions>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  const open = (node: ReactNode, opts: ModalOptions = {}) => {
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

  return (
    <Modal
      open={visible}
      width={options.width || 600}
      title={translateIfString(options.title) || ""}
      okText={translateIfString(options.okText) || t("button.confirm")}
      cancelText={translateIfString(options.cancelText) || t("button.cancel")}
      confirmLoading={confirmLoading}
      onOk={onOk}
      onCancel={close}
      destroyOnHidden
      footer={options.footer === null ? null : undefined}
    >
      <div className="border-t-gray-200 border-t-1 pt-4">
        {React.isValidElement(content)
          ? React.cloneElement(content as any, {
              ref: contentRef,
            })
          : content}
      </div>
    </Modal>
  );
};

export default ModalContainer;
