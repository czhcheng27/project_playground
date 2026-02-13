import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useUserStore } from "@/store/useUserStore";
import LogoImg from "@/assets/logo.svg";
import SwitchLang from "@/components/SwitchLang";
import BgImg from "@/assets/page/login/bg.jpg";

const { Item } = Form;

interface LoginFormValues {
  identifier: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useUserStore();
  const { t } = useTranslation();

  const handleLogin = async (values: LoginFormValues) => {
    const success = await login(values);
    if (success) navigate("/dashboard");
  };

  const handleDemoLogin = async () => {
    const success = await login({ identifier: "admin", password: "admin" });
    if (success) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Hero / Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${BgImg})` }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-[#001529]/95 to-slate-900/90" />

        {/* Decorative Circles */}
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[100px]" />

        <div className="relative z-10 w-full flex flex-col justify-between p-16 text-white">
          <div className="flex items-center gap-3">
            <img src={LogoImg} alt="Logo" className="w-10 h-10" />
            <span className="text-xl font-medium tracking-wide opacity-90">
              {t("login.systemTitle")}
            </span>
          </div>

          <div className="mb-12">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              {t("login.heroTitle1")} <br />
              <span className="text-blue-400">{t("login.heroTitle2")}</span> <br />
              {t("login.heroTitle3")}
            </h1>
            <p className="text-lg text-white/60 max-w-lg leading-relaxed">
              {t("login.heroSubtitle")}
            </p>
          </div>

          <div className="text-sm text-white/30">
            {t("login.copyright")}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col relative">
        <div className="absolute top-6 right-6">
          <SwitchLang />
        </div>

        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-20">
          <div className="w-full max-w-[440px]">
            <div className="text-left mb-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                {t("login.welcomeTitle")}
                <br />
                {t("login.welcomeSubtitle")}
              </h2>
              <p className="text-slate-500">
                {t("login.credentialsPrompt")}
              </p>
            </div>

            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={handleLogin}
              className="space-y-6"
              size="large"
            >
              <Item
                name="identifier"
                rules={[
                  {
                    required: true,
                    message: t("login.usernameRequired"),
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400 mx-2" />}
                  placeholder={t("login.usernamePlaceholder")}
                  className="h-12 bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white rounded-xl transition-all"
                />
              </Item>
              <Item
                name="password"
                rules={[
                  { required: true, message: t("login.passwordRequired") },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400 mx-2" />}
                  placeholder={t("login.passwordPlaceholder")}
                  className="h-12 bg-slate-50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white rounded-xl transition-all"
                />
              </Item>

              <div className="flex items-center justify-between text-sm">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-700">
                    <input type="checkbox" className="rounded border-slate-300" />
                    <span>{t("login.rememberMe")}</span>
                  </label>
                </Form.Item>
                <a className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  {t("login.forgotPassword")}
                </a>
              </div>

              <Button
                block
                type="primary"
                htmlType="submit"
                loading={isLoggingIn}
                className="h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 border-none rounded-xl text-base font-semibold shadow-lg shadow-blue-500/30 transition-all duration-300 mt-2"
              >
                {t("settings.login")}
              </Button>
            </Form>

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-white px-2 text-slate-400">
                    {t("login.demoAccess")}
                  </span>
                </div>
              </div>

              <div
                onClick={handleDemoLogin}
                className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    A
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">
                      {t("login.adminAccount")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {t("login.fullPermissions")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                    admin / admin
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
