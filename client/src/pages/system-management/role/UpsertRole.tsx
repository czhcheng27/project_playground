import React, {
  useState,
  useEffect,
  useImperativeHandle,
  useMemo,
  forwardRef,
} from "react";
import { t } from "i18next";
import { Form, Input, Tree, Checkbox, Button, Space, message } from "antd";
import type { DataNode, TreeProps } from "antd/lib/tree"; // 导入类型
import type { CheckboxChangeEvent } from "antd/es/checkbox";
import { getMenuConfig } from "@/config/menuConfig";
import { apiUpsertRole } from "@/api/role";

// --- 类型定义 ---
interface UpsertRoleProps {
  initData?: {
    id?: string;
    roleName: string;
    description?: string;
    permissions?: { route: string; actions: ("read" | "write")[] }[];
  };
  type?: "edit" | "create";
}

// 菜单项类型，和 mockMenuList 结构一致
interface MenuItem {
  key: string;
  label: string;
  children?: MenuItem[];
}

// 权限配置的前端内部状态类型
interface PermissionConfigItem {
  route: string;
  actions: ("read" | "write")[];
  // 不需要 checked 字段，Tree 组件的 checkedKeys 足够了
}

// 通过 ref 暴露给父组件的方法类型
export interface UpsertRoleRef {
  onConfirm: () => Promise<any>;
}

