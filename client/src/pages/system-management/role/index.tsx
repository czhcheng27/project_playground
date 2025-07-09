import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Table, Pagination, message } from "antd";
import type { TableColumnsType, PaginationProps } from "antd";
import { useOverlay } from "@/components/overlay/OverlayProvider";
import { useTableScrollHeight } from "@/hooks/useTableScrollHeight";
import { openInfoModal } from "@/components/base/InfoModal";
import { apiDeleteUser } from "@/api/user";
import { formatDateTime } from "@/utils/date";
import { apiGetRoleList } from "@/api/role";
// import UpsertUserForm from "./UpsertUserForm";

interface DataType {
  id: string;
  username: string;
  status: string;
  roleText: string;
  createdAt: string;
  updatedAt: string;
}

const RolePage = () => {
  const { t } = useTranslation();
  const columns: TableColumnsType<DataType> = [
    {
      title: t("page.roleManagement.roleName"),
      dataIndex: "roleName",
      width: 150,
    },
    {
      title: t("page.roleManagement.description"),
      dataIndex: "description",
      width: 300,
    },
    {
      title: t("page.roleManagement.createdAt"),
      dataIndex: "createdAt",
      width: 200,
      render: (value) => formatDateTime(value),
    },
    {
      title: t("page.roleManagement.updatedAt"),
      dataIndex: "updatedAt",
      width: 200,
      render: (value) => formatDateTime(value),
    },
    {
      title: t("text.operation"),
      fixed: "right",
      width: 200,
      render: (value) => (
        <>
          <Button
            type="link"
            onClick={() => {
              // modal.open(
              //   <UpsertUserForm
              //     dictData={dictData}
              //     initFormData={value}
              //     type="edit"
              //   />,
              //   {
              //     title: "text.editUser",
              //     width: 600,
              //     okCallback,
              //   }
              // );
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
                onOk: async () => await deleteUser(value.id),
              });
            }}
          >
            {t("button.delete")}
          </Button>
        </>
      ),
    },
  ];

  const [curPage, setCurPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState([]);

  const { containerRef, scrollY } = useTableScrollHeight();

  const { modal } = useOverlay();

  useEffect(() => {
    getRoleList(curPage, pageSize);
  }, [curPage, pageSize]);

  const getRoleList = (page: number, pageSize: number) => {
    apiGetRoleList({ page, pageSize }).then((res: any) => {
      setTableData(res.data.roles || []);
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
    // modal.open(<UpsertUserForm dictData={dictData} />, {
    //   title: "text.addUser",
    //   width: 600,
    //   okCallback,
    // });
  };

  const okCallback = () => {
    getRoleList(curPage, pageSize);
  };

  const deleteUser = async (id: string) => {
    try {
      const res: any = await apiDeleteUser(id);
      if (res.code !== 200) {
        throw new Error(t("message.del_failed"));
      }

      message.success("Delete Successfully");
      getRoleList(curPage, pageSize);
    } catch (_) {
      throw new Error(t("message.del_failed"));
    }
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

export default RolePage;
