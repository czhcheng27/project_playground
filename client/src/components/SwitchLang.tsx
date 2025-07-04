import { Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";
import { GlobalOutlined } from "@ant-design/icons";
import { useLanguageStore } from "@/store/useLanguageStore";

const items: MenuProps["items"] = [
  {
    key: "en",
    label: "English",
  },
  {
    key: "zh",
    label: "中文",
  },
];

const SwitchLang = () => {
  const { language, setLanguage } = useLanguageStore();
  const { i18n } = useTranslation();

  const changeLanguage = (lng: "en" | "zh") => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  return (
    <Dropdown
      menu={{
        items,
        selectable: true,
        selectedKeys: [language],
        onClick: (e) => changeLanguage(e.key as "en" | "zh"),
      }}
    >
      <Typography.Link>
        <Space>
          <GlobalOutlined />
        </Space>
      </Typography.Link>
    </Dropdown>
  );
};

export default SwitchLang;