const UpsertRole = forwardRef<UpsertRoleRef, UpsertRoleProps>((props, ref) => {
  const routeConfig = getMenuConfig(t);
  const { initData, type } = props;

  const [form] = Form.useForm(); // 创建表单实例

  // --- State 定义 ---
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]); // Tree 组件已勾选的节点 key 数组
  const [currentPermissionsMap, setCurrentPermissionsMap] = useState<
    Map<string, ("read" | "write")[]>
  >(new Map()); // 存储所有路由的权限配置，key 为 route 路径

  // --- 暴露给父组件的方法 ---
  useImperativeHandle(ref, () => ({
    onConfirm: async () => {
      try {
        const values = await form.validateFields();
        // 转换权限数据为后端期望的格式
        const permissions: PermissionConfigItem[] = [];
        currentPermissionsMap.forEach((actions, route) => {
          // 只提交那些被勾选的路由对应的权限
          if (checkedKeys.includes(route)) {
            permissions.push({ route, actions });
          }
        });

        // 返回合并后的数据
        const params = {
          ...values,
          permissions,
          id: type === "edit" ? initData?.id : "",
        };

        const result = UpsertRoleFunc(params);

        return result;
      } catch (error: any) {
        const errorText = error.errorFields[0].errors[0];
        throw errorText;
      }
    },
  }));

  const UpsertRoleFunc = async (params: any) => {
    try {
      await apiUpsertRole(params);
      message.success("Operation Successfully");
      return { code: 200, params };
    } catch (e) {
      throw new Error(t("fetch.networkErr"));
    }
  };

  // --- 菜单数据处理 ---
  // 将 mockMenuList 转换为 Ant Design Tree 组件所需的 DataNode 格式
  const transformMenuItemsToTreeData = (items: MenuItem[]): DataNode[] => {
    return items.map((item) => {
      const node: DataNode = {
        key: item.key,
        title: item.label,
        children: item.children
          ? transformMenuItemsToTreeData(item.children)
          : undefined,
      };
      return node;
    });
  };

  const menuTreeData = useMemo(
    () => transformMenuItemsToTreeData(routeConfig),
    [routeConfig]
  );

  // 获取所有叶子节点的 key (即所有可配置权限的路由)
  const allLeafKeys = useMemo(() => {
    const keys: string[] = [];
    const collectLeafKeys = (nodes: MenuItem[]) => {
      nodes.forEach((node) => {
        if (!node.children || node.children.length === 0) {
          keys.push(node.key);
        } else {
          collectLeafKeys(node.children);
        }
      });
    };
    collectLeafKeys(routeConfig);
    return keys;
  }, [routeConfig]);

  // --- 初始化逻辑 (根据 initData) ---
  useEffect(() => {
    if (initData) {
      // 设置表单初始值
      form.setFieldsValue({
        id: initData.id,
        roleName: initData.roleName,
        description: initData.description,
      });

      // 初始化权限数据
      const initialPermissionsMap = new Map<string, ("read" | "write")[]>();
      const initialCheckedKeys: React.Key[] = [];

      initData.permissions?.forEach((p) => {
        initialPermissionsMap.set(p.route, p.actions);
        initialCheckedKeys.push(p.route); // 勾选对应的路由节点
      });

      setCurrentPermissionsMap(initialPermissionsMap);
      setCheckedKeys(initialCheckedKeys);

      // Antd Tree 组件的 defaultCheckedKeys 是非受控的，
      // 所以我们用 setCheckedKeys 来控制。
      // 对于半选状态，Antd Tree 会根据 checkedKeys 自动计算，我们无需手动设置 halfCheckedKeys
    } else {
      // 创建模式下，清空表单和权限
      form.resetFields();
      setCurrentPermissionsMap(new Map());
      setCheckedKeys([]);
    }
  }, [initData, form]);

  // --- 树形 Checkbox 联动和状态管理 ---
  const onCheck: TreeProps["onCheck"] = (checked) => {
    let newCheckedKeys: React.Key[];

    // Ant Design 的 onCheck 回调的第一个参数 'checked'
    // 可能是 Key[] (当 checkStrictly 为 true 时)
    // 或者是 { checked: Key[]; halfChecked: Key[]; } (当 checkStrictly 为 false 时，默认行为)
    if (Array.isArray(checked)) {
      newCheckedKeys = checked;
    } else {
      newCheckedKeys = checked.checked;
    }

    setCheckedKeys(newCheckedKeys);

    // 更新 currentPermissionsMap 的 checked 状态 (即是否有该路由的权限)
    const newPermissionsMap = new Map(currentPermissionsMap);

    allLeafKeys.forEach((leafKey) => {
      const isChecked = newCheckedKeys.includes(leafKey); // 使用新解析的 newCheckedKeys
      const existsInMap = newPermissionsMap.has(leafKey);

      if (isChecked && !existsInMap) {
        // 新勾选的叶子节点，默认只读
        newPermissionsMap.set(leafKey, ["read"]);
      } else if (!isChecked && existsInMap) {
        // 取消勾选的叶子节点，从 map 中移除
        newPermissionsMap.delete(leafKey);
      }
    });
    setCurrentPermissionsMap(newPermissionsMap);
  };

  // 渲染自定义节点标题 (用于在叶子节点后添加 actions Checkbox)
  const renderTreeNodeTitle = (node: DataNode) => {
    const typedNode = node as {
      key: string;
      title: string;
      children?: DataNode[];
    };

    // 只有叶子节点才显示 actions Checkbox
    const isLeaf = !typedNode.children || typedNode.children.length === 0;
    // 判断该路由节点是否被勾选
    const isNodeChecked = checkedKeys.includes(typedNode.key);

    // 获取当前路由的 actions 状态
    const actions = currentPermissionsMap.get(typedNode.key as string) || [];
    const isRead = actions.includes("read");
    const isWrite = actions.includes("write");

    // actions Checkbox 的禁用状态：如果路由节点未被勾选，则禁用
    const actionsDisabled = !isNodeChecked;

    const handleActionChange = (
      actionType: "read" | "write",
      e: CheckboxChangeEvent
    ) => {
      const checked = e.target.checked;
      const newActions = new Set(
        currentPermissionsMap.get(typedNode.key as string) || []
      ); // 使用 Set 方便增删

      if (actionType === "read") {
        if (checked) {
          newActions.add("read");
        } else {
          if (isWrite) {
            // 只读不能单独取消，如果写选了，走正常逻辑（允许取消读？）
            newActions.delete("read");
            newActions.delete("write");
          } else if (newActions.size === 1) {
            // 只剩只读时，不允许取消
            return; // 强行拦截，直接什么都不做
          } else {
            newActions.delete("read");
          }
        }
      } else if (actionType === "write") {
        if (checked) {
          newActions.add("write");
          newActions.add("read"); // 勾选写，自动勾选读
        } else {
          newActions.delete("write");
        }
      }

      const updatedPermissionsMap = new Map(currentPermissionsMap);
      updatedPermissionsMap.set(
        typedNode.key as string,
        Array.from(newActions)
      );
      setCurrentPermissionsMap(updatedPermissionsMap);
    };

    return (
      <Space>
        <span>{typedNode.title}</span>
        {isLeaf && (
          <Space>
            <span
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
            >
              <Checkbox
                checked={isRead}
                disabled={actionsDisabled || isWrite}
                onChange={(e) => handleActionChange("read", e)}
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                }}
              >
                {t("page.roleManagement.readOnly")}
              </Checkbox>
            </span>

            <span
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
            >
              <Checkbox
                checked={isWrite}
                disabled={actionsDisabled || !isRead} // 如果只读没选中，写也应该被禁用
                onChange={(e) => handleActionChange("write", e)}
              >
                {t("page.roleManagement.readWrite")}
              </Checkbox>
            </span>
          </Space>
        )}
      </Space>
    );
  };

  // --- 全选/全不选功能 ---
  const handleSelectAllRoutes = () => {
    // 勾选所有叶子节点
    setCheckedKeys(allLeafKeys);

    // 更新 currentPermissionsMap，所有叶子节点默认只读
    const newPermissionsMap = new Map(currentPermissionsMap);
    allLeafKeys.forEach((leafKey) => {
      if (!newPermissionsMap.has(leafKey)) {
        newPermissionsMap.set(leafKey, ["read"]);
      } else {
        // 如果已经存在，确保至少是只读
        const currentActions = newPermissionsMap.get(leafKey)!;
        if (!currentActions.includes("read")) {
          currentActions.push("read");
          newPermissionsMap.set(leafKey, currentActions);
        }
      }
    });
    setCurrentPermissionsMap(newPermissionsMap);
  };

  const handleDeselectAllRoutes = () => {
    setCheckedKeys([]);
    setCurrentPermissionsMap(new Map()); // 清空所有权限
  };

  // --- Actions 批量设置功能 ---
  const handleSetAllActionsToRead = () => {
    const updatedPermissionsMap = new Map(currentPermissionsMap);
    checkedKeys.forEach((key) => {
      if (allLeafKeys.includes(key as string)) {
        // 确保是叶子节点
        updatedPermissionsMap.set(key as string, ["read"]);
      }
    });
    setCurrentPermissionsMap(updatedPermissionsMap);
  };

  const handleSetAllActionsToReadWrite = () => {
    const updatedPermissionsMap = new Map(currentPermissionsMap);
    checkedKeys.forEach((key) => {
      if (allLeafKeys.includes(key as string)) {
        // 确保是叶子节点
        updatedPermissionsMap.set(key as string, ["read", "write"]);
      }
    });
    setCurrentPermissionsMap(updatedPermissionsMap);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      name="upsert_role_form"
      initialValues={{ id: initData?.id }}
    >
      {/* 隐藏的ID字段，用于编辑模式 */}
      {type === "edit" && (
        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item
        name="roleName"
        label={t("page.roleManagement.roleName")}
        rules={[
          {
            required: true,
            message: `${t("page.roleManagement.rolePlaceholder")}`,
          },
        ]}
      >
        <Input placeholder={t("page.roleManagement.rolePlaceholder")} />
      </Form.Item>

      <Form.Item
        name="description"
        label={t("page.roleManagement.description")}
      >
        <Input.TextArea
          rows={3}
          placeholder={t("page.roleManagement.descriptionPlaceholder")}
        />
      </Form.Item>

      <Form.Item label={t("page.roleManagement.permissionConfig")}>
        <Space direction="vertical">
          <Space style={{ marginTop: 8, marginBottom: 12 }}>
            <Button type="primary" onClick={handleSelectAllRoutes}>
              {t("page.roleManagement.selectAllRoutes")}
            </Button>
            <Button type="primary" danger onClick={handleDeselectAllRoutes}>
              {t("page.roleManagement.deselectAllRoutes")}
            </Button>
            {/* <span className="my-0 mx-2">|</span> */}
            <br />
          </Space>

          <Space style={{ marginBottom: 16 }}>
            <Button
              color="primary"
              variant="outlined"
              onClick={handleSetAllActionsToRead}
            >
              {t("page.roleManagement.allRoutesReadOnly")}
            </Button>
            <Button
              color="primary"
              variant="outlined"
              onClick={handleSetAllActionsToReadWrite}
            >
              {t("page.roleManagement.allRoutesWrite")}
            </Button>
          </Space>
        </Space>

        <Tree
          checkable // 开启 Checkbox
          onCheck={onCheck}
          checkedKeys={checkedKeys}
          treeData={menuTreeData}
          titleRender={renderTreeNodeTitle} // 自定义节点标题渲染
          selectable={false} // 禁用节点选中高亮
          // 默认展开所有节点方便操作
          defaultExpandAll={true}
        />
      </Form.Item>
    </Form>
  );
});

export default UpsertRole;
