import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useTranslation } from "react-i18next";
import { Form, Input, message, Select } from "antd";
import { apiUpsertUser } from "@/api/user";

const { Item } = Form;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

interface UpsertUserFormProps {
  initFormData?: any;
  type?: "edit" | "create";
  dictData: {
    [key: string]: object[];
  };
}

const UpsertUserForm: React.FC<UpsertUserFormProps> = forwardRef(
  (props, ref) => {
    const { dictData, initFormData, type } = props;
    const [form] = Form.useForm();
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      async onConfirm() {
        try {
          const formValues = await form.validateFields();
          const createParams = { ...formValues, password: formValues.username };
          const result = await upsertUser({
            ...createParams,
            id: type === "edit" ? initFormData.id : "",
          });
          return result;
        } catch (e) {
          const err = e as { errorFields?: { errors?: string[] }[] };
          const firstErrorMsg = err?.errorFields?.[0]?.errors?.[0];
          throw new Error(firstErrorMsg || "Validation Failed");
        }
      },
    }));

    useEffect(() => {
      if (initFormData) {
        form.setFieldsValue(initFormData);
      }
    }, []);

    const upsertUser = async (
      data: any
    ): Promise<{ code: number; data: any }> => {
      try {
        await apiUpsertUser(data);
        message.success("Operation Successfully");
        return { code: 200, data };
      } catch (e) {
        throw new Error(t("fetch.networkErr"));
      }
    };

    return (
      <Form
        form={form}
        {...formItemLayout}
        autoComplete="off"
        scrollToFirstError
      >
        <Item
          name="username"
          label={t("page.userManagement.username")}
          rules={[{ required: true, message: "Please enter your username!" }]}
        >
          <Input autoComplete="off" />
        </Item>
        <Item
          name="email"
          label={t("page.userManagement.email")}
          rules={[
            { type: "email", message: "Please enter a valid email!" },
            { required: true, message: "Please enter your email!" },
          ]}
        >
          <Input autoComplete="off" />
        </Item>
        <Item
          name="roles"
          label={t("page.userManagement.role")}
          rules={[{ required: true, message: "Please select your role" }]}
        >
          <Select mode="multiple" options={dictData.roles} />
        </Item>
      </Form>
    );
  }
);

export default UpsertUserForm;
