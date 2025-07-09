import axios from "@/config/request.ts";

// 创建/更新用户
export const apiUpsertRole = (params: any) =>
  axios.post(`/roles/upsertRole`, params);

// 删除用户
export const apiDeleteRole = (id: string) =>
  axios.delete(`/roles/deleteRole/${id}`);

// 查询用户列表
export const apiGetRoleList = (params: { page: number; pageSize: number }) =>
  axios.get(`/roles/getRoleList`, { params });
