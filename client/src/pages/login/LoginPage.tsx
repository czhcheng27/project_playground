import { useNavigate } from "react-router-dom";
import { Button, Form, Input } from "antd";
import { useTranslation } from "react-i18next";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useUserStore } from "@/store/useUserStore";
import LogoImg from "@/assets/ott.svg";
import SwitchLang from "@/components/SwitchLang";

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

  return (
    <div className="w-screen min-h-screen flex items-center justify-center flex-col gap-4 bg-[linear-gradient(45deg,#463e41,#4b3c40,#504237)]">
      <div className="w-10/12 sm:w-96">
        <div className="w-full flex items-center justify-center mb-8">
          <img className="w-11 h-11 mr-4" src={LogoImg} alt="Logo" />
          <span className="text-4xl font-semibold text-white">
            OTT PAY System
          </span>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={handleLogin}
          className="space-y-6"
        >
          <Item
            name="identifier"
            rules={[
              { required: true, message: "Please input your Username/Email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username/Email" />
          </Item>
          <Item
            name="password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input
              prefix={<LockOutlined />}
              type="password"
              placeholder="Password"
            />
          </Item>

          <Item>
            <Button
              block
              type="primary"
              htmlType="submit"
              loading={isLoggingIn}
            >
              {t("settings.login")}
            </Button>
          </Item>
        </Form>
        <div className="text-center text-s text-white mt-10">
          Admin Account - username: admin | password: admin
        </div>
      </div>

      <div className="absolute top-4 right-4">
        <SwitchLang />
      </div>
    </div>
  );
};

export default LoginPage;
