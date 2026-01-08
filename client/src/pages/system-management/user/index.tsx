import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Table, Pagination, message } from "antd";
import type { TableColumnsType, PaginationProps } from "antd";
import { useOverlay } from "@/components/overlay/OverlayProvider";
import { useTableScrollHeight } from "@/hooks/useTableScrollHeight";
import { openInfoModal } from "@/components/base/InfoModal";
import { apiGetUserList, apiDeleteUser, apiResetPwd } from "@/api/user";
import { formatDateTime } from "@/utils/date";
import UpsertUserForm from "./UpsertUserForm";

interface DataType {
  id: string;
  username: string;
  status: string;
  roleText: string;
  createdAt: string;
  updatedAt: string;
}

const UserPage = () => {
  const { t } = useTranslation();
  const columns: TableColumnsType<DataType> = [
    {
      title: t("page.userManagement.username"),
      dataIndex: "username",
      width: 150,
    },
    {
      title: t("page.userManagement.email"),
      dataIndex: "email",
      width: 150,
    },
    {
      title: t("page.userManagement.status"),
      dataIndex: "status",
      width: 150,
    },
    {
      title: t("page.userManagement.role"),
      width: 150,
      render: (value) => {
        return value.roles.join(" & ");
      },
    },
    {
      title: t("page.userManagement.createdAt"),
      dataIndex: "createdAt",
      width: 200,
      render: (value) => formatDateTime(value),
    },
    {
      title: t("page.userManagement.updatedAt"),
      dataIndex: "updatedAt",
      width: 200,
      render: (value) => formatDateTime(value),
    },
    {
      title: t("text.operation"),
      fixed: "right",
      width: 300,
      render: (value) => (
        <>
          {value.email === "admin" ? null : (
            <>
              <Button
                type="link"
                onClick={() => {
                  modal.open(
                    <UpsertUserForm
                      dictData={dictData}
                      initFormData={value}
                      type="edit"
                    />,
                    {
                      title: "text.editUser",
                      width: 600,
                      okCallback,
                    }
                  );
                }}
              >
                {t("button.edit")}
              </Button>
              <Button
                type="link"
                danger
                onClick={() => {
                  openInfoModal({
                    i18n: true,
                    title: "button.reset_pwd",
                    message: "modal.infoModal.reset_pwd_msg",
                    onOk: async () => await resetPwd(value.id),
                  });
                }}
              >
                {t("button.reset_pwd")}
              </Button>
              <Button
                type="link"
                danger
                onClick={() => {
                  openInfoModal({
                    i18n: true,
                    onOk: async () => await deleteUser(value.id),
                  });
                }}
              >
                {t("button.delete")}
              </Button>
            </>
          )}
        </>
      ),
    },
  ];

  const [curPage, setCurPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [dictData, setDictData] = useState({});

  const { containerRef, scrollY } = useTableScrollHeight();

  const { modal } = useOverlay();

  useEffect(() => {
    setDictData({
      roles: [
        { label: "Admin", value: "admin" },
        { label: "Manager", value: "manager" },
      ],
    });
  }, []);

  useEffect(() => {
    getUserList(curPage, pageSize);
  }, [curPage, pageSize]);

  const getUserList = (page: number, pageSize: number) => {
    apiGetUserList({ page, pageSize }).then((res: any) => {
      setTableData(res.data.users || []);
      setTotal(res?.data?.total ?? 0);
    });
  };

  const onChange: PaginationProps["onChange"] = (page) => {
    setCurPage(page);
  };

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
    _,
    pageSize
  ) => {
    setPageSize(pageSize);
  };

  const handleAddUser = () => {
    modal.open(<UpsertUserForm dictData={dictData} />, {
      title: "text.addUser",
      width: 600,
      okCallback,
    });
  };

  const okCallback = () => {
    getUserList(curPage, pageSize);
  };

  const deleteUser = async (id: string) => {
    try {
      const res: any = await apiDeleteUser(id);
      if (res.code !== 200) {
        throw new Error(t("message.del_failed"));
      }

      message.success("Delete Successfully");
      getUserList(curPage, pageSize);
    } catch (_) {
      throw new Error(t("message.del_failed"));
    }
  };

  const resetPwd = async (id: string) => {
    console.log(`resetPwd`, id);
    const res: any = await apiResetPwd(id);
    if (res.code !== 200) {
      throw new Error(t("message.normal_failed"));
    }
    message.success(t("message.reset_pwd_success"));
  };

  return (
    <>
      <div className="flex justify-end items-center mb-4">
        <Button type="primary" onClick={handleAddUser}>
          {t("text.addUser")}
        </Button>
      </div>

      <div ref={containerRef} className="h-[calc(100%-100px)]">
        <Table<DataType>
          dataSource={tableData}
          columns={columns}
          rowKey="id"
          scroll={{ x: "max-content", y: scrollY }}
          pagination={false}
        />
      </div>

      <div className="flex justify-end mt-4">
        <Pagination
          total={total}
          showSizeChanger
          showQuickJumper
          showTotal={(total) => `Total ${total} items`}
          onChange={onChange}
          onShowSizeChange={onShowSizeChange}
        />
      </div>
    </>
  );
};

export default UserPage;
