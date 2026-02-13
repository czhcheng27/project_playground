import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { GlobalOutlined, DownOutlined, CheckOutlined } from "@ant-design/icons";
import { useLanguageStore } from "@/store/useLanguageStore";

const SwitchLang = () => {
  const { language, setLanguage } = useLanguageStore();
  const { i18n } = useTranslation();

  const changeLanguage = (lng: "en" | "zh") => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  const languages = [
    { key: "en", label: "English" },
    { key: "zh", label: "中文" },
  ];

  return (
    <div className="group relative z-50">
      <button className="flex items-center justify-between w-32 px-4 py-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md border border-slate-200 transition-all duration-300 text-slate-600 hover:text-slate-900 shadow-sm hover:shadow-md">
        <div className="flex items-center gap-2">
          <GlobalOutlined className="text-lg text-slate-500 group-hover:text-slate-700 transition-colors" />
          <span className="text-xs font-semibold tracking-wider">
            {language === "en" ? "English" : "中文"}
          </span>
        </div>
        <DownOutlined className="text-[10px] text-slate-400 group-hover:text-slate-600 group-hover:rotate-180 transition-all duration-300" />
      </button>

      <div className="absolute right-0 top-full mt-2 w-32 bg-white/90 backdrop-blur-xl border border-slate-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden py-1 shadow-xl transform origin-top-right scale-95 group-hover:scale-100 ring-1 ring-black/5">
        {languages.map((lang) => (
          <button
            key={lang.key}
            onClick={() => changeLanguage(lang.key as "en" | "zh")}
            className={clsx(
              "w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium transition-colors hover:bg-slate-50 text-left",
              language === lang.key
                ? "text-blue-600 bg-blue-50/50"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {lang.label}
            {language === lang.key && <CheckOutlined className="text-blue-600" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SwitchLang;
