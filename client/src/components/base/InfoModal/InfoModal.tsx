import { forwardRef, useImperativeHandle, useState } from "react";
import { message, Modal } from "antd";
import { useTranslation } from "react-i18next";
import InfoIcon from "./info-circle-fill.png";
import DeleteIcon from "./red_del.png";

type InfoTypes = "confirm" | "delete";

// props 类型
export interface InfoModalProps {
  type?: InfoTypes;
  title?: string;
  message?: string;
  okText?: string;
  cssName?: any;
  i18n?: boolean;
  onOk?: () => Promise<void> | void;
}

// ref 暴露类型
export interface InfoModalRef {
  open: (opts: InfoModalProps) => void;
  close: () => void;
}

const defaultOptions: InfoModalProps = {
  type: "delete",
  i18n: false,
  title: "modal.infoModal.del_title",
  message: "modal.infoModal.del_msg",
  okText: "button.confirm",
};

const InfoModal = forwardRef<InfoModalRef, {}>((_, ref) => {
  const { t } = useTranslation();

  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<InfoModalProps>(defaultOptions);

  const isConfirm = options.type === "confirm";

  const wrapClassName = `${
    isConfirm ? "confirm_modal_wrapper" : "delete_modal_wrapper"
  } ${options.cssName}`;

  useImperativeHandle(ref, () => ({
    open: (opts: InfoModalProps) => {
      const translateIfNeeded = (val: string | undefined) =>
        opts.i18n && val ? t(val) : val;

      const merged = { ...defaultOptions, ...opts };

      setOptions({
        ...merged,
        title: translateIfNeeded(merged.title),
        message: translateIfNeeded(merged.message),
        okText: translateIfNeeded(merged.okText),
      });
      setVisible(true);
    },
    close: () => setVisible(false),
  }));

  return (
    <Modal
      open={visible}
      onOk={async () => {
        try {
          await options.onOk?.();
          setVisible(false);
        } catch (e) {
          message.error((e as Error)?.message || "Action Failed");
        }
      }}
      onCancel={() => setVisible(false)}
      okText={options.okText || t("button.confirm")}
      cancelButtonProps={{ style: { display: "none" } }}
      wrapClassName={wrapClassName}
      okButtonProps={{
        danger: !isConfirm,
      }}
    >
      <div>
        <div className="text-gray-600 text-lg font-bold h-6">
          <img
            src={isConfirm ? InfoIcon : DeleteIcon}
            className="float-left w-6 mr-2"
          />
          <p>{options.title}</p>
        </div>
        <div className="text-gray-500 text-sm pl-8 mt-4">{options.message}</div>
      </div>
    </Modal>
  );
});

export default InfoModal;
