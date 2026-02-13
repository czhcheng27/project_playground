import React, { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import { message, Modal } from "antd";
import { useTranslation } from "react-i18next";

type ModalOptions = {
  title?: string;
  width?: number | string;
  okText?: string;
  cancelText?: string;
  footer?: React.ReactNode | null;
  showCancel?: boolean;
  onOk?: () => Promise<void>;
  okCallback?: (val?: unknown) => void;
  cancelCallback?: () => void;
};

type ConfirmResult = {
  code: number;
  data?: unknown;
};

type ContentRefType = {
  onConfirm?: () => Promise<ConfirmResult>;
};

type ModalAPI = {
  open: (node: ReactNode, opts?: ModalOptions) => void;
  close: () => void;
};

const ModalContainer = ({ setAPI }: { setAPI: (api: ModalAPI) => void }) => {
  const { t } = useTranslation();
  const contentRef = useRef<ContentRefType>(null);

  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);
  const [options, setOptions] = useState<ModalOptions>({});
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Wrap open/close in useCallback to stable references for useEffect
  const open = useCallback((node: ReactNode, opts: ModalOptions = {}) => {
    setContent(node);
    setOptions(opts);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  const handleOk = async () => {
    // If caller provides a simple onOk handler (e.g. logout modal)
    if (options.onOk) {
      try {
        setConfirmLoading(true);
        await options.onOk();

        setConfirmLoading(false);
        setVisible(false);
        // Delay callback slightly to allow UI to update (remove loading state) before navigation
        setTimeout(() => {
          options.okCallback?.(undefined);
        }, 100);
      } catch (e) {
        message.error(e instanceof Error ? e.message : String(e));
        setConfirmLoading(false);
      }
      return;
    }

    // Otherwise delegate to contentRef.onConfirm (form-based modals)
    if (!contentRef.current?.onConfirm) return;

    try {
      setConfirmLoading(true);
      const result = await contentRef.current.onConfirm();
      // Ensure result exists before accessing
      if (result && result.code === 200) {
        setVisible(false);
        options?.okCallback?.(result.data);
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : String(e));
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    setAPI({ open, close });
  }, [setAPI, open, close]);

  const translateIfString = (val?: string) =>
    typeof val === "string" ? t(val) : val;

  // Determine cancel button visibility
  const cancelButtonProps =
    options.showCancel === false
      ? { style: { display: "none" as const } }
      : undefined;

  // Determine footer
  const footerProp = options.footer === null ? null : undefined;

  return (
    <Modal
      open={visible}
      width={options.width || 600}
      title={translateIfString(options.title) || ""}
      okText={translateIfString(options.okText) || t("button.confirm")}
      cancelText={translateIfString(options.cancelText) || t("button.cancel")}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={close}
      destroyOnHidden
      closable={options.showCancel !== false}
      cancelButtonProps={cancelButtonProps}
      footer={footerProp}
    >
      <div className="border-t-gray-200 border-t-1 pt-4">
        {React.isValidElement(content)
          ? React.cloneElement(content as React.ReactElement<{ ref: React.Ref<ContentRefType> }>, {
            ref: contentRef,
          })
          : content}
      </div>
    </Modal>
  );
};

export default ModalContainer;
